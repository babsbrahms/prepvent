import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import { Segment, Card, Image, Icon, Menu, Placeholder, Label, Button, Modal, Form, Dropdown, Checkbox, Header, Popup, Message, Input } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
//import qs from 'query-string';
import validator from 'validator';
import style from '../Style/Style';
import { fetchAllEventsAction } from '../../actions/event';
import SocialShare from '../Views/SocialShare';
import likeEvent from '../Fuctions/likeEvent';
import MessageBox from '../Views/MessageBox';
import Carousel from '../Views/Carousel';
import { updateSubscription } from '../../actions/register';
import { getFeaturedEvent } from '../../actions/promotion'
import HtmlHeader from '../Views/HtmlHeader';
import moment from 'moment';


// this.props.location.search

export class Home extends Component {
    constructor(props) {
        super(props);
        this.state={
            activeItem: 'All',
            events: props.events,
            loading: true,
            state: props.state || 'Lagos',
            country: props.country || 'Nigeria',
            subscriber: {
                subscribe: true,
                // name: this.props.customer.name || '',
                email: this.props.customer.email || '',
                // phoneNumber: this.props.customer.phoneNumber|| '',
                states: [],
                country: props.country || 'Nigeria',
            },
            subscriberError: '',
            openModal: false,
            carouselImages: [ ],
            bigSize: document.body.clientWidth >= 481,
        }
        this.messageBox = React.createRef()
    }


    componentDidMount () {
        const { state, country } = this.state;

        const { selectedState, selectedCountry } = this.props;

        // resize
        window.addEventListener('resize', this.reportWindowSize);

        // fetch
        // let params = qs.parseUrl(this.props.location.search)
        // console.log('params: ', { state: params.query.state, country: params.query.country });
        
        if (selectedCountry !== country) {
            
            this.setState({ state: selectedState, country: selectedState }, () => {
                this.loadData(selectedState, selectedCountry)
                this.fetchFeaturedEvent(selectedState, selectedCountry)
            }) 
              
        } else {
            this.loadData(state, country)
            this.fetchFeaturedEvent(state, country)
        }

        
    }

    fetchFeaturedEvent = (state, country) => {
        getFeaturedEvent(state, country)
        .then(result => {
            if (result.data.promotions.length >= 1) {
                let ordered = this.shuffle(result.data.promotions)
                this.setState({  carouselImages: ordered })
            } else {
                this.setState({  carouselImages: result.data.promotions })
            }
        })
        .catch(error => this.messageBox.addMessage('Error', `${error.msg || 'Error fetching featured events'}`, false, true))
    }

    shuffle = (array) => {
        let currentIndex = array.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
        return array;
    }

    reportWindowSize = () => {   
        if (document.body.clientWidth >= 481) {
            if(!this.state.bigSize) {
                this.setState({ bigSize: true })
            }
        } else {
            if(this.state.bigSize) {
                this.setState({ bigSize: false })
            }
        }
    }

