
import React, { Component } from 'react';
import { Segment, Confirm, Button, Icon, Dropdown, Header, Message, Portal, Form, Divider } from 'semantic-ui-react';
import moment from 'moment';
import {  DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import style from '../Style/Style';

import { FeaturedEventTable } from '../Table/FeaturedEventTable';

export default class FeaturedEvent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            current: props.current,
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
    
    handleRange =(date) => { 
        console.log(date);
        
        const range = {
            start: moment.utc(date.startDate).valueOf(), 
            end: moment.utc(date.endDate).valueOf()
        }
       // console.log('renage; ', range);
        
        this.setState({ promo: { ...this.state.promo, duration: range }})
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

        let date = new Date()
        this.setState({ 
            promo: { 
                state: '',
                costPerDay: countryDetail.featuredEventCostPerDay,
                duration: {
                    start: date, 
                    end: date
                },
                cost: 0,
               // done: false,
                // clicks: 0,
                // sales: 0,
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
            totalCost: current.details.reduce((acc, curr) => acc + (Math.floor((curr.duration.end - curr.duration.start) / 86400000) * curr.costPerDay), 0)
        }, () => this.handleClosePortal())
    }
    
    savePromo = () => {
        const { current, promo, currentPromo } = this.state;
        this.setState({ promoError: {} }, () => {
            const error = this.validatePromo(promo, current, currentPromo);

            if (Object.keys(error).length === 0) {
                promo.cost = (Math.floor((promo.duration.end - promo.duration.start) / 86400000) * promo.costPerDay);
                if (currentPromo === -1) {
                    current.details.push(promo)
                } else {
                    current.details[currentPromo] = promo;
                }
        
                this.setState({
                    current: current,
                    totalCost: current.details.reduce((acc, curr) => acc + (Math.floor((curr.duration.end - curr.duration.start) / 86400000) * curr.costPerDay), 0)
                }, () => this.handleClosePortal())
            } else {
                this.setState({ promoError: error })
            }
        })

    }

    validatePromo = (promo, current, currentPromo) => {   
        const {prevPromos, time} = this.props;   
        const error = {};

       // console.log('prevPromos: ', prevPromos);

        if (!promo.state) error.state = 'Select a state';
        if ((currentPromo === -1) && !!promo.state && current.details.map((dt) => dt.state).includes(promo.state)) error.state = `${promo.state} promotion is already exist.`;
        if (promo.duration.start === promo.duration.end)  error.duration = 'Select the duration of your promotion';
        if (promo.state && (promo.duration.start !== promo.duration.end)) {
            let conflict = [];
            prevPromos.forEach(prev => {
                // prev.detail.forEach(detail => {
                    if (promo.state === prev.detail.state) {
                        let hasError = false;
                        if (((prev.detail.duration.start < promo.duration.start) && (prev.detail.duration.end > promo.duration.start)) || ((prev.detail.duration.start < promo.duration.end) && (prev.detail.duration.end > promo.duration.end))) {
                            hasError = true;
                        } else if ((promo.duration.start < prev.detail.duration.start) && (promo.duration.end > prev.detail.duration.end) ) {
                            hasError = true;
                        } else if ((promo.duration.start === prev.detail.duration.start) && (promo.duration.end  >= prev.detail.duration.end) ) {
                            hasError = true;
                        } else if ((promo.duration.end === prev.detail.duration.end) && (prev.detail.duration.start  >= promo.duration.start) ) {
                            hasError = true;
                        }

                        if (hasError) {
                            conflict.push(`You already have a promotion running from ${moment.utc(prev.detail.duration.start).utcOffset(time.localOffset).format('YYYY-MM-DD')} to ${moment.utc(prev.detail.duration.end).utcOffset(time.localOffset).format('YYYY-MM-DD')} in ${promo.state}. You cannot have two or more featured event promotions running in a state.`)
                        }
                    }
                // })
            });

            if (conflict.length > 0) {
                error.conflict = conflict;
            }
        }
        return error;
    }

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
                    totalCost: current.details.reduce((acc, curr) => acc + (Math.floor((curr.duration.end - curr.duration.start) / 86400000) * curr.costPerDay), 0)
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
        const { countryDetail, currency, time }  = this.props;
        
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
                                    <label>Duration <Icon name="asterisk" color='red' size='mini' /></label>

                                    {(promo.duration) && (<DateRange
                                        onChange={item => this.handleRange(item.selection)}
                                        showSelectionPreview={true}
                                        moveRangeOnFirstSelection={false}
                                        months={2}
                                        minDate={new Date()}
                                        maxDate={new Date(time.end)}
                                        ranges={[{
                                            startDate: new Date(promo.duration.start),
                                            endDate: new Date(promo.duration.end),
                                            key: 'selection'
                                        }]}
                                        direction='horizontal'
                                        // scroll={{ enabled: true }}
                                    />)}
                                
                                    {(!!promoError.duration) && <p style={{ color: 'red' }}>{promoError.duration}</p>}

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



                    <FeaturedEventTable
                        details={current.details} 
                        currency={currency} 
                        editPromo={(index) => this.editPromo(index)} 
                        deletePromo={(index) => this.deletePromo(index)} 
                        totalCost={totalCost}
                        time={time}
                        view={false}
                    />
                
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
