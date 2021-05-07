import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import moment from "moment";
import { Step, Segment, Icon, Header, Dimmer, Loader, Image } from 'semantic-ui-react';
import BasicInfo from '../Forms/BasicInfo';
import Details from '../Forms/Details';
import Ticketing from '../Forms/Ticketing';
import Preview from '../Forms/Preview';
import { getMyEventAndTicket } from '../../actions/event';
import MessageBox from '../Views/MessageBox';
import { editEventAction } from '../../actions/event'
import HtmlHeader from '../Views/HtmlHeader';
import { uploadImage } from '../fbase'


export class Edit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentForm: 'BasicInfo',
            // currentIndex: 0,
            maxIndex: 3,
            mode: 'edit',
            data: {},
            oldPoster: '',
            eventId: this.props.match.params.eventId,
            loading: true,
            oldTicketLength: 0,
            openConfirm: false

        };
        this.messageBox = React.createRef()
        
    }
    
    componentDidMount() {
        const { eventId} = this.state;
        this.getEvent(eventId)
    }

    getEvent = (id) => {
            getMyEventAndTicket(id)
            .then(result => {
                if (result.data.event && result.data.event._id) {
                    //check if event have ended
                    if (moment.utc().valueOf() > result.data.event.time.end ) {
                        this.messageBox.addMessage('Error', 'You cannot edit event that have ended', false, true)        
                    } else {
                        // check if it is your event
                        if (result.data.event.organizer.userId === this.props.user._id) {
                            if (result.data.event.deleted) {
                                this.setState({ loading: false }) 
                                this.messageBox.addMessage('Error', 'This event has been deleted!', false, true);
                            } else {
                                this.setState({ loading: false, data: result.data.event, oldPoster: result.data.event.poster,  oldTicketLength: result.data.event.ticket.length  }) 
                            }
                        } else {
                            this.messageBox.addMessage('Error', 'This is not your event', false, true);
                        }
                    }
                } else {
                    this.messageBox.addMessage('Error', `${result.data.error || 'Event does not exixt'}` , false, true);
                }
            })
            .catch(error => this.messageBox.addMessage('Error', `${error.msg || 'Error fetching events'}`, false, true))
    }

    editEvent = () => {
        const {user} = this.props;
        const { data, oldPoster } = this.state;

        this.setState({ loading: true }, () => {
            if (typeof data.poster === 'string') {
                this.uploadEvent(data)
            } else { 
                this.uploadPoster(data.poster, user._id, oldPoster)
            }
        })
    }

    uploadEvent = (data) => {
        const { editEvent } = this.props;
        this.messageBox.addMessage('Info', `Editting event. please wait...`, true, true)

        editEvent(data)
        .then(() => {
            this.props.history.push(`/dashboard/${data._id}`)
        })
        .catch((error) => {
            console.log(error);
            
            this.setState({ loading: false })
            this.messageBox.addMessage('Error', `${error.msg || 'Error editing your event' }`, false, true)
        }) 
    }

    
    uploadPoster = (poster, userId, oldPoster) => {
        // let index = oldPoster.split("/").findIndex(x => x.startsWith('events'));

        // let name = oldPoster.split("/")[index].slice(7).split("?")[0];

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
                // let unix = 1580482524000;
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
            <HtmlHeader page='Edit' />
            
            <Segment inverted>
                <Header as='h1' textAlign='center'>
                    <Header.Content>
                        Edit Event
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
                    countries = {countries}
                    addAlert={(h, m, s, p) => this.messageBox.addMessage(h, m, s, p)}
                    mode={mode}
                    next={(name, time, location, category, eventType, currency) => this.setState({ currentForm: 'Details', maxIndex: 3, data: { ...this.state.data, name, time, location, category, eventType, currency }})}
                />)}


                {(currentForm === 'Details') && (<Details 
                promoText={data.promoText} 
                poster={data.poster} 
                summary={data.summary} 
                organizer={data.organizer} 
                tag={data.tag} 
                addAlert={(h, m, s, p) => this.messageBox.addMessage(h, m, s, p)}
                mode={mode}
                next={(poster, summary, organizer, tag, promoText) => this.setState({ currentForm: 'Ticketing',  maxIndex: 3, data: { ...this.state.data, poster, summary, organizer, tag, promoText } })} 
                prev={(poster, summary, organizer, tag, promoText) => this.setState({ currentForm: 'BasicInfo',  data: { ...this.state.data, poster, summary, organizer, tag, promoText }})}
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
                next={(ticket, free, refundPolicy) => this.setState({ currentForm: 'Preview', maxIndex: 3, data: { ...this.state.data, ticket, free, refundPolicy } })} 
                prev={(ticket, refundPolicy) => this.setState({ currentForm: 'Details', data: { ...this.state.data, ticket, refundPolicy } })} 
                />)}


                {(currentForm === 'Preview') && (<Preview 
                customer={customer} 
                data={data} 
                organizer={user} 
                mode={mode}
                hostname={hostname}
                addAlert={(h, m, s, p) => this.messageBox.addMessage(h, m, s, p)}
                next={() => this.editEvent()} 
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
    editEvent: editEventAction
}

export default connect(mapStateToProps, mapDispatchToProps)(Edit)