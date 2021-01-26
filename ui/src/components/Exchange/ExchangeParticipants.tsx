import React, { useState } from 'react'

import { useParty, useLedger } from '@daml/react'

import { Header } from 'semantic-ui-react'

import { AddPlusIcon } from '../../icons/Icons'

import { AssetDeposit } from '@daml.js/da-marketplace/lib/DA/Finance/Asset'
import { Order } from '@daml.js/da-marketplace/lib/Marketplace/Trading'
import { ExchangeParticipant } from '@daml.js/da-marketplace/lib/Marketplace/ExchangeParticipant'
import { Exchange } from '@daml.js/da-marketplace/lib/Marketplace/Exchange'
import { RegisteredInvestor } from '@daml.js/da-marketplace/lib/Marketplace/Registry'

import { UserIcon } from '../../icons/Icons'
import { useContractQuery } from '../../websocket/queryStream'

import { depositSummary } from '../common/utils'
import StripedTable from '../common/StripedTable'
import PageSection from '../common/PageSection'
import Page from '../common/Page'
import { wrapDamlTuple, ContractInfo } from '../common/damlTypes'
import { useOperator } from '../common/common'
import AddRegisteredPartyModal from '../common/AddRegisteredPartyModal'

type Props = {
    sideNav: React.ReactElement;
    onLogout: () => void;
    registeredInvestors: ContractInfo<RegisteredInvestor>[]
}

const ExchangeParticipants: React.FC<Props> = ({ sideNav, onLogout, registeredInvestors }) => {
    const [ showAddRelationshipModal, setShowAddRelationshipModal ] = useState(false);

    const allDeposits = useContractQuery(AssetDeposit);
    const exchangeParticipants = useContractQuery(ExchangeParticipant);
    const activeOrders = useContractQuery(Order);

    const ledger = useLedger();
    const exchange = useParty();
    const operator = useOperator();

    const handleExchParticipantInviteSubmit = async (party: string) => {
        const choice = Exchange.Exchange_InviteParticipant;
        const key = wrapDamlTuple([operator, exchange]);
        const args = { exchParticipant: party };

        await ledger.exerciseByKey(choice, key, args);
    }

    const partyOptions = registeredInvestors.map(d => {
        return {
            text: `${d.contractData.name}`,
            value: d.contractData.investor
        }
    })

    const rows = exchangeParticipants.map(participant => {
        const { exchange, exchParticipant } = participant.contractData;

        const activeOrderCount = activeOrders.filter(o => o.contractData.exchange === exchange && o.contractData.exchParticipant === exchParticipant).length

        const investorDeposits = allDeposits.filter(deposit => deposit.contractData.account.owner === exchParticipant);

        return [exchParticipant, activeOrderCount.toString(), '-', depositSummary(investorDeposits).join(',') || '-']
    });

    return (
        <Page
            sideNav={sideNav}
            onLogout={onLogout}
            menuTitle={<><UserIcon size='24'/>Investors</>}
        >
            <PageSection>
                <div className='exchange-participants'>
                    <div className='title'>
                        <Header as='h2'>Exchange Participants</Header>
                        <a className='a2' onClick={()=> setShowAddRelationshipModal(true)}>
                            <AddPlusIcon/> Add Investor
                        </a>
                    </div>
                    <StripedTable
                        headings={['Id', 'Active Orders', 'Volume Traded (USD)', 'Amount Committed']}
                        rows={rows}/>
                    {showAddRelationshipModal &&
                        <AddRegisteredPartyModal
                            title='Add Investor'
                            partyOptions={partyOptions}
                            onRequestClose={() => setShowAddRelationshipModal(false)}
                            multiple={false}
                            emptyMessage='All registered investors have been added'
                            onSubmit={handleExchParticipantInviteSubmit}/>
                    }
                </div>
            </PageSection>
        </Page>
    )
}

export default ExchangeParticipants;
