import React, { Component } from 'react';
import { Button, Statistic, Icon, Modal, Segment, Form, Item, Radio, Accordion, TextArea, Popup, Divider, Header, Dropdown, Message, Input } from 'semantic-ui-react';
// import { disableTicket, enableTicket } from '../../actions/event';
import WordCount from '../Views/WordCount'

import style from '../Style/Style';

const endSalesTime = [
    { key: '1hr', value: 3600000, text: '1 hour before the event' },
    { key: '2hr', value: 7200000, text: '2 hour before the event' },
    { key: '3hr', value: 10800000, text: '3 hour before the event' },
    { key: '5hr', value: 18000000, text: '5 hour before the event' },
    { key: '10hr', value: 36000000, text: '10 hour before the event' },
    { key: '1dy', value: 86400000, text: '1 day before the event' },
    { key: '2dy', value: 172800000, text: '2 day before the event' },
]

const startSalesTime = [
    { key: 'now', value: 0, text: 'now' },
    // { key: '1hr', value: 3600000, text: '1 hour' },
    // { key: '2hr', value: 7200000, text: '2 hour' },
    // { key: '3hr', value: 10800000, text: '3 hour' },
    // { key: '5hr', value: 18000000, text: '5 hour' },
    // { key: '10hr', value: 36000000, text: '10 hour' },
    // { key: '1dy', value: 86400000, text: '1 day' },
    // { key: '2dy', value: 172800000, text: '2 day' },
]

const refundOptions = [
    { key: 'null', value: 'NOT', text: 'Tickets are NOT refundable' },
    // { key: '1dy', value: 86400000, text: 'Tickets are refundable until 1 day before the event' },
    { key: '2dy', value: 172800000, text: 'Tickets are refundable until 2 days before the event' },
    { key: '5dy', value: 432000000, text: 'Tickets are refundable until 5 days before the event' },
    { key: '1wk', value: 604800000, text: 'Tickets are refundable until 1 week before the event' },
    { key: '2wk', value: 1209600000, text: 'Tickets are refundable until 2 weeks before the event' },
]

const nameOptions = [
    { key: 'Input', text: 'Input Value', value: 'Input' },
    { key: 'Free', text: 'Free', value: 'Free' },
    { key: 'General Admission', text: 'General Admission', value: 'General Admission' },
    { key: 'VIP', text: 'VIP', value: 'VIP' },
    { key: 'Early Bird', text: 'Early Bird', value: 'Early Bird' },
    { key: 'Regular', text: 'Regular', value: 'Regular' },
    { key: 'Donation', text: 'Donation', value: 'Donation' },
];
export default class Ticketing extends Component {
    constructor(props) {
        super(props);
        this.curretFormat = {
            userId: props.user,
            eventId: '',
            type: '',
            name: '',
            qty: 0,
            price: 0,
            salesPrice: 0,
            qtySold: 0,
            iAbsorbCharges: true,
            description: '',
            qtyRange: {
                min: 1,
                max: 8
            },
            sku: '',
            charges: props.ticketChargeRate,
            sales: {
                start: 0,
                end: 7200000,
            },
          //  salesChannel: 'Online',
            notificationChannel: 'email',
            disabled: false
        }

        this.state = {
            ticket: props.ticket,
            current: this.curretFormat,
            activeIndex: 1,
            modalOPen: false,
            currentIndex: 0,
            ticketError: '',
            oldTicketLength: props.oldTicketLength,
            refundPolicy: props.refundPolicy
        }
    }

    handleChangeNotification = (e, { value }) => this.setState({ current: { ...this.state.current, notificationChannel: value }  })

    handleClick = (e, titleProps) => {
        const { index } = titleProps
        const { activeIndex } = this.state
        const newIndex = activeIndex === index ? -1 : index
    
        this.setState({ activeIndex: newIndex })
    }

    handleChangeAbsorb = (e, { value }) => this.setState({ current: { ...this.state.current, iAbsorbCharges: !this.state.current.iAbsorbCharges } })

    next=()=> {
        const { next, addAlert } = this.props;
        const { ticket, refundPolicy } = this.state;
        let index = ticket.findIndex(val => val.type === 'free');
        let free = (index >= 0);

        let error = this.finalTicketValidation(ticket)

        if (!!error) {
            addAlert('Error', error, false, false)
        } else {
            next(ticket, free, refundPolicy)
        }
        
    }

