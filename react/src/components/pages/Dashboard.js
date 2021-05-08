import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import { connect } from 'react-redux';
// import { Tab, Button } from 'semantic-ui-react';
import { Header, Icon, Menu, Segment, Sidebar, Button, Divider, Confirm } from 'semantic-ui-react'
import moment from 'moment';
import Event from '../Views/Event';
import Share from '../Dashboard/Share';
import Ticketing from '../Dashboard/Ticketing';
import Communication from '../Dashboard/Communication';
import AttendanceManagement from '../Dashboard/AttendanceManagement';
import Promotion from '../Dashboard/Promotion';
import { getMyEventAndTicket, getMyEventTicket, cancelEventAction, publishEventAction, deleteEventAction, requestForPayment } from '../../actions/event'
import MessageBox from '../Views/MessageBox';
import getEventById from  '../reselect/myEvents';
import { sendBulkEmail, sendBulkSms, sendFollowerSms, sendFollowersEmail, sendRegisteredSms, sendRegisteredEmail, downloadRegistrationList } from '../../actions/register';
// import { createPromotion } from '../../actions/promotion';
import { updatePaymentAction  } from '../../actions/user';
import HtmlHeader from '../Views/HtmlHeader';
import { getCountryDetails } from '../../actions/country';

export class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            selection: 'Event',
            loading: true,
            data: {},
            eventId: this.props.match.params.eventId,
            fetchingTicket: false,
            open: false,
            confirmText: '',
            countryDetails: {},
            fetchingCountryDetails: true

        };
        this.messageBox = React.createRef()
    } 


    componentDidMount() {
        const { eventId} = this.state;
        this.fetchLocalEvent(eventId)
        // this.getEvent(eventId)
    }

    // componentWillReceiveProps(nextProps)  {
    //     if (nextProps.localEvent && !nextProps.localEvent.deleted) {
    //         this.setState({ data: { ...nextProps.localEvent, ticket: this.state.data.ticket } })
    //     }
    // }

    fetchLocalEvent= ( eventId ) => {
        const { localEvent } = this.props;
        // DOES NOT HAVE TICKET
        if (localEvent) {
            if (localEvent.organizer.userId === this.props.user._id) {
                let hasTicket = localEvent.ticket.length > 0;         

                this.setState({ loading: false, visible: true, data: localEvent, fetchingTicket: !hasTicket }, () => {
                    if (this.state.data.deleted) {
                        this.messageBox.addMessage('Error', 'This event has been deleted!', false, true);
                    } else if (!hasTicket) {
                        this.getMyTicket(eventId)
                        this.getCountryData(localEvent.location.country)
                    }
                });
            } else {
            
                this.messageBox.addMessage('Error', 'This is not your event', false, true);
            }
        } else {
            
            this.getEvent(eventId)
        }
    }

    getMyTicket = (eventId) => {
        // this.messageBox.addMessage('Info', 'We are fetching your ticket. Ticketing and attendance management will disabled for some seconds', true, true);
        this.setState({ fetchingTicket: true }, () => {
            getMyEventTicket(eventId)
            .then((res) => {
                this.messageBox.addMessage('Success', 'Ticket successfully fetched', true, false);
                this.setState({ data: { ...this.state.data, ticket: res.data.ticket }, fetchingTicket: false })
            }).catch((err) => {
                this.setState({ fetchingTicket: false })
                this.messageBox.addMessage('Error', `${err.response.data.msg || 'Problem fetching event ticket.'}`, false, false)
            })
        })

    }

    getEvent = (id) => {
            getMyEventAndTicket(id)
            .then(result => {
                if (result.data.event && result.data.event._id) {
                    if (result.data.event.organizer.userId === this.props.user._id) {
                        if (this.state.data.deleted) {
                            this.messageBox.addMessage('Error', 'This event has been deleted!', false, true);
                        } else {
                            this.setState({ loading: false, visible: true, data: result.data.event },() => {
                                this.getCountryData(result.data.event.location.country)
                            })
                        }
                    } else {
                        this.messageBox.addMessage('Error', 'This is not your event', false, true);
                    }
                } else {
                    this.messageBox.addMessage('Error', `${result.data.msg || result.data.error || 'Event does not found'}`, false, true);
                }
            })
            .catch(error => this.messageBox.addMessage('Error', `${error.msg || 'Error fetching event'}`, false, true))
    }

    getCountryData = ( country ) => {
        this.setState({ fetchingCountryDetails: true }, () => {
            getCountryDetails('Nigeria')
            .then(res => {
                this.setState({
                    countryDetails: res.data.details,
                    fetchingCountryDetails: false
                })
            })
            .catch(error => {
                this.setState({ fetchingCountryDetails: false })
                this.messageBox.addMessage('Error', `${error.msg || 'Error fetching cost of services and other details'}`, false, true)
            })
        })
    }

    
    setVisible = (val) => this.setState({ visible: val })

    // confirm box
    show = () => this.setState({ open: true })
    handleConfirm = () => this.setState({ open: false }, () => {
        const { confirmText } = this.state;
        if (confirmText.startsWith('Publishing')) {
            this.publishEvent()
        } else if (confirmText.includes('delete')) {
            this.deleteEvent()
        } else if (confirmText.includes('cancel')) {
            this.cancelEvent()
        } 
    })
    handleCancel = () => this.setState({ open: false })

    //EVENT
    cancelEvent = () => {
        const { eventId } = this.state;
        const { cancelEvent } = this.props;

        cancelEvent(eventId)
        .then((res) => {
            this.setState({ data: { ...res.payload, ticket: this.state.data.ticket }  }, () => {
                this.messageBox.addMessage('Success', 'Event succesfully cancelled. Contact your event-goers using our "Keep In Touch" feature to notify them of the reason why you cancelled your event.', true, true)
            })
            
        }).catch((err) => {

            if (this.messageBox) {
                this.messageBox.addMessage('Error', `${'Problem cancelling your event'}`, false, false)

            }
            
        })
    }

    publishEvent = () => {
        const { eventId } = this.state;
        const { publishEvent } = this.props;

        this.messageBox.addMessage('Info', 'Making a request to publish your event', true, false)
        publishEvent(eventId)
        .then((res) => {            
            this.props.history.push(`/profile`)
        }).catch((err) => {
            this.messageBox.addMessage('Error', `${err.response.data.msg || 'Problem publishing your event'}`, false, false)
        })
    }

    deleteEvent = () => {
        const { eventId } = this.state;
        const { deleteEvent } = this.props;
        // published == false; deleted: true
        this.messageBox.addMessage('Info', 'Making a request to delete your event', true, false)
        deleteEvent(eventId)
        .then((res) => {  
            this.props.history.push('/profile')
        }).catch((err) => {
            this.messageBox.addMessage('Error', `${err.response.data.msg || 'Problem deleting your event'}`, false, false)
        })
    }

    editEvent = () => {
        const { data } = this.state;
        // CHECK IF THE EVENT HAS NOT ENDED TO EDIT EVENT
        if (moment.utc().valueOf() > moment.utc(data.time.end).valueOf()) {
            this.messageBox.addMessage('Error', 'You cannot edit event that have ended', false, false)
        } else {
            this.props.history.push(`/edit/${data._id}`)
        }
    }

    //KEEP IN TOUCH $ SHARE
    sendBulkEmail = (subject, msg, payment, list, userId, eventId, userName, userEmail, type) => {
        // console.log('bulkEmail: ', {msg, payment, list});

        sendBulkEmail({subject, msg, payment, list, userId, eventId, userName, userEmail, type})
        .then((res) => {
            if (res.data.error) {
                this.messageBox.addMessage('Error', res.data.error , false, false)
            } else {            
                this.messageBox.addMessage('Success', `${res.data.msg || 'Sending your email message'}`, true, false)
            }
        })
        .catch((error) => {
            this.messageBox.addMessage('Error', `${error.msg || 'Problem sending your email message'}`, false, false)

        })
    }

    sendBulkSms = (msg, payment, list, userId, eventId, userName, userEmail, type) => {
       // console.log('bulkSms: ', {msg, payment, list});
    
        sendBulkSms({msg, payment, list, userId, eventId, userName, userEmail, type})
        .then((res) => {
            if (res.data.error) {
                this.messageBox.addMessage('Error', res.data.error , false, false)
            } else {
                this.messageBox.addMessage('Success', `${res.data.msg || 'Sending your sms message'}`, true, false)
            }
        })
        .catch((error) => {
            this.messageBox.addMessage('Error', `${error.msg || 'Problem sending your sms message'}`, false, false)
        })
    }

    sendFollowersEmail = (subject, msg, payment, userId, eventId, userName, userEmail, type) => {
        // console.log('FollowersEmail: ', {msg, payment, userId});

        sendFollowersEmail({subject, msg, payment, userId, eventId, userName, userEmail, type})
        .then((res) => {
            if (res.data.error) {
                this.messageBox.addMessage('Error', res.data.error , false, false)
            } else {
                this.messageBox.addMessage('Success', `${res.data.msg || 'Sending your email message'}`, true, false)
            }
        })
        .catch((error) => {
            this.messageBox.addMessage('Error', `${error.msg || 'Problem sending your email message'}`, false, false)
        })
    }

    sendFollowerSms = (msg, payment, userId, eventId, userName, userEmail, type) => {
       // console.log('FollowersSms: ', {msg, payment, userId});

        sendFollowerSms({msg, payment, userId, eventId, userName, userEmail, type})
        .then((res) => {
            if (res.data.error) {
                this.messageBox.addMessage('Error', res.data.error , false, false)
            } else {
                this.messageBox.addMessage('Success', `${res.data.msg || "Sending your sms message"}`, true, false)
            }
        })
        .catch((error) => {
            this.messageBox.addMessage('Error', `${error.msg || 'Problem sending your sms message'}`, false, false)
        })
    }

    sendRegisteredEmail = (subject, msg, payment, userId, eventId, userName, userEmail, type) => {
        // console.log('RegisteredEmail: ', {msg, payment, eventId});

        sendRegisteredEmail({subject, msg, payment, userId, eventId, userName, userEmail, type})
        .then((res) => {
            if (res.data.error) {
                this.messageBox.addMessage('Error', res.data.error , false, false)
            } else {           
                this.messageBox.addMessage('Success', `${res.data.msg || "Sending your email message"}`, true, false)
            }
        })
        .catch((error) => {
            this.messageBox.addMessage('Error', `${error.msg || 'Problem sending your email message'}`, false, false)
        })
    }

    sendRegisteredSms = (msg, payment, userId, eventId, userName, userEmail, type) => {
       // console.log('RegisteredSms: ', {msg, payment, eventId});

        sendRegisteredSms({msg, payment, userId, eventId, userName, userEmail, type})
        .then((res) => {
            if (res.data.error) {
                this.messageBox.addMessage('Error', res.data.error , false, false)
            } else {
                this.messageBox.addMessage('Success', `${res.data.msg || 'Sending your sms message'}`, true, false)
            }
        })
        .catch((error) => {
            this.messageBox.addMessage('Error', `${error.msg || 'Problem sending your sms message'}`, false, false)
        })
    }


    // PROMOTION
    // addPromotion = (details, payment) => {
    //     this.messageBox.addMessage('Info', `Creating new promotion`, true, false);

    //     createPromotion(details, payment)
    //     .then((res) => {
    //         this.setState({ promotions: res.data.promotions })
    //         this.messageBox.addMessage('Success', `${res.data.msg || 'Promotion successfully added!'}`, true, false)
    //     })
    //     .catch((error) => {
    //         this.messageBox.addMessage('Error', `${error.msg || 'Problem adding your promotion'}`, false, false)
    //     })

    // }


    //TICKETING

    updateUserPayment = (details) => {
        const { updatePayment, user } = this.props;

        this.messageBox.addMessage('Info', 'Making a request to update your payment details', true, false)
        updatePayment({
            bankName: details.bankName,
            accountNumber: details.accountNumber,
            accountName: details.accountName,
        }, user._id)
        .then(() => { this.messageBox.addMessage('Success', 'Payment details successfully updated', true, false) }) 
        .catch(err => { this.messageBox.addMessage('Error', `${ err.response.data.msg || 'Problem updating your payment details'}`, false, false)})
    
    }


    collectPayment = (eventId, userId, ticketIds) => {
        requestForPayment(eventId, userId, ticketIds)
        .then((res) => { this.messageBox.addMessage('Success', `${res.data.msg || 'You will get paid within 2-7 working days.'}`, true, false) }) 
        .catch(err => { this.messageBox.addMessage('Error', `${ err.response.data.msg || 'Problem request for ticket revenue'}`, false, false)})
    }

    // CHECKIN
    getRegistrationList = (eventId) => {
        const { data } = this.state;
        this.messageBox.addMessage('Info', 'Getting your registration list', true, false)
        downloadRegistrationList(eventId)
        .then((res) => { 
            
            this.startDownload(`${data.name} Registeration List.csv`, res.data);

            this.messageBox.addMessage('Success', 'Registration list download will start shortly', true, false) 
        }) 
        .catch(err => { this.messageBox.addMessage('Error', `${ err.response.data.msg || 'Problem donwloading registration list'}`, false, false)})
    }

    startDownload = (filename, text) => {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
    
        element.style.display = 'none';
        document.body.appendChild(element);
    
        element.click();
    
        document.body.removeChild(element);
    }


    render() {
        const { selection, visible, data, loading, fetchingTicket, confirmText, countryDetails, fetchingCountryDetails } = this.state;
        const { user, customer, hostname } = this.props;

        return (
            <div>
                <HtmlHeader page='Dashboard'/>
                
                <Confirm
                    open={this.state.open}
                    content={confirmText}
                    onCancel={this.handleCancel}
                    onConfirm={this.handleConfirm}
                    cancelButton='Never mind'
                    confirmButton="Yes"
                />
                <Sidebar.Pushable as={Segment}>
                    <Sidebar
                        as={Menu}
                        animation='overlay'
                        icon='labeled'
                        inverted
                        onHide={() => this.setVisible(false)}
                        vertical
                        visible={visible}
                        width='thin'
                    >
                        <Menu.Item as='a' disabled={data.deleted} onClick={() => this.setState({ selection: 'Event', visible: false })}> <Icon name='calendar alternate outline' />Event</Menu.Item>
                        <Menu.Item as='a' disabled={data.deleted && (moment.utc().valueOf() > moment.utc(data.time.end).valueOf())} onClick={() => this.setState({ selection: 'Share', visible: false })}> <Icon name='share square' />Share</Menu.Item>
                        <Menu.Item as='a' disabled={data.deleted} onClick={() => this.setState({ selection: 'Ticketing', visible: false  })}> <Icon name='ticket' />Ticketing</Menu.Item>
                        <Menu.Item as='a' disabled={data.deleted} onClick={() => this.setState({ selection: 'Keep In Touch', visible: false  })}> <Icon name='tty' />Keep In Touch</Menu.Item>
                        {/* <Menu.Item as='a' disabled={data.deleted && (moment.utc().valueOf() > moment.utc(data.time.end).valueOf())} onClick={() => this.setState({ selection: 'Promotion', visible: false  })}> <Icon name='bullhorn' />Promotion</Menu.Item> */}
                        <Menu.Item as='a' disabled={data.deleted} onClick={() => this.setState({ selection: 'Registration & check-in', visible: false  })}> <Icon name='users' />Registration</Menu.Item>
                    
                    </Sidebar>

                    <Sidebar.Pusher dimmed={visible}>
                        <Segment basic>
                            <Segment raised inverted>
                                <Icon disabled={loading} name='content' size='large' onClick={() => this.setVisible(true)} />
                                <Header inverted as='h1' textAlign='center'>
                                    <Header.Content>
                                    {(!!data) && (data.name)}
                                    </Header.Content>
                                    <Header.Subheader>
                                    {selection}
                                    </Header.Subheader>
                                </Header>
                            </Segment>
                            { (selection === 'Event') && <div> 
                                {(!!data._id) && (<Button.Group color='black' size='medium' fluid>
                                    {/* {(!data.published) && (<Button onClick={() => this.setState({ confirmText: 'Publishing a cancelled event does not reassign lost tickets, it just recreates the event. Are you sure you want to publish this event'}, () => this.show())} disabled={loading || data.deleted}>Publish</Button>)} */}
                                    {(data.published) && (<Button disabled={loading || data.deleted}  onClick={() => this.editEvent()}>Edit</Button>)}
                                    {(data.published) && (<Button onClick={() => this.setState({ confirmText: 'If an event is cancelled, it loses all the tickets registered to the event. Are you sure you want to cancel this event'}, () => this.show())} disabled={loading || data.deleted}>Cancel</Button>)}
                                    {(!data.published) && (<Button onClick={() => this.setState({ confirmText: 'If an event is deleted, you would lose access to the event. Are you sure you want to delete this event'}, () => this.show())}  disabled={loading || data.deleted}>Delete</Button>)}
                                </Button.Group>)}
                                <Event 
                                data={data} 
                                organizer={user} 
                                loading={loading} 
                                hostname={hostname}
                                addAlert={(h, m, s, p) => this.messageBox.addMessage(h, m, s, p)}
                                customer={customer}/>
                            </div>}

                            { (selection === 'Share') && <div><Share 
                            userId={user._id}
                            eventId={data._id}
                            tag={data.tag} 
                            invitationLetter={data.invitationLetter} 
                            name={data.name}
                            poster={data.poster}
                            tag={data.tag} 
                            organizer={data.organizer}
                            organizerName={user.name} 
                            time={data.time}
                            location={data.location}
                            hostname={hostname}
                            email={user.email}
                            currency={data.currency}
                            fetchingCountryDetails={fetchingCountryDetails}
                            countryDetails={countryDetails}
                            fetchCountryDetails={(country) => this.getCountryData(country)}
                            bulkSms={(msg, payment, list) => this.sendBulkSms(msg, payment, list, user._id, data._id, user.name, user.email, 'invitation')}
                            bulkEmail={(subject, msg, payment, list) => this.sendBulkEmail(subject, msg, payment, list, user._id, data._id, user.name, user.email, 'invitation')}
                            followerSms={(msg, payment, userId) => this.sendFollowerSms(msg, payment, userId, data._id, user.name, user.email, 'invitation')}
                            followerEmail={(subject, msg, payment, userId) => this.sendFollowersEmail(subject, msg, payment, userId, data._id, user.name, user.email, 'invitation')}
                            addAlert={(h, m, s, p) => this.messageBox.addMessage(h, m, s, p)}
                            />
                            </div> }

                            {(selection === 'Ticketing') && <div> 
                                <Ticketing 
                                userId={user._id}
                                eventId={data._id}
                                payment={user.payment} 
                                currency={data.currency}
                                ticketChargeRate={data.ticketChargeRate}
                                ticket={data.ticket}
                                fetchingTicket={fetchingTicket}
                                submitPaymentForm={(details) => this.updateUserPayment(details)}
                                getPayed={(eventId, userId, ticketIds) => this.collectPayment(eventId, userId, ticketIds)}
                                addAlert={(h, m, s, p) => this.messageBox.addMessage(h, m, s, p)}
                                getTicket={(id) => this.getMyTicket(id)}
                                /> 
                            </div>}

                            {(selection === 'Keep In Touch') && <div>
                                <Communication 
                                userId={user._id}
                                eventId={data._id}
                                name={data.name} 
                                poster={data.poster} 
                                hostname={hostname}
                                email={user.email}
                                currency={data.currency}
                                fetchingCountryDetails={fetchingCountryDetails}
                                countryDetails={countryDetails}
                                tag={data.tag} 
                                organizer={data.organizer}
                                organizerName={user.name} 
                                time={data.time}
                                location={data.location}
                                fetchCountryDetails={(country) => this.getCountryData(country)}
                                bulkSms={(msg, payment, list) => this.sendBulkSms(msg, payment, list, user._id, data._id, user.name, user.email, 'communication')}
                                bulkEmail={(subject, msg, payment, list) => this.sendBulkEmail(subject, msg, payment, list, user._id, data._id, user.name, user.email, 'communication')}
                                registeredSms={(msg, payment, eventId) => this.sendRegisteredSms(msg, payment, user._id, data._id, user.name, user.email, 'communication')}
                                registeredEmail={(subject, msg, payment, eventId) => this.sendRegisteredEmail(subject, msg, payment, user._id, data._id, user.name, user.email, 'communication')}
                                addAlert={(h, m, s, p) => this.messageBox.addMessage(h, m, s, p)}
                                />
                            </div>}

                            {(selection === 'Promotion') && <div>
                                <Promotion
                                userId={user._id}
                                eventId={data._id}
                                name={data.name} 
                                poster={data.poster} 
                                hostname={hostname}
                                time={data.time}
                                email={user.email}
                                currency={data.currency}
                                fetchingCountryDetails={fetchingCountryDetails}
                                countryDetails={countryDetails}
                                location={data.location}
                                published={data.published}
                                fetchCountryDetails={(country) => this.getCountryData(country)}
                                addAlert={(h, m, s, p) => this.messageBox.addMessage(h, m, s, p)}
                                // addCampaign={(details, payment) => this.addPromotion(details, payment)}
                                tag={data.tag}/>
                            </div> }

                            { (selection === 'Registration & check-in') && <div>
                                <AttendanceManagement 
                                getTicket={(id) => this.getMyTicket(id)}
                                eventId={data._id}
                                ticket={data.ticket}
                                fetchingTicket={fetchingTicket}
                                getList={(userId, eventId) => this.getRegistrationList(userId, eventId)}
                                addAlert={(h, m, s, p) => this.messageBox.addMessage(h, m, s, p)}
                                />
                            </div> }

                            <Divider />
                            <Icon color='black' disabled={loading} name='content' size='big' onClick={() => this.setVisible(true)} />
                        </Segment>
                    </Sidebar.Pusher>
                </Sidebar.Pushable>
                <MessageBox ref={c=> (this.messageBox = c)} />
            </div>
        )
    }
}

const mapStateToProps = (state, props) => ({
    localEvent: getEventById(state, props),
    user: state.user,
    timeString: state.events.timeString,
    customer: state.customer,
    hostname: state.events.hostname
})

const mapDispatchToProps = {
    updatePayment: updatePaymentAction,
    cancelEvent: cancelEventAction, 
    publishEvent: publishEventAction, 
    deleteEvent: deleteEventAction
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
