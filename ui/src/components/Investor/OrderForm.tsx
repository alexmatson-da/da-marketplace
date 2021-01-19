import React, { useState } from 'react'
import { Button, Form } from 'semantic-ui-react'

import { useParty, useLedger } from '@daml/react'
import { Id } from '@daml.js/da-marketplace/lib/DA/Finance/Types/module'
import { ExchangeParticipant } from '@daml.js/da-marketplace/lib/Marketplace/ExchangeParticipant'

import { DepositInfo, wrapDamlTuple } from '../common/damlTypes'
import { AppError } from '../common/errorTypes'
import { useOperator } from '../common/common'
import { preciseInputSteps } from '../common/utils'
import FormErrorHandled from '../common/FormErrorHandled'

import { OrderKind } from './InvestorTrade'

type Props = {
    assetPrecisions: [ number, number ];
    deposits: [ DepositInfo[], DepositInfo[] ];
    exchange: string;
    tokenPair: Id[];
}

const OrderForm: React.FC<Props> = ({
    assetPrecisions,
    deposits,
    exchange,
    tokenPair
}) => {
    const [ price, setPrice ] = useState('');
    const [ amountQuote, setAmountQuote ] = useState('');
    const [ amountBase, setAmountBase ] = useState('');

    const ledger = useLedger();
    const operator = useOperator();
    const investor = useParty();

    const [ bidDeposits, offerDeposits ] = deposits;
    const [ baseLabel, quoteLabel ] = tokenPair.map(t => t.label);
    const [ basePrecision, quotePrecision ] = assetPrecisions;

    const validateDeposits = (deposits: DepositInfo[], amount: string): string[] => {
        const totalAvailableAmount = deposits.reduce(
            (sum, d) => sum + +d.contractData.asset.quantity, 0);

        if (+amount > totalAvailableAmount) {
            const tokenLabel = deposits[0]?.contractData.asset.id.label;
            throw new AppError(`Insufficient ${tokenLabel} amount. Try:`, [
                `Allocating funds to the exchange or`,
                `Depositing funds to your account`,
            ]);
        }
        return deposits.map(d => d.contractId);
    };

    const placeOrder = async (kind: OrderKind, deposits: DepositInfo[], amount: string) => {
        const depositCids = validateDeposits(deposits, amount);

        const key = wrapDamlTuple([exchange, operator, investor]);
        const args = {
            price,
            amount,
            depositCids,
            pair: wrapDamlTuple(tokenPair)
        }

        if (kind === OrderKind.BID) {
            await ledger.exerciseByKey(ExchangeParticipant.ExchangeParticipant_PlaceBid, key, args);
        } else if (kind === OrderKind.OFFER) {
            await ledger.exerciseByKey(ExchangeParticipant.ExchangeParticipant_PlaceOffer, key, args);
        }
    }

    const placeBid = async () => placeOrder(OrderKind.BID, bidDeposits, amountQuote);
    const placeOffer = async () => placeOrder(OrderKind.OFFER, offerDeposits, amountBase);

    const computeValues = (
        value: string,
        precision: number,
        field: 'price' | 'amount' | 'total',
        callback: (value: React.SetStateAction<string>) => void
    ) => {
        if (!validateInput(value, precision, callback)) {
            return;
        }

        switch(field) {
            case 'amount':
                const quoteTotal = +value * +price;
                setAmountQuote(quoteTotal.toFixed(quotePrecision));
                break;
            case 'total':
                const baseTotal = +price !== 0 ? +value / +price : 0;
                setAmountBase(baseTotal.toFixed(basePrecision));
                break;
            case 'price':
                const quotePrice = +value * +amountBase;
                setAmountQuote(quotePrice.toFixed(quotePrecision));
                break;
        }
    }

    const validateInput = (
        value: string,
        precision: number,
        callback: (value: React.SetStateAction<string>) => void
    ): boolean => {
        const fractional = value.split(".")[1];
        if (fractional && fractional.length > precision) {
            return false;
        }

        callback(value);
        return true;
    }

    const priceInput = preciseInputSteps(quotePrecision);
    const amountQuoteInput = preciseInputSteps(quotePrecision)
    const amountBaseInput = preciseInputSteps(basePrecision);

    const disableButton =
        !price || +price === 0 ||
        !amountBase || +amountBase === 0 ||
        !amountQuote || +amountQuote === 0;

    return (
        <FormErrorHandled onSubmit={async () => {}} className='order-form'>
            { loadAndCatch => <>
                <Form.Field>
                    <label className='order-label'>Price</label>
                    <input
                        className='order-input'
                        value={price}
                        placeholder={priceInput.placeholder}
                        onChange={e =>
                            computeValues(e.target.value, quotePrecision, 'price', setPrice)}/>
                    <label className='order-label badge'>{quoteLabel}</label>
                </Form.Field>

                <Form.Field>
                    <label className='order-label'>Amount</label>
                    <input
                        className='order-input'
                        placeholder={amountBaseInput.placeholder}
                        value={amountBase}
                        onChange={e =>
                            computeValues(e.target.value, basePrecision, 'amount', setAmountBase)}/>
                    <label className='order-label badge'>{baseLabel}</label>
                </Form.Field>

                <Form.Field>
                    <label className='order-label'>Total</label>
                    <input
                        className='order-input'
                        placeholder={amountQuoteInput.placeholder}
                        value={amountQuote}
                        onChange={e =>
                            computeValues(e.target.value, quotePrecision, 'total', setAmountQuote)}/>
                    <label className='order-label badge'>{quoteLabel}</label>
                </Form.Field>

                <div className='buttons'>
                    <Button
                        primary
                        type='button'
                        className='buy'
                        disabled={disableButton}
                        onClick={() => loadAndCatch(placeBid)}>
                            Bid
                    </Button>

                    <Button
                        primary
                        type='button'
                        className='sell'
                        disabled={disableButton}
                        onClick={() => loadAndCatch(placeOffer)}>
                            Offer
                    </Button>
                </div></>
            }
        </FormErrorHandled>
    )
}

export default OrderForm;