    prev=()=> {
        const { prev } = this.props;
        const { ticket, refundPolicy } = this.state;
        prev(ticket, refundPolicy)
    }

    finalTicketValidation = (ticket) => {
       let error = '';
       if (ticket.length === 0) {
            error = 'No ticket found. You need to create a minimum of one ticket.'
       } else {
            // Ticket name should be unique
            ticket.forEach((tic, index) => {
                ticket.forEach((tc,i) => {
                    if((tic.name === tc.name) && (index !== i)) {
                    error = 'Ticket name must be unique. Two or more tickets share the same name.'
                    }
                })
            });
       }

       return error;
    }

    onChange = (e) => this.setState({ current: { ...this.state.current, [e.target.name]: e.target.value} })

    onChangeNumber = (e) => this.setState({ current: { ...this.state.current, [e.target.name]: Number(e.target.value)} })

    onChangeQty = (e) => {
        const name = e.target.name;
        const val = Number(e.target.value);
        let qty = 0;

        if ( name === 'min' ) {
            if (val < 1) {
                qty = 1
            } else if(val > 8) {
                qty = 1
            } else {
                qty = val
            }
        }

        if ( name === 'max' ) {
            if (val < 1) {
                qty = 8
            } else if(val > 8) {
                qty = 8
            } else {
                qty = val
            }
        }
        this.setState({ current: { ...this.state.current, qtyRange: { ...this.state.current.qtyRange, [e.target.name]: qty } } })
    }

    createEvent = () => {
        const { currentIndex, current, ticket } = this.state;
        let salesPrice = current.iAbsorbCharges? Number(this.state.current.price).toFixed(2) : (Number(this.state.current.price) + ((this.state.current.charges/100) * (Number(this.state.current.price))) ).toFixed(2);
        let error = this.validateTicket(current);

        if (error)  {
            this.setState({ ticketError: error })
        } else {
            let newCurrent ={
                ...current,
                salesPrice: Number(salesPrice),
                sku: String.fromCharCode((currentIndex + 1) + 64)
            }
            ticket[currentIndex] = newCurrent;
            this.setState({ ticket: [...ticket], modalOPen: false, currentIndex: ticket.length, ticketError: '' })
        }
    }

    validateTicket = (current) => {
        const { mode } = this.props;
        let error = '';
        // Ticket required valies        
        if (!current.type || !current.name || (current.qty === '' ) || (current.price === '') || !current.description) {
            error = 'Complete the required fields (type, name, capacity, price and description)'
        } else if ((current.type === 'paid') && (current.price <= 0)) {
            // paid Ticket should not have a price of zero for pain 
            error = 'Paid ticket price should be greater than zero'
        } else if (current.qty <= 0) {
            error = 'Event capacity should be greater than zero'
        } else if (current.qtyRange.min > current.qtyRange.max) {
            error = 'Minimum ticket per order is greater than maximum ticket per order'
        } else if ((mode === 'edit') && (current.qtySold !== 0) &&(current.qtySold > current.qty)) {
            // qty< qtysold in edit
            error = `Your ticket capacity is less than the quantity sold: ${current.qtySold}`
        }

        return error 
    }

    newTicket = () => this.setState({
        current: this.curretFormat,
        modalOPen: true,
        currentIndex: this.state.ticket.length
    })

    editTicket = (index) => this.setState({ current: this.state.ticket[index], currentIndex: index, modalOPen: true })

    deleteTicket = (index) => {
        const {ticket } = this.state;
        ticket.splice(index, 1)

        this.setState({ ticket: [ ...ticket ] }, () => this.updateSku(this.state.ticket))
    }

    updateSku = (tickets) => {
       const ticket = tickets.map((tic, i) => ({ ...tic, sku: tic._id? tic.sku: String.fromCharCode((i + 1) + 64) }))

       this.setState({ ticket: [ ...ticket ] })
    }

