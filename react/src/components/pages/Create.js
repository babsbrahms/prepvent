import React, { Component } from 'react'
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from "moment";
import qs from 'query-string';
import { Step, Segment, Icon, Header, Dimmer, Loader, Image } from 'semantic-ui-react';
import BasicInfo from '../Forms/BasicInfo';
import Details from '../Forms/Details';
import Ticketing from '../Forms/Ticketing';
import Preview from '../Forms/Preview';
import MessageBox from '../Views/MessageBox';
import { getMyEventAndTicket } from '../../actions/event';
import { creatEventAction } from '../../actions/event';
import HtmlHeader from '../Views/HtmlHeader';
import { uploadImage } from '../fbase'


export class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentForm: 'BasicInfo',
            // currentIndex: 0,
            maxIndex: 0,
            mode: 'create',
            loading: false,
            data: {
                name: "",
                time: {
                    start: (moment.utc().valueOf() + 86400000),
                    end: (moment.utc().valueOf() + 93600000),
                    startStr: moment(moment.utc().valueOf() + 86400000).format(props.timeString),
                    endStr: moment(moment.utc().valueOf() + 93600000).format(props.timeString),
                    localOffset: `${new Date().toString().match(/([-\+][0-9]+)\s/)[1].substr(0, 3)}:${new Date().toString().match(/([-\+][0-9]+)\s/)[1].substr(3)}`
                },
                location: {
                    text: '',
                    street: '',
                    city: '',
                    state: '',
                    country: '',
                    position: {}
                },
                category: '',
                eventType: '',
                poster: '',
                summary: '',
                tag: "",
                free: false,
                organizer: {
                    userId: props.user._id || '',
                    name: props.user.name || '',
                    phoneNumber: props.user.phoneNumber || '',
                    email: props.user.email || ''
                },
                ticket: [],
                ticketChargeRate: 8.5,
                refundPolicy: {
                    value: 'NOT', 
                    text: 'Tickets are NOT refundable'
                },
                currency: {
                    name: '',
                    abbr: ''
                },
                invitationLetter: '',
                promoText: '',
                published: true,
                deleted: false,

            },
            oldTicketLength: 0,
            openConfirm: false

        };
        this.messageBox = React.createRef()
        
    }

    componentDidMount() {
        let params = qs.parseUrl(this.props.location.search)
        
        if (params && params.query.id) {
            this.setState({ loading: true }, () =>{
                this.getEvent(params.query.id)
            })    
        }
    }

    getEvent = (id) => {
        const { data } = this.state;
        getMyEventAndTicket(id)
        .then(result => {               
            if (result.data.event && result.data.event._id) {

                this.setState({ loading: false, data: { 
                    // ...result.data.event, 
                    ...data,
                    name: result.data.event.name,
                    location: result.data.event.location,
                    category: result.data.event.category,
                    eventType: result.data.event.eventType || '',
                    poster: result.data.event.poster,
                    summary: result.data.event.summary,
                    tag: result.data.event.tag,
                    promoText: result.data.event.promoText,
                    
                }  }) 

            } else {
                this.messageBox.addMessage('Error', `${ result.data.error || 'Event does not exist'}`, false, true);
                this.setState({ loading: false })
            }
        })
        .catch(error => this.messageBox.addMessage('Error', `${error.msg || 'Error fetching events'}`, false, true))
    }

    createNewEvent = () => {
        const {user} = this.props;
        const { data } = this.state;

        this.setState({ loading: true }, () => {
            if (typeof data.poster === 'string') {
                this.uploadEvent(data)
            } else { 
                this.uploadPoster(data.poster, user._id)
            }
        })
    }

    uploadEvent = (data) => {
        const { creatEvent } = this.props;
        this.messageBox.addMessage('Info', `Creating event. please wait...`, true, true)
        creatEvent(data)
        .then((res) => {
           // console.log('res: ', res);
            this.props.history.push(`/dashboard/${res.payload._id}`)
        })
        .catch((error) => {
            this.setState({ loading: false })
            this.messageBox.addMessage('Error', `${error.msg || 'Error creating event' }`, false, true)
        }) 
    }

    uploadPoster = (poster, userId) => {
        var uploadTask =  uploadImage('events', `${userId}-${moment.utc().valueOf()}-${poster.name}`, poster)
        uploadTask.on('state_changed', (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          this.messageBox.addMessage('Info', `Uploading poster:  ${progress.toFixed(2)}% uploaded `, true, true)
    
        }, (error) => {
          // Handle unsuccessful uploads
          this.setState({ loading: false })
          this.messageBox.addMessage('Error', error.message, false, true)
        }, () => {
          // Handle successful uploads on complete
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            this.setState({ data: { ...this.state.data, poster: downloadURL } }, () => {
                this.uploadEvent(this.state.data)
            })
          });
        });
    }

    render() {
        const { currentForm, data, loading, mode, oldTicketLength } = this.state;
        const { user, timeString, customer, hostname, countries } = this.props;

        //        let unix = 1580482524000;
        // let dateVal = 'Fri Jan 31 2020 15:55:24 GMT+0100 (West Africa Standard Time)'
        // console.log('Convert to LOCAL',moment(dateVal).utcOffset("+04:00").format('YYYY MMM Do ddd  hh:mm a'))
        // console.log('get timezone in min (UTC(0min) - TimeZone(min)): ',moment(dateVal).zone())
        // console.log('local time offset value:', new Date().toString().match(/([-\+][0-9]+)\s/)[1])
        
        
        return (
        <div className="ui container">
            {/* <Confirm
                open={this.state.openConfirm}
                content={disclamer}
                cancelButton='Never mind'
                confirmButton="Create Event"
                onCancel={() => this.setState({ openConfirm: false })}
                onConfirm={this.createNewEvent}
            /> */}
            <HtmlHeader page='Create'/>
            
            <Segment inverted>
                <Header as='h1' textAlign='center'>
                    <Header.Content>
                        Create Event
                    </Header.Content>
                </Header>
            </Segment>
            <Step.Group attached='top'>
                <Step onClick={() => this.setState({ currentForm: 'BasicInfo' })} active={this.state.currentForm === 'BasicInfo'} disabled={(this.state.maxIndex < 0) || loading}>
                <Icon name='info' />
                <Step.Content>
                    <Step.Title>Basic Info</Step.Title>
                    {/* <Step.Description>Choose your shipping options</Step.Description> */}
                </Step.Content>
                </Step>
        
                <Step onClick={() => this.setState({ currentForm: 'Details' })} active={this.state.currentForm === 'Details'} disabled={(this.state.maxIndex < 1) || loading}>
                <Icon name='bolt' />
                <Step.Content>
                    <Step.Title>Details</Step.Title>
                    {/* <Step.Description>Enter billing information</Step.Description> */}
                </Step.Content>
                </Step>
        
                <Step onClick={() => this.setState({ currentForm: 'Ticketing' })} active={this.state.currentForm === 'Ticketing'} disabled={(this.state.maxIndex < 2) || loading}>
                <Icon name='money' />
                <Step.Content>
                    <Step.Title>Ticketing</Step.Title>
                </Step.Content>
                </Step>

                <Step onClick={() => this.setState({ currentForm: 'Preview' })} active={this.state.currentForm === 'Preview'} disabled={(this.state.maxIndex < 3) || loading}>
                <Icon name='eye' />
                <Step.Content>
                    <Step.Title>Preview</Step.Title>
                </Step.Content>
                </Step>
          </Step.Group>
      
          {(!loading) && (<Segment attached>
                {(currentForm === 'BasicInfo') && (<BasicInfo 
                    timeString={timeString} 
                    name={data.name} 
                    time={data.time} 
                    location={data.location} category={data.category} eventType={data.eventType}
                    currency={data.currency}
                    addTicketChargeRate={(rate) => this.setState({ ticketChargeRate: rate }) }
                    countries = {countries}
                    addAlert={(h, m, s, p) => this.messageBox.addMessage(h, m, s, p)}
                    mode={mode}
                    next={(name, time, location, category, eventType, currency) => this.setState({ currentForm: 'Details', maxIndex: Math.max(1, this.state.maxIndex), data: { ...this.state.data, name, time, location, category, eventType, currency }})}
                />)}


                {(currentForm === 'Details') && (<Details 
                promoText={data.promoText} 
                poster={data.poster} 
                summary={data.summary} 
                organizer={data.organizer} 
                tag={data.tag} 
                addAlert={(h, m, s, p) => this.messageBox.addMessage(h, m, s, p)}
                mode={mode}
                next={(poster, summary, organizer, tag, promoText) => this.setState({ currentForm: 'Ticketing', maxIndex: Math.max(2, this.state.maxIndex), data: { ...this.state.data, poster, summary, organizer, tag, promoText } })} 
                prev={(poster, summary, organizer, tag, promoText) => this.setState({ currentForm: 'BasicInfo', data: { ...this.state.data, poster, summary, organizer, tag, promoText }})}
                />)}


                {(currentForm === 'Ticketing') && (<Ticketing 
                user={user._id} 
                ticket={data.ticket} 
                refundPolicy={data.refundPolicy}
                oldTicketLength={oldTicketLength}
                currency={data.currency}
                ticketChargeRate={data.ticketChargeRate}
                addAlert={(h, m, s, p) => this.messageBox.addMessage(h, m, s, p)}
                mode={mode}
                next={(ticket, free, refundPolicy) => this.setState({ currentForm: 'Preview', maxIndex: Math.max(3, this.state.maxIndex), data: { ...this.state.data, ticket, free, refundPolicy } })} 
                prev={(ticket, refundPolicy) => this.setState({ currentForm: 'Details', data: { ...this.state.data, ticket, refundPolicy } })} 
                />)}


                {(currentForm === 'Preview') && (<Preview 
                customer={customer} 
                data={data} 
                organizer={user} 
                mode={mode}
                hostname={hostname}
                addAlert={(h, m, s, p) => this.messageBox.addMessage(h, m, s, p)}
                next={() => this.createNewEvent() } 
                prev={() => this.setState({ currentForm: 'Ticketing' })} 
                />)}
          </Segment>)}
          
          {(loading) && (<Segment attached>
                <Dimmer active>
                    <Loader inverted>Loading...</Loader>
                </Dimmer>
                <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
          </Segment>)}
          <MessageBox ref={c=> (this.messageBox = c)} />
        </div>
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.user,
    timeString: state.events.timeString,
    customer: state.customer,
    hostname: state.events.hostname,
    countries: state.country.countries,
    // country: state.country.name,
    // states: state.country.states,
    // currency: state.country.currency,
    // localOffset: state.country.localOffset
})

const mapDispatchToProps = {
    creatEvent: creatEventAction
}

export default connect(mapStateToProps, mapDispatchToProps)(Create)