    loadData = (state, country) => {
        const { fetchAllEvents } = this.props;
            
            fetchAllEvents(state, country)
            .then(result => this.setState({ loading: false, events: result.payload.allEvents, state: result.payload.state, country: result.payload.country  }))
            .catch(error => this.setState({ loading: false }, () => {
                this.messageBox.addMessage('Error', `${error.msg || 'Error fetching events'}`, false, true)
            }))
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    handleItemClickSmall = (e, { value }) => this.setState({ activeItem: value })

    onChange = data => this.setState({ subscriber: { ...this.state.subscriber, [data.name] : data.value } })
    
    addState = (data, country) => {
        this.setState({ state: data.value, country },() => {
          this.loadData(data.value, country)
          this.fetchFeaturedEvent(data.value, country)
        })    
    }

    subscribeToPrepvent = () => {
        const { subscriber } = this.state;

        this.setState({ subscriberError : '' }, () => {
            let error = this.validateSubscriber()
            console.log(error);
            
            if (error)  {
                this.setState({ subscriberError: error })
            } else {
                this.setState({ openModal: false }, () => {
                    this.messageBox.addMessage('Info', 'Sending event update subscription!', true, false)
                    updateSubscription(subscriber)
                    .then((res) => { 
                        if (res.data.error) {
                            this.messageBox.addMessage('Error', res.data.error , false, false)
                        } else {
                            this.messageBox.addMessage('Success', `${res.data.msg || 'You have successfully subscribe for event update'}` , true, false)
                        }                 
                    }) 
                    .catch(err => { this.messageBox.addMessage('Error', `${err.response.data.msg || 'Problem subscribing for event update'}`, false, false)})
                })
            }
        })
    }

    validateSubscriber = () => {
        const { subscriber } = this.state;
        let error = ''
        
        if (!subscriber.email && (subscriber.states.length === 0)) {
            error = 'Select the states you want to recieve event update from and add your email address.'
        } else if (!validator.isEmail(subscriber.email)) {
            error = 'Enter a valid email address'
        } else if (subscriber.states.length === 0) {
            error = 'Select the states you want to recieve event update from.'
        }
         
        return error;
    }


    render() {
        const { events, activeItem, loading, state, subscriber, carouselImages, subscriberError, openModal, country, bigSize } = this.state;
        const { hostname } = this.props;
        
        let dateFilter = '';

        if (activeItem === 'All') {
            dateFilter = '';
        } else if (activeItem === 'Today') {
            dateFilter = moment.utc().format('ddd Do MMMM YYYY');
        } else if (activeItem === 'This Month') {
            dateFilter = moment.utc().format('MMMM YYYY');
        }
        
        return (
        <div className="ui container">
            <Segment inverted>
                <Menu inverted pointing secondary>
                    {(bigSize) && (<Menu.Item
                        name='All'
                        active={activeItem === 'All'}
                        onClick={this.handleItemClick}
                    />)}
                    {(bigSize) && (<Menu.Item
                        name='This Month'
                        active={activeItem === 'This Month'}
                        onClick={this.handleItemClick}
                    />)}
                    {(bigSize) && (<Menu.Item
                        name='Today'
                        active={activeItem === 'Today'}
                        onClick={this.handleItemClick}
                    />)}

                    {(!bigSize) && (<Menu.Item position='left'>
                        <Dropdown
                            placeholder='Range'
                            defaultValue={activeItem}
                            // search
                            selection
                            options={[{ name: 'All', value: 'All', text: 'All' }, { name: 'This Month', value: 'This Month', text: 'This Month' }, { name: 'Today', value: 'Today', text: 'Today' }]}
                            compact
                            onChange={(e, data) => this.handleItemClickSmall(e, data)}
                        />
                    </Menu.Item>)}

                    <Menu.Item position='right'>
                        <Dropdown
                            placeholder='Select State'
                            defaultValue={state}
                            search
                            selection
                            options={this.props.selectedCountryStates.map(state => ({ key: state, text: state, value: state }))}
                            compact
                            onChange={(e, data) => this.addState(data, this.props.selectedCountry)}
                        />
                    </Menu.Item>
                </Menu>
                {(carouselImages.length > 0) && (<div>
                    <Carousel bigSize={this.state.bigSize} images={carouselImages} />
                    <h3 style={{ textAlign: 'center', marginTop: '0px'}}>featured events</h3>
                </div>)}
            </Segment>
            <HtmlHeader />
            
            {(loading) && (<Segment>
                <Card.Group doubling itemsPerRow={3} stackable>
                    {[1,2,3].map(card => (
                        <Card key={card}>
                                <Placeholder>
                                <Placeholder.Image square />
                                </Placeholder>   
                            <Card.Content>
                                
                                <Placeholder>
                                    <Placeholder.Header>
                                    <Placeholder.Line length='very short' />
                                    <Placeholder.Line length='medium' />
                                    </Placeholder.Header>
                                    <Placeholder.Paragraph>
                                    <Placeholder.Line length='short' />
                                    </Placeholder.Paragraph>
                                </Placeholder>
                            </Card.Content>

                            <Card.Content extra>
                                <div style={style.spacebetween}>
                                    <div>
                                        <a>
                                            <Icon disabled name='heart' /> 
                                        </a>
                                        <a>
                                            <Icon disabled name='share' />   
                                        </a>
                                    </div>
                                    <div style={style.alignedRight}>
                                        <Label  size='tiny' color='pink'>
                                            . . .
                                        </Label>
                                    </div>
                                </div>
                            </Card.Content>
                        </Card>
                    ))}
                </Card.Group>
            </Segment>)}
            
            {(!loading) && (<Segment>
                {(events.length === 0) && (<div>
                    <Header as='h3' icon textAlign='center'>
                        <Icon name='find' color='red'/>
                        <Header>
                            <Header.Content>
                                Not found
                            </Header.Content>
                            <Header.Subheader>
                                There is no event in {state}, {country}. Search for events in other states...
                            </Header.Subheader>
                        </Header>
                    </Header>
                </div>)}



                <Card.Group doubling itemsPerRow={3} stackable>
                    {(events.length > 0) && events.filter(x => (x.time.startStr).includes(dateFilter)).map((event, index) =>(
                    <Card raised key={index.toString()}>
                        <Image src={event.poster} wrapped ui={false} />
                        <Card.Content extra>
                           
                                <div style={style.center}>
                                    <span>{(moment.utc().format('ddd Do MMMM YYYY') === moment.utc(event.time.start).format('ddd Do MMMM YYYY'))? `Today at ${moment.utc(event.time.start).format('hh:mm a')}`: `${event.time.startStr}`}</span>
                                </div>
                            
                        </Card.Content>

                            <Card.Content>                        
                                <Link to={`/event/${event._id}/${event.name}`}>
                                <Card.Header as='h3' color='black'>{event.name}</Card.Header>
                                </Link>
                                <Card.Description>
                                    {event.location.text}
                                </Card.Description>
                            </Card.Content>
                        
                        <Card.Content extra>
                            <div style={style.spacebetween}>
                                <div>
                                    <a>
                                        <Popup style={{ backgroundColor: '#e61a8d', color: 'white'}} trigger={<Icon name='heart' onClick={() => likeEvent({ _id: event._id, name: event.name, location: event.location, time: event.time })}/>} on='click'>
                                            <Popup.Content>Liked!</Popup.Content>
                                        </Popup> 
                                    </a>
                                    <a>
                                        <Popup on='click' trigger={<Icon name='share' /> }>
                                            <Popup.Content>
                                                <Header as='h4' textAlign="center">Share</Header>
                                                <SocialShare title={event.name} image={event.poster} tag={event.tag} description={event.promoText|| ''} url={`${hostname}/e/${event._id}`} size={'large'}/>
                                            </Popup.Content>
                                        </Popup>
                                          
                                    </a>
                                </div>
                                <div style={style.alignedRight}>
                                    {(event.free) && (<Label size='tiny' color='pink'>
                                    FREE
                                    </Label>)}
                                </div>
                            </div>
                        </Card.Content>
                    </Card>
                    

                    ))}

                    {(events.length > 0) && (events.filter(x => (x.time.startStr).includes(dateFilter)).length === 0) && (
                        <Header as='h3' icon textAlign='center'>
                            <Icon name='find' color='red'/>
                            <Header>
                                <Header.Subheader>
                                    There is no event in <b>{state}</b> starting <b>{activeItem.toLocaleLowerCase()}</b>. Use the selection at the top left corner to filter event
                                </Header.Subheader>
                            </Header>
                        </Header>
                    )}
                </Card.Group>
            </Segment>)}  


            {/* <div style={style.center}>
                <Pagination defaultActivePage={1}  totalPages={5} />
            </div> */}


            <Modal 
            open={openModal} 
            onOpen={() => this.setState({ openModal: true })} 
            onClose={() => this.setState({ openModal: false, subscriberError: '' })} 
            trigger={
                <div style={{ position: 'fixed', bottom: '15%', right: '10%' }}>
                    <Button color='pink' circular> 
                        Sign up for event updates
                    </Button>
                </div>} closeIcon>
                <Modal.Header>Event Updates</Modal.Header>
                <Modal.Content>
                    <Modal.Description>
                        {(!!subscriberError) && (<Message error>
                            <Message.Header>Error</Message.Header>
                            <Message.Content>
                                {subscriberError}
                            </Message.Content>
                        </Message>)}
                        <Form>
                            <Form.Field>
                                <label>States <Icon name="asterisk" color='red' size='mini' /></label>
                                <Dropdown 
                                error={subscriberError.includes('state')} 
                                placeholder='Select the state you want to recieve event update from' 
                                fluid 
                                search
                                multiple 
                                selection 
                                options={this.props.selectedCountryStates.map(state => ({ key: state, text: state, value: state }))} 
                                defaultValue={subscriber.states} 
                                onChange={(e,data) => this.setState({ subscriber: { ...this.state.subscriber, states: data.value }})} />
                            </Form.Field>
                            {/* <Form>
                                <label>Name</label>
                                <Input type={'text'} name='name' placeholder='Enter your name' onChange={(e, data) => this.onChange(data)} defaultValue={subscriber.name}/>
                            </Form> */}
                            <Form.Field>
                                <label>Email <Icon name="asterisk" color='red' size='mini' /></label>
                                <Input error={subscriberError.includes('email')} type={'email'} placeholder={'Enter your email address'} name='email' defaultValue={subscriber.email}  onChange={(e, d) => this.onChange(d)}/>
                            </Form.Field>

                            {/* <Form>
                                <label>SMS (WhatsApp)</label>
                                <Input type='tel' placeholder='Enter your phone number' onChange={(e, data) => this.onChange(data)} defaultValue={subscriber.phoneNumber}/>
                            </Form> */}
                            <Form.Field>
                                <Checkbox disabled checked label='I accept the terms of service and have read the privacy policy. I agree to recieve notifications about new events in the above locations.' />                              
                            </Form.Field>
                        </Form>                 
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Link to={'/subscriptions'}>manage subscription</Link>
                    <Button onClick={() => this.subscribeToPrepvent()} color={'pink'}>
                        Register
                    </Button>
                </Modal.Actions>
            </Modal>
            <MessageBox ref={c=> (this.messageBox = c)} />
        </div> 
         
        )
    }
}

const mapStateToProps = (state) => ({
    events: state.events.allEvents,
    state: state.events.state,
    country: state.events.country,
    customer: state.customer,
    hostname: state.events.hostname,
    selectedCountry: state.country.name,
    selectedState: state.country.mecca,
    selectedCountryStates: state.country.states 

})

const mapDispatchToProps = {
    fetchAllEvents: fetchAllEventsAction
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