    disableTicket = (index) => {
        // send a request to disble the ticket
        const {ticket } = this.state;
        // const { addAlert } = this.props;

        ticket[index].disabled = true;

        this.setState({ ticket: [ ...ticket ] })
        // addAlert('Info', 'Please wait...', true, true)
        // let ticketId = ticket[index]._id;
        // disableTicket(ticketId)
        // .then((res) => {
        //     ticket[index] = res.data.ticket;

        //     this.setState({ ticket: [ ...ticket ] })
        //     addAlert('Success', 'Ticket successfully disabled', true, false)
        // })
        // .catch((error) => {
        //     addAlert('Error', error.msg, false, false)
        // })
    }


    enableTicket = (index) => {
        // send a request to disble the ticket
        const {ticket } = this.state;
        // const { addAlert } = this.props;

        ticket[index].disabled = false;

        this.setState({ ticket: [ ...ticket ] })

        // addAlert('Info', 'Please wait...', true, true)
        // let ticketId = ticket[index]._id;

        // enableTicket(ticketId)
        // .then((res) => {
        //     ticket[index] = res.data.ticket;

        //     this.setState({ ticket: [ ...ticket ] })
        //     addAlert('Success', 'Ticket successfully enable', true, false)
        // })
        // .catch((error) => {
        //     addAlert('Error', error.msg, false, false)
        // })
    }


    changeRefundPolicy = (data) => {
        let index = refundOptions.findIndex(ref => ref.value === data.value)
        
        this.setState({ refundPolicy: { ...this.state.refundPolicy, value: data.value, text: refundOptions[index].text } })
    }

