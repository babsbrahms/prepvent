import React, { Component } from 'react';
import { Image, Segment, Divider, Header, Grid, Tab, Button, Label, Icon, Form, Input, Dropdown, Popup } from 'semantic-ui-react'
// import { Link } from 'react-router-dom';
import moment from 'moment';
import parser from 'html-react-parser';
import validator from 'validator';
import {Helmet} from "react-helmet";
import AddToCalendar from 'react-add-to-calendar';
import style from '../Style/Style';
import SocialShare from './SocialShare';
import likeEvent from '../Fuctions/likeEvent';
import FollowOrganizer from '../Views/FollowOrganizer'
// import MapContainer from './MapContainer';
import { organizerSubscription } from '../../actions/register';
import { sendComplain } from '../../actions/event'
import FakeEvent from './FakeEvent';


export default class Event extends Component {
    constructor(props) {
        super(props);
        this.state ={
            complaint: {
                eventId: props.data._id,
                eventName: props.data.name,
                name: props.customer.name || '',
                email: props.customer.email || '',
                reason: 'complaint',
                message: '',
            },
            showMap: false
        }
    }

    onChange = (e) => this.setState({ complaint: {...this.state.complaint, [e.target.name]: e.target.value } })

    sendComplain = () => {
        const { complaint } = this.state;
        const { addAlert } = this.props;

        if (!complaint.email || !complaint.message || !complaint.name) {
            addAlert('Error', 'Complete the contact form', false, false)
        }  else if (!validator.isEmail(complaint.email)) {
            addAlert('Error', 'Enter a valid email', false, false)
        }else {
            addAlert('Info', 'Making a request to send your message', true, false);

            sendComplain(complaint)
            .then((res) => {
                if (res.data.error) {
                    addAlert('Error', res.data.error , false, false)
                } else {
                    addAlert('Success', res.data.msg, true, false)
                }       
            }).catch(error => {
                addAlert('Error', `${error.msg || 'Problem sending your message'}`, false, false)
            })
        }
    }

    handleOrganizer = (subscriber) => {
        const { addAlert, organizer } = this.props;
        addAlert('Info', 'Making a request to follow an event organizer', true, false)
        organizerSubscription(subscriber)
        .then((res) => { 
            if (res.data.error) {
                addAlert('Error', res.data.error , false, false)
            } else {
                addAlert('Success', `You are now following ${organizer.name}`, true, false) 
            }
        })     
        .catch(err => { addAlert('Error', `${err.response.data.msg || 'Problem following event organizer'}`, false, false)})
    }

