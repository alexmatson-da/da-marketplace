dar_version := $(shell grep "^version" daml.yaml | sed 's/version: //g')
exberry_adapter_version := $(shell cd exberry_adapter && poetry version | cut -f 2 -d ' ')
operator_bot_version := $(shell cd automation/operator && poetry version | cut -f 2 -d ' ')
issuer_bot_version := $(shell cd automation/issuer && poetry version | cut -f 2 -d ' ')
custodian_bot_version := $(shell cd automation/custodian && poetry version | cut -f 2 -d ' ')
ui_version := $(shell node -p "require(\"./ui/package.json\").version")


state_dir := .dev
daml_build_log = $(state_dir)/daml_build.log
sandbox_pid := $(state_dir)/sandbox.pid
sandbox_log := $(state_dir)/sandbox.log

exberry_adapter_dir := exberry_adapter/bot.egg-info
adapter_pid := $(state_dir)/adapter.pid
adapter_log := $(state_dir)/adapter.log

operator_bot_dir := automation/operator/bot.egg-info
operator_pid := $(state_dir)/operator.pid
operator_log := $(state_dir)/operator.log

issuer_bot_dir := automation/issuer/bot.egg-info
issuer_pid := $(state_dir)/issuer.pid
issuer_log := $(state_dir)/issuer.log

custodian_bot_dir := automation/custodian/bot.egg-info
custodian_pid := $(state_dir)/custodian.pid
custodian_log := $(state_dir)/custodian.log


### DAML server
.PHONY: clean stop_daml_server stop_operator stop_issuer stop_custodian stop_adapter

$(state_dir):
	mkdir $(state_dir)

$(daml_build_log): |$(state_dir)
	daml build > $(daml_build_log)

$(sandbox_pid): |$(daml_build_log)
	daml start > $(sandbox_log) & echo "$$!" > $(sandbox_pid)

start_daml_server: $(sandbox_pid)

stop_daml_server:
	pkill -F $(sandbox_pid) && rm -f $(sandbox_pid) $(sandbox_log)


### DA Marketplace Operator Bot
$(operator_bot_dir):
	cd automation/operator && poetry install && poetry build

$(operator_pid): |$(state_dir) $(operator_bot_dir)
	cd automation/operator && (DAML_LEDGER_URL=localhost:6865 poetry run python bot/operator_bot.py > ../$(operator_log) & echo "$$!" > ../$(operator_pid))

start_operator: $(operator_pid)

stop_operator:
	pkill -F $(operator_pid) && rm -f $(operator_pid) $(operator_log)

### DA Marketplace Issuer Bot
$(issuer_bot_dir):
	cd automation/issuer && poetry install && poetry build

$(issuer_pid): |$(state_dir) $(issuer_bot_dir)
	cd automation/issuer && (DAML_LEDGER_URL=localhost:6865 poetry run python bot/issuer_bot.py > ../$(issuer_log) & echo "$$!" > ../$(issuer_pid))

start_issuer: $(issuer_pid)

stop_issuer:
	pkill -F $(issuer_pid) && rm -f $(issuer_pid) $(issuer_log)


### DA Marketplace Custodian Bot
$(custodian_bot_dir):
	cd automation/custodian && poetry install && poetry build

$(custodian_pid): |$(state_dir) $(custodian_bot_dir)
	cd automation/custodian && (DAML_LEDGER_URL=localhost:6865 poetry run python bot/custodian_bot.py > ../$(custodian_log) & echo "$$!" > ../$(custodian_pid))

start_custodian: $(custodian_pid)

stop_custodian:
	pkill -F $(custodian_pid) && rm -f $(custodian_pid) $(custodian_log)


### DA Marketplace <> Exberry Adapter
$(exberry_adapter_dir):
	cd exberry_adapter && poetry install && poetry build

$(adapter_pid): |$(state_dir) $(exberry_adapter_dir)
	cd exberry_adapter && (DAML_LEDGER_URL=localhost:6865 poetry run python bot/exberry_adapter_bot.py > ../$(adapter_log) & echo "$$!" > ../$(adapter_pid))

start_adapter: $(adapter_pid)

stop_adapter:
	pkill -F $(adapter_pid) && rm -f $(adapter_pid) $(adapter_log)


target_dir := target

dar := $(target_dir)/da-marketplace-model-$(dar_version).dar
exberry_adapter := $(target_dir)/da-marketplace-exberry-adapter-$(exberry_adapter_version).tar.gz
operator_bot := $(target_dir)/da-marketplace-operator-bot-$(operator_bot_version).tar.gz
issuer_bot := $(target_dir)/da-marketplace-issuer-bot-$(issuer_bot_version).tar.gz
custodian_bot := $(target_dir)/da-marketplace-custodian-bot-$(custodian_bot_version).tar.gz
ui := $(target_dir)/da-marketplace-ui-$(ui_version).zip

$(target_dir):
	mkdir $@

.PHONY: package
package: $(operator_bot) $(issuer_bot) $(custodian_bot) $(exberry_adapter) $(dar) $(ui)
	cd $(target_dir) && zip da-marketplace.zip *

$(dar): $(target_dir) $(daml_build_log)
	cp .daml/dist/da-marketplace-$(dar_version).dar $@

$(operator_bot): $(target_dir) $(operator_bot_dir)
	cp automation/operator/dist/bot-$(operator_bot_version).tar.gz $@

$(issuer_bot): $(target_dir) $(issuer_bot_dir)
	cp automation/issuer/dist/bot-$(issuer_bot_version).tar.gz $@

$(custodian_bot): $(target_dir) $(custodian_bot_dir)
	cp automation/custodian/dist/bot-$(custodian_bot_version).tar.gz $@

$(exberry_adapter): $(target_dir) $(exberry_adapter_dir)
	cp exberry_adapter/dist/bot-$(exberry_adapter_version).tar.gz $@

$(ui):
	daml codegen js .daml/dist/da-marketplace-$(dar_version).dar -o daml.js
	cd ui && yarn install
	cd ui && yarn build
	cd ui && zip -r da-marketplace-ui-$(ui_version).zip build
	mv ui/da-marketplace-ui-$(ui_version).zip $@
	rm -r ui/build

.PHONY: clean
clean: clean-ui
	rm -rf $(state_dir) $(exberry_adapter_dir) $(exberry_adapter) $(operator_bot_dir) $(operator_bot) $(issuer_bot_dir) $(issuer_bot) $(custodian_bot_dir) $(custodian_bot) $(dar) $(ui)

clean-ui:
	rm -rf $(ui) daml.js ui/node_modules ui/build ui/yarn.lock