    render() {
        const { current, activeIndex, ticket, modalOPen, ticketError, currentIndex, oldTicketLength, refundPolicy } = this.state;
        const { mode, currency } = this.props;
        
        return (    
            <div>
                <div style={style.center}>
                    <Icon onClick={() => this.newTicket()} size='huge' name='plus circle' color='pink' />
                </div>

                <Modal open={modalOPen} onOpen={() => this.setState({ modalOPen: true })} onClose={() => this.setState({ modalOPen: false, ticketError: '' })}  closeIcon>
                    <Modal.Header>Ticket</Modal.Header>
                    <Modal.Content scrolling>
                    <Form>
                            <Form.Field>
                                <label>Type<Icon name="asterisk" color='red' size='mini' /></label>
                                <Button.Group>
                                    <Button disabled={((mode === 'edit') && (currentIndex < oldTicketLength))} color={(current.type === 'free') ? 'pink' : 'black'} onClick={() => this.setState({ current: { ...this.state.current, type: 'free', price: 0, iAbsorbCharges: true }})} active={this.state.current.type === 'free'}>Free</Button>
                                    <Button.Or />
                                    <Button disabled={((mode === 'edit') && (currentIndex < oldTicketLength))} color={(current.type === 'paid') ? 'pink' : 'black'} onClick={() => this.setState({ current: { ...this.state.current, type: 'paid', price: 0, iAbsorbCharges: true }})} active={this.state.current.type === 'paid'}>Paid</Button>
                                    <Button.Or />
                                    <Button disabled={((mode === 'edit') && (currentIndex < oldTicketLength))} color={(current.type === 'donation') ? 'pink' : 'black'} onClick={() => this.setState({ current: { ...this.state.current, type: 'donation', price: Infinity, iAbsorbCharges: true }})} active={this.state.current.type === 'donation'}>Donation</Button>
                                </Button.Group>
                            </Form.Field>

                            <Form.Field>
                                <label>Name<Icon name="asterisk" color='red' size='mini' /></label>
                                <Input
                                    action={
                                    <Dropdown button basic floating options={nameOptions} defaultValue={current.name} direction='left' onChange={(e, data) => this.setState({ current: { ...this.state.current, name: (data.value !== 'Input')? data.value: current.name }})} />
                                    }
                                    icon='ticket alternate'
                                    iconPosition='left'
                                    placeholder='Add ticket name'
                                    disabled={((mode === 'edit') && (currentIndex < oldTicketLength))}
                                    value={`${this.state.current.name}`}
                                    onChange={(e, data) => this.setState({ current: { ...this.state.current, name: data.value }})}
                                    name='name'
                                />
                            </Form.Field>

                            <Form.Field>
                                <label>Capacity <Icon name="asterisk" color='red' size='mini' /></label>
                                <input defaultValue={current.qty} type='number' name='qty' onChange={(e) => this.onChangeNumber(e)} placeholder='Add maximum number of people that can attend your event' />
                                {(mode === 'edit') && (current.qtySold !== 0) && (
                                    <div>
                                        <Icon name='lightbulb' color='green' /> When editting ticket capacity, it is advised that the capacity should be at least 2-5 tickets more than the ticket sold: "{current.qtySold}", to prevent people buying more than the available tickets
                                    </div>
                                )}
                            </Form.Field>

                            <Form.Field>
                                <label>Price<Icon name="asterisk" color='red' size='mini' /></label>
                                {(current.type === 'free') && (<input disabled defaultValue={current.price} type="number" name='price' onChange={(e) => this.onChangeNumber(e)} placeholder='Enter the price of your ticket' />)}
                                {(current.type === 'paid') && (<input disabled={((mode === 'edit') && (currentIndex < oldTicketLength))} defaultValue={current.price} type="number" name='price' onChange={(e) => this.onChangeNumber(e)} placeholder='Enter the price of your ticket' />)}
                                {(current.type === 'donation') && (<input disabled value={'Infinity'} type="text" name='price' placeholder='Enter the price of your ticket' />)}
                            </Form.Field>

                            <Divider />

                                {(current.type !== 'donation') && (<div>

                                
                                {this.state.current.iAbsorbCharges? (
                                    <Statistic.Group>
                                        {/* <Statistic>
                                            <Statistic.Value>{`${((Number(this.state.current.qty)* Number(this.state.current.price)) - ((this.state.current.charges/100) * (Number(this.state.current.qty)* Number(this.state.current.price)) )).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}</Statistic.Value>
                                            <Statistic.Label>Your Revenue
                                                <Popup trigger={<Icon name={'info'} />}>
                                                    <Popup.Content >
                                                        Capacity * Price - Ticketing Fee
                                                    </Popup.Content>
                                                </Popup>
                                            </Statistic.Label>
                                        </Statistic>
                                        <Statistic>
                                            <Statistic.Value>{`${(Number(this.state.current.qty)* Number(this.state.current.price)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}</Statistic.Value>
                                            <Statistic.Label>Ticket Price
                                                <Popup trigger={<Icon name={'info'} />}>
                                                    <Popup.Content >
                                                        Capacity * Price
                                                    </Popup.Content>
                                                </Popup>
                                            </Statistic.Label>
                                        </Statistic> */}
                                        <Statistic>
                                            <Statistic.Value>{`${((this.state.current.charges/100) * Number(this.state.current.price)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${currency.abbr.toLocaleUpperCase()}`}</Statistic.Value>
                                            <Statistic.Label>Ticketing Fee per Ticket
                                                <Popup trigger={<Icon name={'info'} />}>
                                                    <Popup.Content >
                                                        {current.charges}% * Price Per Ticket
                                                    </Popup.Content>
                                                </Popup>
                                            </Statistic.Label>
                                        </Statistic>
                                        <Statistic>
                                            <Statistic.Value>{`${Number(this.state.current.price).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${currency.abbr.toLocaleUpperCase()}`}</Statistic.Value>
                                            <Statistic.Label>Price Per Ticket
                                                <Popup trigger={<Icon name={'info'} />}>
                                                    <Popup.Content >
                                                        The price of a ticket
                                                    </Popup.Content>
                                                </Popup>
                                            </Statistic.Label>
                                        </Statistic>
                                    </Statistic.Group>
                                    ) : (
                                    <Statistic.Group>
                                        {/* <Statistic>
                                            <Statistic.Value>{`${(Number(this.state.current.qty)* Number(this.state.current.price)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}</Statistic.Value>
                                            <Statistic.Label>Your Revenue
                                                <Popup trigger={<Icon name={'info'} />}>
                                                    <Popup.Content >
                                                        Capacity * Price
                                                    </Popup.Content>
                                                </Popup>
                                            </Statistic.Label>
                                        </Statistic>
                                        <Statistic>
                                            <Statistic.Value>{`${((Number(this.state.current.qty)* Number(this.state.current.price)) + ((this.state.current.charges/100) * (Number(this.state.current.qty)* Number(this.state.current.price))) ).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}</Statistic.Value>
                                            <Statistic.Label>Ticket Revenue
                                                <Popup trigger={<Icon name={'info'} />}>
                                                    <Popup.Content >
                                                        Your Revenue + Ticketing Fee
                                                    </Popup.Content>
                                                </Popup>
                                            </Statistic.Label>
                                        </Statistic> */}
                                        <Statistic>
                                            <Statistic.Value>{`${((this.state.current.charges/100) * Number(this.state.current.price)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${currency.abbr.toLocaleUpperCase()}`}</Statistic.Value>
                                            <Statistic.Label>Ticketing Fee Per Ticket
                                                <Popup trigger={<Icon name={'info'} />}>
                                                    <Popup.Content >
                                                        {current.charges}% * Price Per Ticket
                                                    </Popup.Content>
                                                </Popup>
                                            </Statistic.Label>
                                        </Statistic>
                                        <Statistic>
                                            <Statistic.Value>{`${(Number(this.state.current.price) + ((this.state.current.charges/100) * (Number(this.state.current.price))) ).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${currency.abbr.toLocaleUpperCase()}`}</Statistic.Value>
                                            <Statistic.Label>Price Per Ticket
                                                <Popup trigger={<Icon name={'info'} />}>
                                                    <Popup.Content >
                                                        Price + Ticketing Fee Per Ticket ({current.charges}% * Price Per Ticket)
                                                    </Popup.Content>
                                                </Popup>
                                            </Statistic.Label>
                                        </Statistic>
                                    </Statistic.Group>
                                    )} 
                                </div>)}


                                {(current.type === 'donation') && (<div>
                                    <Statistic.Group horizontal>
                                        {/* <Statistic>
                                            <Statistic.Value>{`Ticket Revenue - Ticketing Fee`}</Statistic.Value>
                                            <Statistic.Label>Your Revenue
                                                <Popup trigger={<Icon name={'info'} />}>
                                                    <Popup.Content >
                                                        Total revenue made from ticket sales minus our {current.charges}% ticketing fee
                                                    </Popup.Content>
                                                </Popup>
                                            </Statistic.Label>
                                        </Statistic>
                                        <Statistic>
                                            <Statistic.Value>{`Accumulative Donations`}</Statistic.Value>
                                            <Statistic.Label>Ticket Revenue
                                                <Popup trigger={<Icon name={'info'} />}>
                                                    <Popup.Content >
                                                        Addition of all donates to your event
                                                    </Popup.Content>
                                                </Popup>
                                            </Statistic.Label>
                                        </Statistic> */}
                                        <Statistic>
                                            <Statistic.Value>{`${(this.state.current.charges/100)} x Price Per Ticket`}</Statistic.Value>
                                            <Statistic.Label>Ticketing Fee per Ticket
                                                <Popup trigger={<Icon name={'info'} />}>
                                                    <Popup.Content >
                                                        {current.charges}% of the Price Per Ticket
                                                    </Popup.Content>
                                                </Popup>
                                            </Statistic.Label>
                                        </Statistic>
                                        <Statistic>
                                            <Statistic.Value>{`Varies`}</Statistic.Value>
                                            <Statistic.Label>Price Per Ticket
                                                <Popup trigger={<Icon name={'info'} />}>
                                                    <Popup.Content >
                                                        Donation fee per registered event-goers
                                                    </Popup.Content>
                                                </Popup>
                                            </Statistic.Label>
                                        </Statistic>
                                    </Statistic.Group>
                                </div>)}
                            <Divider />
                            <Form.Field>
                            
                                <label>Absorb charges ({current.charges}% of Ticket sales)
                                <Popup trigger={<Icon name={'info'} />}>
                                    <Popup.Content >
                                            3%(processing Fees) + {current.charges - 3}%(service Fees) = {current.charges}% Ticketing Fees
                                    </Popup.Content>
                                </Popup>
                                </label>

                                <Radio defaultChecked={current.iAbsorbCharges} disabled={((current.type !== 'paid') || ((mode === 'edit') && (currentIndex < oldTicketLength)))} toggle label={!!current.iAbsorbCharges? 'The ticketing fee will be deducted from my ticket revenue' : 'Event goers will pay the ticketing fee'} onChange={() =>this.setState({ current: { ...this.state.current, iAbsorbCharges: !this.state.current.iAbsorbCharges } })} />
                            </Form.Field>

                            <Form.Field>
                                <label>Description<Icon name="asterisk" color='red' size='mini' /></label>
                                <TextArea maxLength={200} defaultValue={current.description} name='description' onChange={(e) => this.onChange(e)}  placeholder='Explain the privileges of the this ticket to the event goers' />
                                <WordCount count={current.description} maxLength={200} />
                            </Form.Field>

                            <Accordion>
                                <Accordion.Title
                                    active={activeIndex === 0}
                                    index={0}
                                    onClick={this.handleClick}
                                    >
                                    <Icon name='dropdown' />
                                    Additional Info
                                </Accordion.Title>
                                <Accordion.Content active={activeIndex === 0}>
                                    <Segment>
                                        {/* <Form.Field>
                                            <Header>
                                                <Header.Content as='h5'> Sale Channel</Header.Content>
                                                <Header.Subheader>
                                                    Where to sell your ticket
                                                </Header.Subheader>
                                            </Header>

                                            <Dropdown
                                                selection
                                                fluid
                                                disabled={((mode === 'edit') && (currentIndex < oldTicketLength))}
                                                options={[{ value: 'Online', text: 'Online', key: 'Online' }, { value: 'At Event Location', text: 'At Event Location', key: 'At Event Location' }]}
                                                defaultValue={current.salesChannel}
                                                onChange={(e, { value }) => this.setState({ current: { ...this.state.current, salesChannel: value } })}
                                            />
                                        </Form.Field> */}

                                        <Form.Group widths='equal'>
                                            <Form.Field>
                                                <Header>
                                                    <Header.Content as='h5'>Start Sales</Header.Content>
                                                    <Header.Subheader>
                                                        select when you want your ticket sales to start
                                                    </Header.Subheader>
                                                </Header>
                                                                                
                                                <Dropdown
                                                selection
                                                options={startSalesTime}
                                                defaultValue={startSalesTime[0].value}
                                                onChange={(e, { value }) => this.setState({ current: { ...this.state.current, sales: {...this.state.current.sales, start: value } } })}
                                                />
                                                
                                                {/* <Datetime dateFormat={'Do MMMM YYYY'} timeFormat={'hh:mm a'} onChange={this.onChangeStart} defaultValue={`${moment.utc(current.sales.start).utcOffset(time.localOffset).format(this.props.timeString)}`} inputProps={{placeholder:"Start Sales", name:"start Sales" }} /> */}
                                            </Form.Field>

                                            <Form.Field>
                                                
                                                <Header>
                                                    <Header.Content as='h5'>End Sales</Header.Content>
                                                    <Header.Subheader>
                                                        select when you want your ticket sales to end
                                                    </Header.Subheader>
                                                </Header>
                                                
                                                <Dropdown
                                                selection
                                                options={endSalesTime}
                                                defaultValue={endSalesTime[1].value}
                                                onChange={(e, { value }) => this.setState({ current: { ...this.state.current, sales: {...this.state.current.sales, end: value } } })}
                                                />
                                                
                                                {/* <Datetime dateFormat={'Do MMMM YYYY'} timeFormat={'hh:mm a'} onChange={this.onChangeEnd} defaultValue={`${moment.utc(current.sales.end).utcOffset(time.localOffset).format(this.props.timeString)}`} inputProps={{placeholder:"End Sales", name:"end Sales" }} /> */}
                                            </Form.Field>
                                        </Form.Group>

                                        <Form.Group widths='equal'>
                                            <Form.Field>
                                                <label>Minimum tickets per order</label>
                                                <input defaultValue={current.qtyRange.min} type='number' name='min' onChange={(e) => this.onChangeQty(e)} min={1}  max={8} placeholder='1'/>
                                            </Form.Field>

                                            <Form.Field>
                                                <label>Maximum tickets per order</label>
                                                <input defaultValue={current.qtyRange.max} type='number' name='max' onChange={(e) => this.onChangeQty(e)} min={1} max={8} placeholder='8'/>
                                            </Form.Field>
                                        </Form.Group>

                                        {/* <Form.Field>
                                            <b>Notification Channel ({this.state.current.notificationChannel})</b>
                                            <Popup trigger={<Icon name={'info'} />}>
                                                <Popup.Content>
                                                    this is the total cost for sending registration details message
                                                </Popup.Content>
                                            </Popup>
                                            </Form.Field>
                                            <Form.Field>
                                            <Radio
                                                label='Email (FREE)'
                                                name='radioGroup'
                                                value='email'
                                                checked={this.state.current.notificationChannel === 'email'}
                                                onChange={this.handleChangeNotification}
                                            />
                                            </Form.Field>
                                            <Form.Field>
                                            <Radio
                                                label=`SMS (4 ${currency.abbr.toLocaleUpperCase()})`
                                                name='radioGroup'
                                                value='sms'
                                                checked={this.state.current.notificationChannel === 'sms'}
                                                onChange={this.handleChangeNotification}
                                            />
                                        </Form.Field> */}
                                    </Segment>
                                </Accordion.Content>

                            </Accordion>
                        </Form>
                    <Modal.Description>

                    </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        {(!!ticketError) && (<Message error>
                            <Message.Content>{ticketError}</Message.Content>
                        </Message>)}
                        <Button onClick={() => this.createEvent()} color='pink'>
                            Create {current.type} ticket<Icon name='chevron right' />
                        </Button>
                    </Modal.Actions>
                </Modal>


        
                <Segment>
                    <Item.Group divided>

                        {ticket.map((tic, index) => (
                        <Item key={index.toString()}>
                            <Item.Content>
                                <div style={style.spacebetween}>
                                    <Item.Header as='h3'>           
                                            {tic.name}
                                    </Item.Header>
                                    

                                    <Dropdown direction='left' icon={<Icon name='ellipsis vertical'/>} compact>
                                        <Dropdown.Menu>
                                            <Dropdown.Item disabled={tic.disabled} onClick={() => this.editTicket(index)}>Edit</Dropdown.Item>
                                            <Dropdown.Divider />
                                            {((mode === 'create') || ((mode === 'edit') && (index >= oldTicketLength))) && (<Dropdown.Item onClick={() => this.deleteTicket(index)}>Delete</Dropdown.Item>)}
                                            <Dropdown.Divider />
                                            {((mode === 'edit') && (index < oldTicketLength)) && (!tic.disabled) && (<Dropdown.Item onClick={() => this.disableTicket(index)}>Disable</Dropdown.Item>)}

                                            {((mode === 'edit') && (index < oldTicketLength)) && (!!tic.disabled) && (<Dropdown.Item onClick={() => this.enableTicket(index)}>Enable</Dropdown.Item>)}

                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                {(tic.disabled) && (<Item.Meta>
                                    <span style={{ color: 'red'}}> Ticket is disabled</span>
                                </Item.Meta>)}
                                <Item.Meta>
                                <span className='cinema'>Capacity: {tic.qty} </span>
                                </Item.Meta>
                                <Item.Description>{tic.type === 'donation'? 'Varies' : tic.salesPrice} {currency.abbr.toLocaleUpperCase()}</Item.Description>
                            </Item.Content>
                        </Item>))}   
                    
                    </Item.Group>
                </Segment>
                <Segment inverted>
                    <Header inverted>
                        <Header.Content>Refund Policy <Icon name="asterisk" color='red' size='mini' /></Header.Content>
                        <Header.Subheader>Select a refund policy that determines whether event-goers get ticket refunds if they cancel their ticket reservation.</Header.Subheader>
                    </Header>

                    <Dropdown
                    disabled={mode === 'edit'}
                    fluid
                    selection
                    options={refundOptions}
                    defaultValue={refundPolicy.value}
                    onChange={(e, data) => this.changeRefundPolicy(data)}
                    />
 
                    <Header inverted>
                        <Header.Subheader>NOTE: refund policy can only be set when creating the event and they are not editable after the event is created.</Header.Subheader>
                    </Header>
                </Segment>
                <Button color='pink' onClick={() => this.next()} floated='right'>
                    Save
                    <Icon name='arrow right' />
                </Button>
                <Button color='pink' onClick={()=> this.prev()} floated='left'>
                    <Icon name='arrow left' />
                    Back
                </Button>

            </div>
        )
    }
}
