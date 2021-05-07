import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import moment from 'moment';
// import { Link } from 'react-router-dom';
import validator from 'validator'
import parser from 'html-react-parser'
import qs from 'query-string';
import { Button, Modal, Icon, Form, Checkbox, Tab , Header, Dropdown, Divider, Segment, Loader, Dimmer, Message, Breadcrumb, Confirm } from 'semantic-ui-react'
import EventPage from '../Views/Event';
import { getEvent, getTicket, registeringTicket, verifyTicket, cancelTicket } from '../../actions/event';
import { resendTicket } from '../../actions/register';
import MessageBox  from '../Views/MessageBox';
import getEventById from '../reselect/allEvents';
import PayStack from '../Views/PayStack'
import style from '../Style/Style';

export class Event extends Component {
    constructor(props) {
        super(props);
        this.state = {
            qty: 1,
            ticketIndex: 0,
            eventId: props.match.params.eventId,
            data: {},
            registration: [],
            modalOpen: false,
            loading: true,
            donationPrice: '',
            totalDonationPrice: 0,
            donationError: '',
            validating: false,
            validationError: '',
            paymentOpen: false,
            paymentDetails: {
                email: '',
                amount: 0,
                timer: 600000,
                response: null,
                subscribe: true,
                state: '',
                country: '',
            },
            open: false,
            ticketOption: '', // register|| cancel ||resend
            cancel: {
                email: '',
                registrationNumber: '',
                error: ''
            },
            resend: {
                email: '',
                error: ''
            },
            gotTicket: false,
            pid: '',
            disableModal: false

        }
        this.messageBox = React.createRef()
    }
    // componentWillMount() {
    //     document.title = `PrepVENT | ${this.props.match.params.eventName}`;
    //     document.querySelector('meta[name="description"]').setAttribute("content", `Explore "${this.props.match.params.eventNmae}" event`);
    // }
    componentDidMount() {
        const { eventId } = this.state;

        let params = qs.parseUrl(this.props.location.search)

        if (params.query.pid) {
            this.setState({ pid: params.query.pid})
        }
        this.fetchLocalEvent( eventId )
    }

    // componentWillReceiveProps(nextProps) { 
    //     if (nextProps.match &&nextProps.match.params.eventId) {
    //         console.log('next: ', nextProps.match.params.eventId);
    //         this.fetchLocalEvent(nextProps.match.params.eventId)
    //     }
    // }
    

    fetchLocalEvent= ( eventId ) => {
        const { localEvent } = this.props;

        if (localEvent) {
            
            this.setState({ loading: false, data: localEvent }, () => {
                window.history.replaceState(null, `PrepVENT | ${this.state.data.name}`, `/event/${this.state.data._id}/${encodeURI(this.state.data.name)}` );                
            })
        } else {
            
            this.getEvent(eventId)
        }
    }

    getEvent = (id) => {
        getEvent(id)
        .then((result) => {
            if (result.data.event && result.data.event._id ) {
                this.setState({ loading: false, data: result.data.event }, () => {
                    window.history.replaceState(null, `PrepVENT | ${this.state.data.name}`, `/event/${this.state.data._id}/${encodeURI(this.state.data.name)}` );
                    // document.title = `PrepVENT | ${this.state.data.name}`;
                    // document.querySelector('meta[name="description"]').setAttribute("content", `Explore "${this.state.data.name}" event - ${this.state.data.promoText}`);  
                })
            } else {
                this.messageBox.addMessage('Error', result.data.error || result.data.msg, false, true)
            }
        })
        .catch(error => this.messageBox.addMessage('Error', `${error.msg || 'Error fetching event'}`, false, true))
    }

    checkForTicekts = () =>  {
        const { gotTicket } = this.state;
        if (this.state.data.ticket.length === 0 && !gotTicket) {
                const { eventId } = this.state;
                
                getTicket(eventId)
                .then(result => this.setState({ data: { ...this.state.data, ticket: result.data.ticket }, gotTicket: true }, () => this.getQty() ))
                .catch(error => { 
                    this.messageBox.addMessage('Error', `${error.msg || 'Error fetching tickets'}`, false, false)
                })
        }
    }

