import React, { Component } from 'react'
import { Segment, Icon, Button, Form, Dropdown, Checkbox, Header, Input } from 'semantic-ui-react';
import validator  from 'validator';
import { connect } from 'react-redux';
import qs from 'query-string';
import HtmlHeader from '../Views/HtmlHeader';
import MessageBox from '../Views/MessageBox';
import { manageSubscriptions, getSubscriptionStates } from '../../actions/register';
import style from '../Style/Style'

class ManageSubscription extends Component {
    constructor (props)  {
        super(props);
        this.state = {
            subscriber: {
                subscribe: true,
                email: props.customer.email || '',
                states: []
            },
            subscriberError: '',
            loading: true,
            currentIndex: 0,
            oldSubStates: [],
            country: props.country
        };
        this.messageBox = React.createRef();
    }

    componentDidMount() {
        let params = qs.parseUrl(this.props.location.search)

        if (params.query.email ) { 
            this.setState({ loading: true, subscriber: { ...this.state.subscriber, email: params.query.email } }, () => {
                this.getSubscriptions()
            })
            
        } else {
            this.setState({ loading: false })
        }
    }
    
    
    getSubscriptions = () => {
        const { subscriber, country } = this.state;

        if (!validator.isEmail(subscriber.email)) {
            this.messageBox.addMessage('Error', 'Enter a valid email', false, false)
        } else {
            this.setState({ loading: true }, () => {
                getSubscriptionStates(subscriber.email, country)
                .then((res) => { 
                    console.log('states:', res.data.states);
                    let states =res.data.states.map(st => (st.state))
                    this.setState({ loading: false, currentIndex: 1, oldSubStates: res.data.states, subscriber: { ...this.state.subscriber, states: states,  } })
                }) 
                .catch(err => { 
                    this.setState({ loading: false })
                    this.messageBox.addMessage('Error', `${err.response.data.msg || 'Problem getting your subscription'}`, false, false) 
                })
            })
        }
        
    }

    onChange = data => this.setState({ subscriber: { ...this.state.subscriber, [data.name] : data.value } })

    subscribeToPrepvent = () => {
        const { subscriber, country, oldSubStates } = this.state;

        this.setState({ subscriberError : '', loading: true }, () => {
            let error = this.validateSubscriber()
            console.log(error);
            
            if (error)  {
                this.messageBox.addMessage('Error', error, false, false)
                this.setState({ subscriberError: error,  loading: false })
            } else {
                let removeSubscription = [];
                let redundant = [];
                let newSubscription = [];

                oldSubStates.forEach((old, oi) => {
                    if (!subscriber.states.includes(old.state) ) {
                        removeSubscription.push({
                            subscribe: false,
                            email: old.email,
                            state: old.state,
                            country: old.country,
                        })
                    } else {
                        redundant.push(old.state)
                    }
                })
                
                subscriber.states.forEach(state => {
                    if (!redundant.includes(state)) {
                        newSubscription.push({
                            subscribe: true,
                            email: subscriber.email,
                            state,
                            country,
                        })
                    }
                })

                let mergeSubscription = removeSubscription.concat(newSubscription)

                if (mergeSubscription.length > 0) {
                    //let data = this.getQuery(newSubscription, removeSubscription)
                    this.messageBox.addMessage('Success', 'Sending event update subscription!', true, false)
                    manageSubscriptions(mergeSubscription)
                    .then((res) => { 
                        if (res.data.error) {
                            this.messageBox.addMessage('Error', res.data.error , false, false)
                        } else {
                            this.messageBox.addMessage('Success', 'You have successfully updated your subscription', true, false);

                            let latest = subscriber.states.map(state => ({
                                subscribe: true,
                                email: subscriber.email,
                                state,
                                country,
                            }));
                            this.setState({ loading: false, oldSubStates: latest })
                        }
                    }) 
                    .catch(err => { 
                        this.setState({ loading: false })
                        this.messageBox.addMessage('Error', `${err.response.data.msg || 'Problem updating your subscription'}`, false, false)
                    })
                } else {
                    this.setState({ loading: false })
                    this.messageBox.addMessage('Warning', 'Add or remove states to your subscription', true, false)
                }
            
            }
        })
    }