    render() {
        const {complaint, showMap } = this.state;
        const { data, organizer, loading, customer, hostname } = this.props;
        
        const panes = [
            { menuItem: 'Summary', render: () => <Tab.Pane>
                <div>
                    {parser(`${data.summary}`)}
                </div>
            </Tab.Pane> },
            { menuItem: 'Organizer', render: () => <Tab.Pane>
                <p>
                {organizer.description}
                </p>
                <FollowOrganizer customer={customer} organizer={organizer} organizerSubscriber={(subscriber) => this.handleOrganizer(subscriber)} />  | <Dropdown text={'Contact'} compact>
                    <Dropdown.Menu>
                        <Dropdown.Item as='a' href={`tel:${data.organizer.phoneNumber}`}> Call {data.organizer.name}</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as='a' href={`mailto:${data.organizer.email}`}> Email {data.organizer.name}</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>     
            </Tab.Pane> },
            { menuItem: 'Complaint', render: () => <Tab.Pane>
                <Header>
                    <Header.Subheader>
                        If there is any dissatisfaction about this event, write down your complaint and we will get back to you.
                    </Header.Subheader>
                </Header>
                <Form>
                    <Form.Field>
                        <label>Full name <Icon name="asterisk" color='red' size='mini' /></label>
                        <Input defaultValue={complaint.name} name='name' onChange={(e) => this.onChange(e)} type='text' placeholder='Enter your full-name' />
                    </Form.Field>
                    <Form.Field>
                        <label>E-mail <Icon name="asterisk" color='red' size='mini' /></label>
                        <Input defaultValue={complaint.email} name='email' onChange={(e) => this.onChange(e)} type='email' placeholder='Enter your email address' />
                    </Form.Field>
                    <Form.Field>
                        <label>Complaint <Icon name="asterisk" color='red' size='mini' /></label>
                        <textarea defaultValue={complaint.message} onChange={(e) => this.onChange(e)} name='message' placholder='write your message here' />
                    </Form.Field>
                    <Button color='black' onClick={() => this.sendComplain()}>
                        Submit your complaint
                    </Button>
                </Form>
            </Tab.Pane> },
        ];



        return (
            <div>
            {(loading) && (<FakeEvent />)}




            {(!loading) && (<Segment>
                <Helmet 
                    title= {`PrepVENT | ${data.name}`}
                    meta={[
                        {"name": "description", "content": `Explore "${data.name}" event - ${data.promoText}`},
                        {property: "og:type", content: "event"},
                        {property: "og:title", content: `${data.name}`},
                        {property: "og:image", content: `${data.poster}`},
                        {property: "og:url", content: `${hostname}/event/${data._id}/${encodeURI(data.name)}` },
                    ]}
                />

                <Helmet>
                    <script  key={'event-data-structure'}  type="application/ld+json">{
                        `
                        {
                            "@context": "https://schema.org",
                            "@type": "Event",
                            "name": "${data.name}",
                            "startDate": "${moment.utc(data.time.start)}",
                            "endDate": "${moment.utc(data.time.end)}",
                            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                            "eventStatus": "${((data.published === false) || (moment.utc().valueOf() >moment.utc(data.time.end).valueOf()))? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled'}",
                            "location": {
                              "@type": "Place",
                              "name": "${data.location.text}",
                              "address": {
                                "@type": "PostalAddress",
                                "streetAddress": "${data.location.street}",
                                "addressLocality": "${data.location.city}",
                                "addressRegion": "${data.location.state}",
                                "addressCountry": "${data.location.isoCode}"
                              }
                            },
                            "image": [
                                "${data.poster}"
                             ],
                            "description": "${data.promoText}",
                            "organizer": {
                              "@type": "Organization",
                              "name": "${organizer.name}",
                              "url": "${hostname}"

                            },
                            "sponsor": {
                                "@type": "Organization",
                              "name": "PrepVENT",
                              "url": "${hostname}"
                            },
                            "offers": {
                                "@type": "Offer",
                                "url": "${hostname}/event/${data._id}/${encodeURI(data.name)}",
                                "price": "0",
                                "priceCurrency": "${data.currency.abbr}",
                                "availability": "https://schema.org/InStock",
                                "validFrom": "${moment.utc(data.createdAt)}"
                            }
                        }
                        `
                    }
                    </script>
                </Helmet>
                

                {((data.published) || ((!data.published) && (data.organizer.userId === organizer._id))) && (<div>
                    {(!!data.poster) && (<Image src={(typeof data.poster  === 'string')? data.poster  : URL.createObjectURL(data.poster)} fluid />)}
                    <Divider />
                    {(!data.published) && (data.organizer.userId === organizer._id) && (<Segment> 
                        <Header color='red' as='h3' textAlign='center'>
                            <Header.Content>                    
                                This event has been cancelled.
                            </Header.Content>
                        </Header>
                    </Segment>)}
                    <div style={style.center}>
                        <Header textAlign='center'> 
                            <Header.Content as='h2'>
                                {data.name}
                            </Header.Content>
                            <Header.Subheader>
                                Hosted by {organizer.name} | <FollowOrganizer customer={customer} organizer={organizer} organizerSubscriber={(subscriber) => this.handleOrganizer(subscriber)}/>                                  
                            </Header.Subheader>
                        </Header>
                    </div>
                    <br />
                    <Grid>
                        <Grid.Row>
                            <Grid.Column width='7' textAlign='right'>
                                <div>
                                    <p>{data.time.startStr} to {data.time.endStr}</p>
                                    <div style={style.alignedRight}>
                                        <AddToCalendar event={{
                                            title: data.name,
                                            description: data.promoText,
                                            location: data.location.text,
                                            startTime: moment.utc(data.time.start),
                                            endTime: moment.utc(data.time.end)
                                        }}
                                        />
                                    </div>
                                </div>    
                            </Grid.Column>
                            <Grid.Column width='1'>
                                <div>|</div>
                            </Grid.Column>
                            <Grid.Column width='7'>
                                <div>
                                    <p>{data.location.text}</p>
                                    <a style={{ cursor: "pointer" }} onClick={() => this.setState({ showMap: !this.state.showMap })}>{`${showMap? 'Close Map': 'View In Map'}`}</a>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                    {showMap &&(<a target='_blank' href={`https://www.google.com/maps/place/${data.location.text.split(' ').join('+')}`}>
                        <img alt="loading google map..." style={{ width: '100%', height: 'auto'}} src={`https://maps.googleapis.com/maps/api/staticmap?center=${data.location.position.lat},${data.location.position.lng}&zoom=12&size=600x300&maptype=roadmap&markers=color:red%7Clabel:O%7C${data.location.position.lat},${data.location.position.lng}&key=AIzaSyDMlB026uWQQRf5NM6lRGzrO2C7CwQG_IY`} />
                    </a>)}
                    <br />

                    <div style={{ display: "flex", flexDirection: 'row', alignItems: 'flex-end'}}>
                        <Popup style={{ backgroundColor: '#e61a8d', color: 'white'}} trigger={<Button color='pink' circular icon='heart' onClick={() => likeEvent({ _id: data._id, name: data.name, location: data.location, time: data.time })} />} on='click'>
                            <Popup.Content>Liked!</Popup.Content>
                        </Popup>
                        <SocialShare title={data.name} image={data.poster} tag={data.tag} description={data.promoText || ''}  url={`${hostname}/e/${data._id}`} size={'big'}/>
                    </div>

                    <br/>


                    <div>
                        {(data.free) && (<Label as='a' color='pink'>
                            <Icon name='money' />
                            Free
                        </Label>)}
                        <Label as='a' color='pink'>
                            <Icon name='map marker'/>
                            {data.location.state}
                        </Label>

                        <Label as='a' color='pink'>
                            <Icon name='group'/>
                            {data.category}
                        </Label>

                        {(!!data.tag) && (<Label as='a' color='pink'>
                            <Icon name='hashtag'/>   
                            {data.tag}
                        </Label>)}
                    </div>
                </div>)}
                {(!data.published) && (data.organizer.userId !== organizer._id) && (<Segment> 
                    <Header color='red' as='h3' textAlign='center'>
                        <Header.Content>                    
                            This event has been cancelled or deleted. You can still contact the event organizer(s) or write a complaint about the event (if needed).
                        </Header.Content>
                    </Header>
                </Segment>)}

                <Divider />
                <Tab panes={panes} defaultActiveIndex={0} />
                <br/>
                <br/>
                <br/>            
                <br/>
                <br/>
                <br/>
                <br/>
            </Segment>)}
            
        </div>
        )
    }
}