    // to get the initial ticket qty when ticket is fetched
    getQty = () => {
        const {data, ticketIndex} = this.state;
        if (data.ticket.length > 0) {
            this.setState({ qty: data.ticket[ticketIndex].qtyRange.min }, () => this.changeQty(this.state.qty, this.state.ticketIndex))
        }
    }

    // when Tab is changed => recalulate regitration array
    changeQty = (qty, index) => {
        const { eventId, data } = this.state;
        let type = data.ticket[index].notificationChannel;
        let ticketName = data.ticket[index].name;
        let ticketType = data.ticket[index].type;
        let price = data.ticket[index].salesPrice;
        let ticketId = data.ticket[index]._id;

        let regArray = new Array(qty).fill('hi').map(regy => ({ 
            ticketId,
            eventId: eventId,
            registrationNumber: 0,
            contactType: type,
            contact: '',
            ticketName,
            ticketType,
            ticketPrice: price,
            fullname: '', 
            active: true,
            // salesDate:  ,
            cancellationDate: null,
            refunded: false
        }));
        this.setState({ registration: regArray });
    }

    // when qty is changed in same tab => modify regitration array length
    changeTicketQty = (qty, index) => {
        const { eventId, data } = this.state;

        let regArray = this.state.registration;
        let type = data.ticket[index].notificationChannel;
        let ticketName = data.ticket[index].name;
        let ticketType = data.ticket[index].type;
        let price = data.ticket[index].salesPrice;
        let ticketId = data.ticket[index]._id;

        if (regArray.length > qty) {
            let count = regArray.length - qty;
            regArray.splice(qty, count);
        } else if (regArray.length < qty) {
            let count =  qty - regArray.length ;
            let newOne = new Array(count).fill('hi').map(regy => ({ 
                ticketId,
                eventId: eventId,
                registrationNumber: 0,
                contactType: type,
                contact: '',
                ticketName,
                ticketType,
                ticketPrice: price,
                fullname: '', 
                active: true,
                // salesDate:  ,
                cancellationDate: null,
                refunded: false
            }));
            
            regArray = regArray.concat(newOne)
        }
        this.setState({ registration: regArray }, () => {
            if (this.state.data.ticket[index].type === 'donation') {
                this.calcTotalDonation()
            }
        });
    }

    // add ticket retration data: contact and fullname
    onChange =(e, index) => {
        const { registration } = this.state;

        registration[index][e.target.name] = e.target.value;
        this.setState({ registration: [ ...registration ]})
    }
    
    // calculate totalDonationPrice(number) from donationPrice(string) and qty(no of ticket for donation)
    calcTotalDonation = () => {
        const {donationPrice, qty } = this.state;
        let totalDonationPrice = 0;

        new Array(qty).fill('hi').forEach((i, index ) => {
            totalDonationPrice += Number(donationPrice.split(',')[index]) || Number(donationPrice.split(',')[donationPrice.split(',').length - 1])
        });

        this.setState({ totalDonationPrice, donationError: Number.isNaN(totalDonationPrice)? 'Acceptable values are numbers and commas': '' })
    }


    // validate ticket for error before
    validateTicket = () => {
        // make use all value is email or phoneNumber depending on the type
        
        const { registration, donationPrice, data, ticketIndex, totalDonationPrice } = this.state;
        let error = ''
        this.setState({ validating: true, validationError: '' }, () => {
            registration.forEach((reg, index) => {
                // arr the array imput is not empty
                if(!reg.fullname || !reg.contact) {
                    error = 'Complete the form to purchase your ticket(s)'
                }
                // validate the phone number and email
                if ((reg.contactType === 'email') && (!validator.isEmail(reg.contact))) {
                    error = `Enter a valid email address for Ticket ${index + 1}`
                } 
                
                if ((reg.contactType === 'sms') && (!validator.isMobilePhone(reg.contact, ['en-NG'], { strictMode: true }))) {
                    error = 'Enter a valid phone number'
                }

                // make sure email is unique
            })

            if (error) {
                this.setState({ validating: false, validationError: error })
            } else {
                // buyer mail
                if ( !validator.isEmail(this.state.paymentDetails.email) ) {
                    this.setState({ validating: false, validationError: 'Enter your valid email address for notifcation' })
                } else if ((data.ticket[ticketIndex].type === 'donation') && !donationPrice) {
                    // emtpty donation
                    this.setState({ validating: false, validationError: 'Donation amount cannot be blank' })
                } else if (Number.isNaN(totalDonationPrice)) {
                    // acceptable donation amount
                    this.setState({ validating: false, validationError: 'Acceptable donation values are numbers and commas' })
                } else {
                    this.setState({ validationError: '', validating: false }, () => {
                        this.buyTicket()
                    }) 
                }
   
            }
        })

    }