    getQuery = (newSubscription, removeSubscription) => {
        const subscriptions = [];

        newSubscription.forEach(doc => {
            subscriptions.push({ insertOne: { "document": doc } })
        });
    
        removeSubscription.forEach(doc => {
            subscriptions.push({ deleteOne : { "filter" : { "$and": [{state: doc.state}, {email: doc.email}, {country: doc.country}]} } })
        });

        let stateCount = [];

        newSubscription.forEach(target => {
            stateCount.push({
                updateOne: {
                    "filter" : { state: target.state, country: target.country },
                    "update" : { 
                        $set: { state: target.state, country: target.country },
                        $inc: { count: 1 },
                    },
                    "upsert": true
                }
            });
        })

        removeSubscription.forEach(target => {
            stateCount.push({
                updateOne: {
                    "filter" : { state: target.state, country: target.country },
                    "update" : { 
                        $set: { state: target.state, country: target.country },
                        $inc: { count: -1 },
                    },
                }
            });
        })

        return {subscriptions, stateCount}
    }



    validateSubscriber = () => {
        const { subscriber } = this.state;
        let error = ''
        
        if (!validator.isEmail(subscriber.email)) {
            error = 'Enter a valid email address'
        } 
         
        return error;
    }

    changeEmail = () => this.setState({ currentIndex: 0 })

    render() {
        
        const { subscriber, subscriberError, currentIndex, loading } = this.state;
        return (
            <div className="ui container">
                <HtmlHeader page="Manage Subscription" />
                
                <Segment inverted>
                    <Header as='h1' textAlign='center'>
                        <Header.Content>
                            Manage Subscription
                        </Header.Content>
                    </Header>
                </Segment>
                <Segment>
                    <Form loading={loading}>
                            <Form.Field>
                                <label>Email <Icon name="asterisk" color='red' size='mini' /></label>
                                <Input disabled={currentIndex === 1} error={subscriberError.includes('email')} type={'email'} placeholder={'Enter your email address'} name='email' defaultValue={subscriber.email}  onChange={(e, d) => this.onChange(d)}/>
                            </Form.Field>

                            {(currentIndex === 1) && (<Form.Field>
                                <label>States <Icon name="asterisk" color='red' size='mini' /></label>
                                <Dropdown disabled={currentIndex === 0} error={subscriberError.includes('state')} placeholder='Select the state you want to recieve event update from' 
                                fluid multiple 
                                selection 
                                search
                                options={this.props.states.map(state => ({ key: state, text: state, value: state }))} 
                                defaultValue={subscriber.states} 
                                onChange={(e,data) => this.setState({ subscriber: { ...this.state.subscriber, states: data.value }})} />
                            </Form.Field>)}

                            {(currentIndex === 1) && (<Form.Field>
                                <Checkbox disabled checked label='I accept the terms of service and have read the privacy policy. I agree to recieve notifications about new events in the above locations.' />                              
                            </Form.Field>)}
                            
                            {(currentIndex === 0) && (<Button onClick={() => this.getSubscriptions()} color={'pink'}>
                                Get Subscriptions
                            </Button>)}

                            <div style={style.spacebetween}>
                                {(currentIndex === 1) && (<Button onClick={() => this.changeEmail()} color={'pink'}>
                                    Change Email
                                </Button>)}

                                {(currentIndex === 1) && (<Button onClick={() => this.subscribeToPrepvent()} color={'pink'}>
                                    Update Subscription
                                </Button>)}
                            </div>
     
                        </Form>
                </Segment>
                <MessageBox ref={c=> (this.messageBox = c)} />
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    customer: state.customer,
    country: state.country.name,
    states: state.country.states 
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageSubscription)