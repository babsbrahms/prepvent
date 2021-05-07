import React, { Component } from 'react'
import { Statistic, Divider, Button, Icon, Header, Message, Segment } from 'semantic-ui-react';
import PaymentForm from '../Forms/Payment'
import style from '../Style/Style';
// import { getTicketStats } from '../../actions/register';
import goldCoin from '../../utils/images/goldCoin.jpg'

export default class Ticketing extends Component {
    constructor(props) {
        super(props);
        this.state ={
            bankDetails: {
                bankName: props.payment.bankName || '',
                accountNumber: props.payment.accountNumber || 0,
                accountName: props.payment.accountName || '',
            },
        }
    }
    

    // componentDidMount () {
      
    //     // this.getStats()
    // }


    // getStats =() => {
    //     const { ticket } = this.props;
    //         // if it contains type = donation
    //     var index = ticket.findIndex(val => val.type === 'donation')
        
    //     if (index < 0) {
    //         let format = ticket.map(tic => (
    //             { name: tic.name, 
    //             type: tic.type, 
    //             qtySold: tic.qtySold, 
    //             qty: tic.qty, 
    //             salesPrice: tic.salesPrice, 
    //             revenue: (tic.salesPrice * tic.qtySold) }))

    //         this.setState({ calc:{
    //             stats: format,
    //             ready: true
    //         } })
    //     } else {
    //         let ticketIds = [];
    //         let format = [];

    //         ticket.forEach(tic => {
    //            if (tic.type === 'donation') {
    //             ticketIds.push(tic._id)
    //            } else {
    //                format.push({
    //                     name: tic.name, 
    //                     type: tic.type, 
    //                     qtySold: tic.qtySold, 
    //                     qty: tic.qty, 
    //                     salesPrice: tic.salesPrice, 
    //                     revenue: (tic.salesPrice * tic.qtySold) 
    //                 })
    //            }
    //         });

    //         this.setState({ calc:{
    //             stats: format,
    //             ready: false
    //         } }, () => {            
    //           this.fetchStats(ticketIds)
    //         })

    //     }

    // } 

    // fetchStats = (ticketIds) => {
    //     const { addAlert } = this.props;
    //     getTicketStats(ticketIds)
    //     .then((res) => {
    //         if (res.data.error) {
    //             addAlert('Error', res.data.error , false, false)
    //         } else {
    //             this.setState({ 
    //                 calc :{
    //                     stats: [...this.state.calc.stats, ...res.data.stats],
    //                     ready: true
    //                 } 
    //             })
    //         }

    //     })
    //     .catch((error) => {
    //         addAlert('Error', `${error.msg || 'Problem getting your ticket stats'}`)
    //     })
    // }

    updateBankPayment = () => {
        const { bankDetails } = this.state;
        const { addAlert, submitPaymentForm } = this.props;

        if (!bankDetails.bankName || !bankDetails.accountName || !bankDetails.accountNumber)  {
            addAlert('Error', 'Complete the payment details form', false, false) 
        } else  { 
            addAlert('Info', 'Making request to update payment details')
            submitPaymentForm(bankDetails)
        }
    }

    collectPayment = () => {
        const { eventId, userId, getPayed, ticket} = this.props;
        let ticketIds = ticket.map(x => x._id)

        getPayed(eventId, userId, ticketIds)
    }

    getTicket = () => {
        const { addAlert, getTicket, eventId } = this.props;
        addAlert('Info', 'Making request to fecth ticket', true, false)

        getTicket(eventId)
    }


    render() {
        const { ticket, ticketChargeRate, currency, fetchingTicket } = this.props;
        const { bankDetails } = this.state;
        
        return (
            <div>
                {(ticket.length === 0) && (
                    <div style={style.center}>
                        <Button color="pink" size='large' disabled={fetchingTicket} onClick={this.getTicket}>{(fetchingTicket)? <Icon name="spinner" loading/> : "Get ticket"}</Button>
                    </div>
                )}

                {(ticket.length > 0) && (<div style={{ backgroundImage: `url(${goldCoin})`, backgroundRepeat: 'no-repeat', backgroundSize: "cover"}}>
                    <div style={{ backgroundColor: 'white', opacity: 0.8}}>
                        <div style={{ backgroundColor: 'black', opacity: 0.8}}>
                            <Statistic.Group inverted widths={2}>
                                    <Statistic key={'total'}>
                                        <Statistic.Label>Total Revenue</Statistic.Label>
                                        <Statistic.Value>{ticket.map(a => a.revenue).reduce((acc, curr) => acc + curr, 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currency.abbr.toLocaleUpperCase()}</Statistic.Value>  
                                    </Statistic>
                                    <Statistic key={'profit'}>
                                        <Statistic.Label>Profit</Statistic.Label>
                                        <Statistic.Value>{(ticket.map(a => a.revenue).reduce((acc, curr) => acc + curr, 0) * (1 - (ticketChargeRate/100))).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currency.abbr.toLocaleUpperCase()}</Statistic.Value>  
                                    </Statistic>
                            </Statistic.Group>
                        </div>
                        <Divider />
        
                        <br />
                        <br />

                        <div>
                            <Statistic.Group widths={ticket.length}>
                                {ticket.map(tic => (
                                    <Statistic key={tic.name}>
                                        <Statistic.Label>{tic.name}</Statistic.Label>
                                        <Statistic.Label>Capacity: {tic.qty}</Statistic.Label>
                                        <Statistic.Label>Ticket Sold: {tic.qtySold}</Statistic.Label>
                                        <Statistic.Label>Ticket Remaining: {tic.qty - tic.qtySold}</Statistic.Label>
                                        <Statistic.Label>Price per Ticket: {tic.type !== 'donation'? `${tic.salesPrice} ${currency.abbr}` : 'varies'} </Statistic.Label>
                                        <Statistic.Value>{tic.revenue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currency.abbr} </Statistic.Value>  
                                    </Statistic>
                                ))}
                            </Statistic.Group>
                        </div>
                        <br />
                    </div>
                </div>)}

                    <Divider />

                    <Header size='huge'>
                        <Header.Content>
                            Payment Detail
                        </Header.Content>
                    </Header>

                    <PaymentForm 
                    save={() => this.updateBankPayment()}
                    payment={bankDetails} 
                    onChange = {(e) => this.setState({ bankDetails: {...this.state.bankDetails, [e.name]: e.value } })}
                    onChangeBank = {(bankName) => this.setState({ bankDetails: {...this.state.bankDetails, bankName } })}
                    />
                    <br />
                    {/* <div style={style.alignedRight}>
                        <Button color='pink' onClick={() => this.updateBankPayment()}>Save</Button>
                    </div> */}
                    <Divider />
                    <Header as='h1'>
                        <Header.Content>
                            Request For Payment
                        </Header.Content>
                    </Header>
                    <Message>
                        <Message.Content>
                            All event payment will be process within 2-7 working days after your event ends. Payments are issued after 2-3 days to verify that there are no complaint made against you that your event did not take place or fraud.
                        </Message.Content>
                    </Message>
                    {/* <Button color='pink' disabled={moment.utc().valueOf() < moment.utc(endTime).valueOf()} onClick={() => this.collectPayment()} >
                        <Icon name='money' />
                        Collect payment
                    </Button> */}
                
            </div>
        )
    }
}