    // sanitize data, assign donation price and make sure i can buy (salesPeriod) ticket
    buyTicket = async () => {
        const { registration, data, totalDonationPrice, qty, ticketIndex, donationPrice, paymentDetails } = this.state;
        let canBuy = false;
        let totalPrice = 0;
        let buyerContact = paymentDetails.email;


        // disable the ticket modal using loading && modalOpen
        this.messageBox.addMessage('Info', 'Validating your ticket...', true, false)
        await this.setState({ modalOpen: false })
 
        // get to totalPrice
        totalPrice = (data.ticket[ticketIndex].type === 'donation')? totalDonationPrice : (qty * data.ticket[ticketIndex].price)
        


        //assign prices for donation ticket
        if (data.ticket[ticketIndex].type === 'donation') {
            let newReg = registration.map((reg,index) => ({
                ...reg,
                ticketPrice: Number(donationPrice.split(',')[index]) || Number(donationPrice.split(',')[donationPrice.split(',').length - 1])
            }))

            this.setState({ registration: newReg })
        }

        // made sure the ticket is in the sales period
        canBuy = moment.utc().valueOf() < moment.utc(data.time.start).valueOf() - data.ticket[ticketIndex].sales.end
        
        // pay for ticket and save ticket
        if (canBuy) { 
            this.setState({ disableModal: true, modalOpen: false }, () => {
                this.verifyTicketInfo(totalPrice, buyerContact)
            })
        } else {
            this.messageBox.addMessage('Info', `Sorry, ${data.ticket[ticketIndex].name} ticket sales period has ended`, false, false)
        }

    }


    // verify ticket at the backend and prepare for payment
    verifyTicketInfo = (totalPrice, buyerContact) => {
        const { data, ticketIndex, registration } = this.state;

        verifyTicket(data.ticket[ticketIndex]._id, registration.length, data.time.start)
        .then(res => {
            //300000ms = 10min
            if (res.data.error) {
                this.setState({ disableModal: false }, () => {
                    this.messageBox.addMessage('Info', res.data.error, false, false)
                })
                
            } else {
                // process payment
                this.setState({ 
                    registration, 
                    disableModal: false,
                    paymentDetails: { 
                        ...this.state.paymentDetails, 
                        cartId: res.data.cartId,
                        email: buyerContact, 
                        amount: totalPrice, 
                        currency: data.currency
                        }
                    }, 
                    () => { 
                    if (totalPrice > 0) {
                        this.handleOpenPayment()
                    } else {
                        // buy ticket
                        this.saveRegisteredTicket()
                    }
                })
            }
        })
        .catch(() => {
            this.setState({ disableModal: false }, () => {
                if (this.messageBox) {
                    this.messageBox.addMessage('Info', 'Problem validating your ticket', false, false)
                }
            })
        })
    }

    // after payment close modal and savePayment to backend
    handlePayment = res => {
        const { paymentDetails, data } = this.state;

        this.setState({ paymentDetails: {...paymentDetails, response: res, state: data.location.state, country: data.location.country }}, () => {
            this.handleClosePayment()
            this.saveRegisteredTicket()
        })
    }

