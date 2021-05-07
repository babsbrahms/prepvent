
import React, { Component } from 'react';
import { Segment, Confirm, Button, Icon,  Dropdown, Header, Message, Portal, Form, Divider, Input } from 'semantic-ui-react';
// import moment from 'moment';
import style from '../Style/Style';

import { EventUpdateTable } from '../Table/EventUpdateTable';

export default class Update extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            current: props.current,
            gotFollowers: false,
            gettingFollowers: false,
            totalCost: 0,
            error: '',
            openPortal: true,
            promo: {

            },
            currentPromo: -1,
            promoError: {

            }
        }
    }
    

    show = () => this.setState({ open: true })

    handleConfirm = () => this.setState({ open: false }, () => {
        const { closeModal } = this.props;
        closeModal()
    })

    handleCancel = () => this.setState({ open: false })
    
    handleOpenPortal = () => {
        this.setState({ openPortal: true })
    }

    handleClosePortal = () => {
        this.setState({ openPortal: false })
    }

    changePromoData = (data) => this.setState({ promo: { ...this.state.promo, [data.name]: data.value }})

    addPromo = () => {
        const { countryDetail } = this.props;

        this.setState({ 
            promo: { 
                state: '',
                costPerMessage: countryDetail.eventUpdateCostPerMail || 0,
                postCount: 0,
                cost: 0,
                //done: false,
                // clicks: 0,
                // sales: 0,
                postSent: 0,
            },
            currentPromo: -1 
        }, () => this.handleOpenPortal())

    }

    editPromo = (index) => {
        const { current } = this.state;

        this.setState({ 
            promo: current.details[index],
            currentPromo: index
        }, () => this.handleOpenPortal())

    }

    deletePromo = (index) => {
        const { current } = this.state;

        current.details.splice(index, 1);

        this.setState({
            current: current,
            totalCost: current.details.reduce((acc, curr) => acc + (curr.costPerMessage * curr.postCount), 0)
        }, () => this.handleClosePortal())
    }
    
    savePromo = () => {
        const { current, promo, currentPromo } = this.state;
        this.setState({ promoError: {} }, () => {
            const error = this.validatePromo(promo, current, currentPromo);

            if (Object.keys(error).length === 0) {
                promo.postCount = parseInt(promo.postCount, 10);
                promo.cost = Number((promo.costPerMessage * promo.postCount).toFixed(2));
                if (currentPromo === -1) {
                    current.details.push(promo)
                } else {
                    current.details[currentPromo] = promo;
                }
        
                this.setState({
                    current: current,
                    totalCost: current.details.reduce((acc, curr) => acc + (curr.costPerMessage * curr.postCount), 0)
                }, () => this.handleClosePortal())
            } else {
                this.setState({ promoError: error })
            }
        })

    }

    validatePromo = (promo, current, currentPromo) => {  
        const {prevPromos} = this.props;    
        const error = {};

        console.log('prevPromos: ', prevPromos);
        
        if (!promo.state) error.state = 'Select a state';
        if ((currentPromo === -1) && !!promo.state && current.details.map((dt) => dt.state).includes(promo.state)) error.state = `${promo.state} promotion is already exist.`;
        if (promo.postCount < 1)  error.postCount = 'Number of promotion per state should be greater than 0';
        if (promo.postCount > 500)  error.postCount = 'The maximum promotion per state at the moment is 500';
        if (promo.state && (promo.postCount >= 1)) {
            let conflict = [];
            prevPromos.forEach(prev => {
                // prev.detail.forEach(detail => {
                   // console.log("detail: ", detail);
                    
                    if ((promo.state === prev.detail.state) && (prev.detail.postCount >= prev.detail.postSent)) {
                        conflict.push(`You have an event update promotion currently running in ${prev.detail.state} [${prev.detail.postSent} sent out of ${prev.detail.postCount} requested]. The current promotion has to end before you can add a new one.`)
                    }
                // })
            });

            if (conflict.length > 0) {
                error.conflict = conflict;
            }
        }

        return error;
    }

    // getStateFollower = () => {
    //     const { current } = this.state;

    //     const states = current.details.map((dt) => dt.state)
    // }

    submitPromotion = async () => {
        const { current } = this.state;
        const { save } = this.props;

       await this.setState({ error: '' })

        const error = this.validate(current)
        
       await this.setState({ error })

        if (error.length === 0)  {
            this.setState({
                current: {
                    ...this.state.current,
                    totalCost: Number((current.details.reduce((acc, curr) => acc + (curr.costPerMessage * curr.postCount), 0)).toFixed(2))
                }
            }, () => save(this.state.current))
        }

        
    }

    validate = (current) => {
        let error = ''

        if (current.details.length === 0) error = 'No promotion added!';

        return error;
    }

    render() {
        const { current, totalCost, promo, error, openPortal, promoError, currentPromo } = this.state;
        const { countryDetail, currency }  = this.props;
        
        return (
            <div>
                <Confirm
                    open={this.state.open}
                    content='Are you sure you want to cancel promotion?'
                    onCancel={this.handleCancel}
                    onConfirm={this.handleConfirm}
                    cancelButton='Never mind'
                    confirmButton="Yes"
                />
                <Segment>
                    <Header content="Add promotion" />
                    <div style={style.center}>
                        <Icon 
                        size='huge' 
                        name='plus circle' 
                        color='pink' 
                        onClick={() => this.addPromo()} 
                        />
                    </div>
                    <Portal
                        closeOnTriggerClick
                        openOnTriggerClick
                        open={openPortal}
                        onOpen={this.handleOpenPortal}
                        onClose={this.handleClosePortal}
                    >
                        <Segment
                        style={{
                            left: '10%',
                            position: 'fixed',
                            top: '10%',
                            zIndex: 1000,
                            width: '80%',
                            maxHeight: '80%',
                            overflowY: "scroll"
                        }}
                        >
                        <Header textAlign='center' as='h1'>Create {current.type} promotion</Header>
                        <Divider />
                            <Form>
                                <Form.Field>
                                    <label>State <Icon name="asterisk" color='red' size='mini' /></label>
                                    <Dropdown
                                        placeholder='Select a state you want to promote your event in'
                                        fluid
                                        selection
                                        search
                                        disabled={currentPromo !== -1}
                                        error={!!promoError.state}
                                        options={countryDetail.states.map(state => ({ key: state, text: state, value: state }))} 
                                        defaultValue={promo.state}
                                        name='state'
                                        onChange={(e, data) => this.changePromoData(data)}
                                    />
                                                                                             
                                    {(!!promoError.state) && <p style={{ color: 'red' }}>{promoError.state}</p>}

                                </Form.Field>

                                <Form.Field>
                                    <label>Number of post <Icon name="asterisk" color='red' size='mini' /></label>
                                    <Input error={!!promoError.postCount} type='number' name='postCount' defaultValue={promo.postCount} onChange={(e, data) => this.changePromoData(data)} />
                                    {(!!promoError.postCount) && <p style={{ color: 'red' }}>{promoError.postCount}</p>}
                                </Form.Field>

                                {(!!promoError.conflict) && (
                                    <ul>
                                        {promoError.conflict.map((conflict, i) => <li style={{ color: 'red'}} key={`conflict-${i}`}>{conflict}</li>)}
                                    </ul>
                                )}
                                <Button color='pink' size={'small'} fluid onClick={this.savePromo}>
                                    Save
                                </Button>
                            </Form>
                        </Segment>
                    </Portal>
                    
                    <EventUpdateTable 
                        details={current.details} 
                        currency={currency} 
                        editPromo={(index) => this.editPromo(index)} 
                        deletePromo={(index) => this.deletePromo(index)} 
                        totalCost={totalCost}
                        view={false}
                    />
                    <Message>
                        <Message.Header>Disclamer</Message.Header>
                        <Message.Content> We offer refunds for incomplete promotion. Your promotion might not be sent due to organizers not editing their events in your selected state(s). We provide analytics that tracks the number of post sent and other important changes.</Message.Content>
                    </Message>
                </Segment>
                {(!!error) && (<Message error>
                    <Message.Header>Error</Message.Header>
                    <Message.Content>{error}</Message.Content>
                </Message>)}
                <div style={style.alignedRight}>
                    <Button color='red' onClick={() => this.show()} inverted>  
                        <Icon name='close' /> Cancel
                    </Button>
                    <Button color='green' onClick={() => this.submitPromotion()} inverted>
                        <Icon name='checkmark' /> Save
                    </Button>
                </div>
            </div>
        )
    }
}
