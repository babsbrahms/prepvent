import React, { Component } from 'react';
import { Segment, Confirm, Button, Icon, Dropdown, Header, Message, Portal, Form, Divider, Input } from 'semantic-ui-react';
import moment from 'moment';
import '../Style/datatime.css';
import style from '../Style/Style';

import { SocialTable } from '../Table/SocialTable';

export default class Socail extends Component {
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
        this.setState({ 
            promo: {
                media: '',
                costPerPost: 0,
                postDate: '',
                // followers: 0,
                cost: 0,
                done: false,
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
            totalCost: current.details.reduce((acc, curr) => acc + (curr.costPerPost), 0)
        }, () => this.handleClosePortal())
    }

    
    savePromo = () => {
        const { current, promo, currentPromo } = this.state;
        
        this.setState({ promoError: {} }, () => {
            const error = this.validatePromo(promo);

            if (Object.keys(error).length === 0) {
                promo.costPerPost = this.getCost(promo.media);
                promo.cost = this.getCost(promo.media);
                if (currentPromo === -1) {
                    current.details.push(promo)
                } else {
                    current.details[currentPromo] = promo;
                }
        
                this.setState({
                    current: current,
                    totalCost: current.details.reduce((acc, curr) => acc + (curr.costPerPost), 0)
                }, () => this.handleClosePortal())
            } else {
                this.setState({ promoError: error })
            }
        })


    }

    validatePromo = (promo) => {  
        const {prevPromos } = this.props;    
        const error = {}
        // console.log('prevPromos: ', prevPromos);
        
        if (!promo.media) error.media = 'Select a social media method';
        if (!promo.postDate)  error.postDate = 'Select a date to post your event';
        // if (promo.postDate) {
        //     if ((moment(promo.postDate, 'YYYY-MM-DD').valueOf() < moment().local().valueOf() ) || (moment(promo.postDate, 'YYYY-MM-DD').valueOf() > moment(time.end).local().valueOf() )) {
        //         error.postDate = `Add a date between now and the end of your event`
        //     }
        // }
        if (promo.media && promo.postDate) {
            let conflict = [];
            prevPromos.forEach(prev => {
                // prev.detail.forEach(detail => {
                    if ((promo.postDate === prev.detail.postDate) && (promo.media === prev.detail.media)) {
                        conflict.push(`You have ${promo.media} post scheduled for ${promo.postDate}. It is in conflict with this ${promo.media} promotion`)
                    }
                // })
            });

            if (conflict.length > 0) {
                error.conflict = conflict;
            }
        }

        return error;
    }

    getCost = (media) => {
        const { countryDetail } = this.props;

        switch (media) {
            case 'instagram':
                return countryDetail.costPerIntagramPost
            case 'twitter':
                return countryDetail.costPerTwitterPost
            case 'facebook':
                return countryDetail.costPerFacebookPost
            case 'whatsapp':
                return countryDetail.costPerWhatsappPost
                            
            default:
                return 0;
        }
    }
    // getStateFollower = () => {
    //     const { current } = this.state;

    //     const states = current.details.map((dt) => dt.state)
    // }

    submitPromotion = async () => {
        const { current , gotFollowers} = this.state;
        const { save } = this.props;

       await this.setState({ error: '' })

        const error = this.validate(current, gotFollowers)
        
       await this.setState({ error })

        if (error.length === 0)  {
            this.setState({
                current: {
                    ...this.state.current,
                    totalCost: current.details.reduce((acc, curr) => acc + (curr.costPerPost), 0)
                }
            }, () => save(this.state.current))
        }

        
    }

    validate = (current, gotFollowers) => {
        let error = ''

        if (current.details.length === 0) error = 'No promotion added!';
        //if ((current.details.length > 0) && !gotFollowers) error = 'No promotion added!';

        return error;
    }

    render() {
        const { current, totalCost, gettingFollowers, promo, error, openPortal, promoError } = this.state;
        const { currency, time }  = this.props;
        
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
                            <Form 
                            onSubmit={this.savePromo}
                            >
                                <Form.Field>
                                    <label>Media <Icon name="asterisk" color='red' size='mini' /></label>
                                    <Dropdown
                                        fluid
                                        selection
                                        error={!!promoError.media}
                                        options={['twitter', 'instagram', 'facebook', 'whatsapp'].map(country => ({ text: country, value: country, key: country }))}
                                        defaultValue={promo.media}
                                        name='media'
                                        onChange={(e, data) => this.changePromoData(data)}
                                    />
                                </Form.Field>

                                <Form.Field>
                                    <label>postDate <Icon name="asterisk" color='red' size='mini' /></label>
                                    <Input required error={!!promoError.postDate} type='date' name='postDate' defaultValue={promo.postDate} min={moment.utc().format('YYYY-MM-DD')} max={moment.utc(time.end).format('YYYY-MM-DD')} onChange={(e, data) => this.changePromoData(data)} />
                                    {(!!promoError.postDate) && <p style={{ color: 'red' }}>{promoError.postDate}</p>}
                                </Form.Field>
                                {(!!promoError.conflict) && (
                                    <ul>
                                        {promoError.conflict.map((conflict, i) => <li style={{ color: 'red'}} key={`conflict-${i}`}>{conflict}</li>)}
                                    </ul>
                                )}
                                <Button color='pink' size={'small'} fluid 
                                //onClick={this.savePromo}
                                >
                                    Save
                                </Button>
                            </Form>
                        </Segment>
                    </Portal>


                    <SocialTable 
                        details={current.details} 
                        currency={currency} 
                        gotFollowers={gettingFollowers} 
                        // approve={this.getStateFollower}
                        editPromo={(index) => this.editPromo(index)} 
                        deletePromo={(index) => this.deletePromo(index)} 
                        totalCost={totalCost}
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