    // saving ticket to the backend
    saveRegisteredTicket = () => {
        const { registration, paymentDetails, pid } = this.state;

        this.messageBox.addMessage('Info', 'Please wait while your ticket is been purchased!!!', true, true) 

        registeringTicket(registration, paymentDetails, pid)
        .then((res) => {
            console.log(res);
            
            if (res.data.error) {
                this.messageBox.addMessage('Error', res.data.error , false, true)
            } else {
                this.messageBox.addMessage('Congratulations', `${res.data.msg}`, true, true) 
            }
            this.setState({ paymentDetails: {
                ...this.state.paymentDetails,
                cartId: '',
                email: '',
                amount: 0,
                response: null,
                subscribe: true
            }})
        })
        .catch(err => {
            console.log();
            
            this.messageBox.addMessage('Error', `${err.response.data.msg || 'Error buying your ticket.'}`, false, true)          
        })

    }

    // open payment modal
    handleOpenPayment = () => this.setState({ paymentOpen: true })

    // close paymentModal
    handleClosePayment = () => this.setState({ paymentOpen: false })

    // select either to reiger for ticket || cancel ticket || resend ticket mail
    pickTicketOption = option => this.setState({ ticketOption: option }, () => {
        if (option === 'register') {
            this.checkForTicekts()
        }
    })

    // cancel ticket validation and api call
    cancelTicket = () => {
        const { cancel, data } = this.state;
        this.setState({ cancel: { ...this.state.cancel, error: ''}}, () => {
            if (!cancel.email || !cancel.registrationNumber) {
                this.setState({ cancel: { ...this.state.cancel, error: 'Complete the ticket cancellation form' } })
            } else if (!validator.isEmail(cancel.email)) {
                this.setState({ cancel: { ...this.state.cancel, error: 'Enter a valid email address' } })
            } else {
                this.setState({ modalOpen: false }, () => {
                    this.messageBox.addMessage('Info', 'Making request for ticket cancellation', true, false)
                    cancelTicket(cancel.email, cancel.registrationNumber, data._id)
                    .then((res) => {
                        if (res.data.error) {
                            this.messageBox.addMessage('Error', res.data.error , false, false)
                        } else {
                            this.messageBox.addMessage('Success', `${res.data.msg || 'Your ticket is successfully cancelled'}`, true, false)
                        }
                    })
                    .catch(error => this.messageBox.addMessage('Error', `${error.msg || 'Problem cancelling your ticket'}`, true, true))
                })
            }
        });        
    }


    // resend ticket validation and api call
    resendTicket = () => {
        const { resend, data } = this.state;

        this.setState({ resend: { ...this.state.resend, error: '' } }, () => {
            if (!validator.isEmail(resend.email)) {
                this.setState({ resend: { ...this.state.resend, error: 'Enter a valid email address' } })
            } else {
                this.setState({ modalOpen: false }, () => {
                    this.messageBox.addMessage('Info', 'Making request to resend your ticket', true, false)
                    resendTicket(resend.email, data._id)
                    .then((res) => { 
                        if (res.data.error) {
                            this.messageBox.addMessage('Error', res.data.error , false, false)
                        } else {
                            this.messageBox.addMessage('Success', `${res.data.msg ||'Your ticket has been sent to your email'}`, true, false)
                        }
                    })
                    .catch(error => this.messageBox.addMessage('Error', `${error.msg || 'Problem sending your ticket'}`, true, false))
                })
            }
        })        
    }

    // ticket cancel confirm
    show = () => this.setState({ open: true })
    handleConfirm = () => this.setState({ open: false }, () => {
        this.cancelTicket()
    })
    handleCancel = () => this.setState({ open: false })
    render() {
        const { qty, ticketIndex, data, modalOpen, loading, donationPrice, totalDonationPrice, donationError, validating, validationError, ticketOption, cancel, resend, gotTicket, disableModal } = this.state;
        const { user, customer, hostname } = this.props;
        
        const panes = !!data.ticket && data.ticket.map(tic => (
            {
                menuItem: `${tic.type}`,
                render: () => <Tab.Pane key={tic.name} attached={false}>
                    <Header>
                        <Header.Content as='h2'>
                            {tic.name}
                          
                        </Header.Content>
                        {(tic.type !== 'donation') &&<Header.Subheader>
                            <h3>Price Per Ticket: {(tic.salesPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}  {data.currency.abbr.toLocaleUpperCase()}</h3>
                            <h2>Total Price: {(tic.salesPrice * qty).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {data.currency.abbr.toLocaleUpperCase()}</h2>
                        </Header.Subheader>}

                        {(tic.type === 'donation') &&<Header.Subheader>
                            <Form>
                                <h3>Total Price: {totalDonationPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {data.currency.abbr.toLocaleUpperCase()}</h3>
                                {!!donationError && <h3 style={{ color: 'red' }}>
                                    {donationError}
                                </h3>}
                                <Icon name="asterisk" color='red' size='mini' />
                                <input placeholder='Enter your donation amount(s)' defaultValue={donationPrice} onChange={(e) => this.setState({ donationPrice: e.target.value }, () => this.calcTotalDonation())}/>
                                {(qty > 1) && (<div>
                                    <Icon name='lightbulb' color="green"/> use comma to seperate your inputed values if you want to donation different amounts. i.e. 1200, 2000 mean the first ticket is assigned 1200, the second is assigned 2000 and other ticket (if any) will get the value after the last comma: 2000
                                </div>)}
                            </Form>
                        </Header.Subheader>}

                        {((tic.qty - tic.qtySold) < 25 ) &&<Header.Subheader>
                            <h2>Quantity Remaining: {tic.qty - tic.qtySold} </h2>
                        </Header.Subheader>}


                    </Header>
                    <Header>
                        <Header.Content>
                          <Dropdown text={`Qty: ${qty}`} compact scrolling>
                              <Dropdown.Menu>
                                  {((1 >= tic.qtyRange.min) && (1 <= tic.qtyRange.max)) && (<Dropdown.Item as={'a'} onClick={() => this.setState({ qty: 1}, () => this.changeTicketQty(this.state.qty, this.state.ticketIndex))}>1</Dropdown.Item>)}
                                  <Dropdown.Divider />
                                  {((2 >= tic.qtyRange.min) && (2 <= tic.qtyRange.max)) && (<Dropdown.Item as={'a'} onClick={() => this.setState({ qty: 2}, () => this.changeTicketQty(this.state.qty, this.state.ticketIndex))}>2</Dropdown.Item>)}
                                  <Dropdown.Divider />
                                  {((3 >= tic.qtyRange.min) && (3 <= tic.qtyRange.max)) && (<Dropdown.Item as={'a'} onClick={() => this.setState({ qty: 3}, () => this.changeTicketQty(this.state.qty, this.state.ticketIndex))}>3</Dropdown.Item>)}
                                  <Dropdown.Divider />
                                  {((4 >= tic.qtyRange.min) && (4 <= tic.qtyRange.max)) && (<Dropdown.Item as={'a'} onClick={() => this.setState({ qty: 4}, () => this.changeTicketQty(this.state.qty, this.state.ticketIndex))}>4</Dropdown.Item>)}
                                  <Dropdown.Divider />                                
                                  {((5 >= tic.qtyRange.min) && (5 <= tic.qtyRange.max)) && (<Dropdown.Item as={'a'} onClick={() => this.setState({ qty: 5}, () => this.changeTicketQty(this.state.qty, this.state.ticketIndex))}>5</Dropdown.Item>)}
                                  <Dropdown.Divider />                                
                                  {((6 >= tic.qtyRange.min) && (6 <= tic.qtyRange.max)) && (<Dropdown.Item as={'a'} onClick={() => this.setState({ qty: 6}, () => this.changeTicketQty(this.state.qty, this.state.ticketIndex))}>6</Dropdown.Item>)}
                                  <Dropdown.Divider />                              
                                  {((7 >= tic.qtyRange.min) && (7 <= tic.qtyRange.max)) && (<Dropdown.Item as={'a'} onClick={() => this.setState({ qty: 7}, () => this.changeTicketQty(this.state.qty, this.state.ticketIndex))}>7</Dropdown.Item>)}
                                  <Dropdown.Divider />                                 
                                  {((8 >= tic.qtyRange.min) && (8 <= tic.qtyRange.max)) && (<Dropdown.Item as={'a'} onClick={() => this.setState({ qty: 8}, () => this.changeTicketQty(this.state.qty, this.state.ticketIndex))}>8</Dropdown.Item>)}
                                  <Dropdown.Divider />
                              </Dropdown.Menu>
                          </Dropdown>
                        </Header.Content>
                    </Header>
                    <Header>
                      <Header.Content>
                          Description:
                      </Header.Content>
                      <Header.Subheader>
                          {tic.description}
                      </Header.Subheader>
                    </Header>
                </Tab.Pane>,
            }
        ));

          
        return (
            <div className="ui container">
                
                <Confirm
                    open={this.state.open}
                    content='Cancel ticket cannot be reactivated. Are you sure you want to cancel ticket reservation?'
                    onCancel={this.handleCancel}
                    onConfirm={this.handleConfirm}
                    cancelButton='Never mind'
                    confirmButton="Yes"
                />
                <EventPage data={data} organizer={user} loading={loading} customer={customer} hostname={hostname} addAlert={(h, m, s, p) => this.messageBox.addMessage(h, m, s, p)}/> 
                {/* //PAYMENT FORM */}
                <Modal
                    // trigger={<Button onClick={this.handleOpenPayment}>Show Modal</Button>}
                    open={this.state.paymentOpen}
                    // onClose={this.handleClosePayment}
                    basic
                    size='small'
                >
                    <Header inverted icon="money" content='Buy Ticket' />
                    <Modal.Content>
                        <PayStack 
                        cancelPayment={() => this.handleClosePayment()}
                        gotPayment={(res) => this.handlePayment(res)} 
                        info={[
                            {
                                display_name: "Event Id",
                                variable_name: "event_id",
                                value: data._id
                            }
                            ,
                            {
                                display_name: "Ticket Id",
                                variable_name: "ticket_id",
                                value: `${(data.ticket && data.ticket[ticketIndex])? data.ticket[ticketIndex]._id : ''}`
                            },
                            {
                                display_name: "Cart Id",
                                variable_name: "cart_id",
                                value: `${this.state.paymentDetails.cartId || ''}`
                            },
                            {
                                display_name: "Ticket Qty",
                                variable_name: "ticket_qty",
                                value: `${qty}`
                            }
                            ,
                            {
                                display_name: "Description",
                                variable_name: "description",
                                value: "Ticket sales"
                            }
                        ]}
                        paymentDetails={this.state.paymentDetails}/> 
                    </Modal.Content>
                    <Modal.Actions>
                    {/* <Button color='green' onClick={this.handleClosePayment} inverted>
                        <Icon name='checkmark' /> Close
                    </Button> */}
                    </Modal.Actions>
                </Modal>
                

                {/* //TICKET BUTTON */}
                {!loading && data.published && (<div style={{ position: 'fixed', bottom: '25%', right: '15%' }}>
                    <Button color='pink' disabled={disableModal} onClick={() => this.setState({ modalOpen: true })} circular> 
                        Ticket
                    </Button>
                        
                </div>)}
                {!loading && (<Modal open={modalOpen} onOpen={() => this.setState({ modalOpen: true })} onClose={() => this.setState({ modalOpen: false, resend: { ...this.state.resend, error: '' }, cancel: { ...this.state.cancel, error: '' }  })} closeIcon>
                <Modal.Header>{data.name}</Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            {/* <Segment inverted> */}
                                <Breadcrumb size='big'>
                                    <Breadcrumb.Section onClick={() =>this.pickTicketOption('register')} active={ticketOption === 'register'} link={ticketOption !== 'register'}>Ticket registration</Breadcrumb.Section>
                                    <Breadcrumb.Divider />
                                    <Breadcrumb.Section onClick={() => this.pickTicketOption('cancel')} active={ticketOption === 'cancel'} link={ticketOption !== 'cancel'}>Ticket cancellation and refund</Breadcrumb.Section>
                                    <Breadcrumb.Divider />
                                    <Breadcrumb.Section onClick={() => this.pickTicketOption('resend')}  active={ticketOption === 'resend'} link={ticketOption !== 'resend'}>Resend ticket</Breadcrumb.Section>
                                    
                                </Breadcrumb>
                            {/* </Segment> */}
                            <Divider />
                        </Modal.Description>


                        
                        {/* //REGISTER FORM*/}
                        {(data.ticket.length === 0) && (ticketOption === 'register') && (<Modal.Description> 
                            {/* <Icon loading name='spinner' size='massive'/> */}
                            {(gotTicket) && (<h2 style={{ textAlign: 'center'}}>
                                This event has not ticket
                            </h2>)}
                            {(!gotTicket) && (<Dimmer active inverted>
                                <Loader size='massive' inverted>Loading ticket(s)</Loader>
                            </Dimmer>)}
                        </Modal.Description>)}
                        {(data.ticket.length > 0) && (ticketOption === 'register') && (<Modal.Description>
                            <Tab 
                            menu={{ secondary: true, pointing: true }} panes={panes} activeIndex={ticketIndex} onTabChange={(e, da) => this.setState({ticketIndex: da.activeIndex, qty: data.ticket[da.activeIndex].qtyRange.min, totalDonationPrice: 0, donationPrice: '' }, () => this.changeQty(this.state.qty, da.activeIndex))} />
                            <Divider />
                            
                            {(moment.utc().valueOf() >= ( moment.utc(data.time.start).valueOf() - data.ticket[ticketIndex].sales.end)) && <div>
                                <h3 style={{ color: 'red' }}>Sorry, this ticket sale period has ended</h3>
                            </div>}


                            {(moment.utc().valueOf() < (moment.utc(data.time.start).valueOf() - data.ticket[ticketIndex].sales.end)) && (<div>
                                <Form>
                                    <Segment>
                                        {new Array(qty).fill('res').map((res, index) => (
                                            <div key={index.toString()}>
                                                <Header>
                                                    Ticket {index + 1}
                                                </Header>
                                                {(data.ticket[ticketIndex].type === 'donation') && (<Form.Field>
                                                    <label>Price: {donationPrice.split(',')[index] || donationPrice.split(',')[donationPrice.split(',').length - 1]} {data.currency.abbr.toLocaleUpperCase()}  </label>
                                                </Form.Field>)}


                                                <Form.Field key={`${data.ticket[ticketIndex].name}-name-${index}`}>
                                                    <label>Full name <Icon name="asterisk" color='red' size='mini' /></label>
                                                    <input required onChange={(e) => this.onChange(e, index)} name='fullname' type='text' placeholder='Enter your full-name' />
                                                </Form.Field>
                                                {(data.ticket[ticketIndex].notificationChannel === 'email') && (<Form.Field key={`${data.ticket[ticketIndex].name}-${index}`}>
                                                    <label>E-mail <Icon name="asterisk" color='red' size='mini' /></label>
                                                    <input key={`email-contact-${index}`} required onChange={(e) => this.onChange(e, index)} name='contact' type='email' placeholder='Enter your email address' />
                                                </Form.Field>)}
                                                {(data.ticket[ticketIndex].notificationChannel === 'sms') && (<Form.Field key={`${data.ticket[ticketIndex].name}-${index}`}>
                                                    <label>Phone number <Icon name="asterisk" color='red' size='mini' /></label>
                                                    <input key={`sms-contact-${index}`} required onChange={(e) => this.onChange(e, index)} name='contact' type='tel' placeholder='Enter your phone number' />
                                                </Form.Field>)}
                                                <Divider/>
                                            </div>
                                        ))}

                                    </Segment>
                                    

                                    <Divider />
                                    <Form.Field>
                                        <label>Email address for payment notification <Icon name="asterisk" color='red' size='mini' /></label>
                                        <input key='noficationEmail' type='email' placeholder='Enter your email address' defaultValue={this.state.paymentDetails.email} onChange={(e) => this.setState({ paymentDetails: { ...this.state.paymentDetails, email: e.target.value }})} />
                                        <br />
                                        <br />
                                        {(data.ticket[ticketIndex].notificationChannel === 'email') && (
                                        <Checkbox key='noficationEmailCheckBox' onChange={() => this.setState({ paymentDetails: { ...this.state.paymentDetails, email: (!!this.state.paymentDetails.email) ? '': this.state.registration[0].contact }})} checked={!!this.state.paymentDetails.email} label='Use Ticket 1 email address' />
                                        )}
                                    </Form.Field>
                                    <Divider />
                                    Refund Policy: {data.refundPolicy.text}
                                    <Divider />
                                    <Form.Field>
                                        <Checkbox onChange={() => this.setState({ paymentDetails: { ...this.state.paymentDetails, subscribe: !this.state.paymentDetails.subscribe }})} checked={this.state.paymentDetails.subscribe} label='I want PrepVENT to notify me about new events nearby.' />
                                    </Form.Field>
                                    <Form.Field>
                                        <Checkbox 
                                        checked 
                                        disabled
                                        label={parser(`I accept the <Link to='/terms'>terms of service</Link> and have read the <Link to='/privacy'>privacy policy</Link>. I agree that my information will be shared with the event organizer.`)} />
                                        
                                    </Form.Field>
                                </Form>

                                {(!!validationError) && (<Message error>
                                    <Message.Header>Error</Message.Header>
                                    <Message.Content>{validationError}</Message.Content>
                                </Message>)}
                                <Divider />
                                <Button disabled={validating} onClick={() => this.validateTicket()} floated='right' color='pink' type='submit'>
                                    Register for {panes[ticketIndex].menuItem} ticket(s)
                                </Button>
                                <br />
                                <br />
                            </div>)}

                        </Modal.Description>)}

                        

                        {/* //CANCELLATION FORM */}
                        {(ticketOption === 'cancel') && (<Modal.Description>
                            Refund Policy: {data.refundPolicy.text}
                            <Divider />
                                <div>
                                <Form>
                                    <Form.Field>
                                        <label>Email <Icon name="asterisk" color='red' size='mini' /></label>
                                        <input placeholder='Enter the email address you used to register for ticket' type='email' required defaultValue={cancel.email} onChange={(e) => this.setState({ cancel: { ...this.state.cancel, email: e.target.value }})} />
                                    </Form.Field>


                                    <Form.Field>
                                        <label>Registration Number <Icon name="asterisk" color='red' size='mini' /></label>
                                        <input placeholder='Enter your ticket regitration number' type='text' required defaultValue={cancel.registrationNumber} onChange={(e) => this.setState({ cancel: { ...this.state.cancel, registrationNumber: e.target.value }})} />
                                    </Form.Field>

                                </Form>
                                
                                {(!!cancel.error) && (<Message error>
                                    <Message.Header>Error</Message.Header>
                                    <Message.Content>{cancel.error}</Message.Content>
                                </Message>)}
                                <br />
                                <div style={style.alignedRight}>
                                    <Button color='pink' type='submit' onClick={() => this.show()}>Cancel Ticket</Button>
                                </div>    
                            
                            </div>
                        </Modal.Description>)}



                        {/* //RESEND */}
                        {(ticketOption === 'resend') && (<Modal.Description>
                            <Form>
                                <Form.Field>
                                    <label>Email <Icon name="asterisk" color='red' size='mini' /></label>
                                    <input placeholder='Enter the email address you used to register for ticket' type='email' required defaultValue={resend.email} onChange={(e) => this.setState({ resend: { ...this.state.resend, email: e.target.value }})}/>
                                </Form.Field>
                            </Form>
                                                   
                            {(!!resend.error) && (<Message error>
                                <Message.Header>Error</Message.Header>
                                <Message.Content>{resend.error}</Message.Content>
                            </Message>)}
                            <br />  
                            <div style={style.alignedRight}>
                                <Button color='pink' type='submit' onClick={() => this.resendTicket()}>Resend Ticket</Button>
                            </div>


                        </Modal.Description>)}

                    </Modal.Content>
                </Modal>)}
                

                
                {/* //DASHBOARD BUTTON */}
                {!loading && data.published  && (data.organizer.userId === user._id) && (<div style={{ position: 'fixed', bottom: '18%', left: '0%' }}>
                        <Button color='black' size='tiny' onClick={() => this.props.history.push(`/dashboard/${data._id}`)}> 
                            Vist dashboard
                        </Button>
                </div>)}
                <MessageBox ref={c=> (this.messageBox = c)} />
                <br />
                <br />
                <br />
            </div>
        )
    }
}

const mapStateToProps = (state, props) => ({
    localEvent: getEventById(state, props),
    timeString: state.events.timeString,
    user: state.user,
    customer: state.customer,
    hostname: state.events.hostname
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(Event)
