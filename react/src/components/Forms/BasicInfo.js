import React, { Component } from 'react';
import { Form, Button, Segment, Icon, Dropdown, Label, Input, Select, List, Header, Dimmer, Loader } from 'semantic-ui-react';
import Datetime from 'react-datetime';
import moment from 'moment';
import MapContainer from '../Views/MapContainer';
import WordCount from '../Views/WordCount';
import '../Style/datatime.css';
import invite from '../../utils/templates/categoryTemplate';
// import utcTz from '../../utils/templates/timezone';
import Axios from 'axios';
import style from '../Style/Style';
import { getCountryDetails } from '../../actions/country';

export default class BasicInfo extends Component {
    static defaultProps = {
        apiKey: process.env.REACT_APP_GOOGLE_KEY,
    }
    constructor(props) {
        super(props);
        this.state = {
            name: props.name,
            time: props.time,
            location: props.location,
            category: props.category,
            eventType: props.eventType,
            currency: props.currency,
            categoryList: [],
            eventList: [],
            showMap: false,
            gotLocationDetails: false,
            fetchinLocation: false,
            hasInitialLocation: !!props.location.state,
            // editLocation: false,
            changingZone: false,
            locationPredictions: [],
            hasCountryDetails: false,
            gettingCountryDetails: false,
            countryDetails: {
                country: '',
                states: [],
                currency: [],
                localOffset: []
            }
        }
    }

    componentDidMount() {
        const { location } = this.props;
        this.getCategory()
        
        if (location.country) {
            this.selectEventCountry(location.country)
        }
        
    }
    
    getCategory = () => {
        const { category } = this.state;
        const cat = Object.keys(invite).map(value=> ({ key: value, text: value, value: value }) )
        this.setState({ categoryList:  cat}, () => this.getEvent(category))
    }

    getEvent = (category) => {
        if (category) {
            if(invite[category]) {
                const cat = invite[category].events.map(value=> ({ key: value, text: value, value: value }) )
                this.setState({ eventList:  cat });
            } else {
                this.setState({ eventList:  [] });
            }
        }
    }

    next=()=> {
        const { next, timeString, addAlert } = this.props;
        const { name, time, location, category, eventType, countryDetails, currency } = this.state;

        let error = this.validation(name, time, location, category);
        
        if (error) {
            addAlert('Warning', error, false, false);

        } else {
            if (location.street && location.state && location.city && location.country && location.position.lat) {
                if ((location.country === countryDetails.country) && countryDetails.states.includes(location.state)) {
                    let newTime = {
                        ...time,
                        startStr: moment.utc(time.start).utcOffset(time.localOffset).format(timeString),
                        endStr: moment.utc(time.end).utcOffset(time.localOffset).format(timeString)
                    }; 
                    console.log(location);
                    

                    next(name, newTime, location , category, eventType, currency)

                } else {
                    this.setState({ showMap: true, gotLocationDetails: true })
                    if (location.country !== countryDetails.country) {
                        addAlert('Warning', `The country you selected is not ${countryDetails.country}`, false, false);
                    } else {
                        addAlert('Warning', `${location.state} is not a state in ${countryDetails.country}`, false, false);
                    }
                }
            } else {
                this.setState({ showMap: true, gotLocationDetails: true })
                addAlert('Warning', 'Problem getting your event location details. Manually input the values and use the map to select the location.', false, false);
            }
        }

    }

    validation = (name, time, location, category) => {
        let error = '';
        console.log(time);
        
        if ((moment.utc(time.start).valueOf() > moment.utc(time.end).valueOf() )) {
            error = 'Check the event time. It ends before it starts'
        } else if ((moment.utc().valueOf() > moment.utc(time.start).valueOf())) {
            error = 'Check the event time. Start time is set to the past, Start time should be set to the future'
        } else if (!name || !time.start || !time.end || !location.text || !category) {
            error = 'Complete the form'   
        }   

        return error
    }
    
    onChangeStart=(e)=> {
        // console.log('start: ', e._d);
        // console.log('offset: ', this.state.time.localOffset); 
        // console.log('local: ', moment.utc(e._d).utcOffset(this.state.time.localOffset).format(this.props.timeString));
        // console.log('utc: ', moment.utc(e._d).format(this.props.timeString));
        this.setState({ time: { ...this.state.time, start: moment.utc(e._d).valueOf() }})
    }
    

    onChangeEnd=(e)=> this.setState({ time: { ...this.state.time, end: moment.utc(e._d).valueOf() }})
    

    onChangeName=(e) => this.setState({ name: e.target.value })
    

    onChangeLocation=(e) => this.setState({ location: { ...this.state.location, [e.target.name]: e.target.value } })
    
    onChangeLocationInput = data => this.setState({ location: { ...this.state.location, [data.name]: data.value } })

    onChangeCategory=(e, data) => this.setState({ category: data.value, eventList: [], eventType: '' }, () => this.getEvent(data.value))
    
    onChangeEvent=(e, data) => this.setState({ eventType: data.value })

    updateZone = data => {        
        this.setState({ time: { ...this.state.time, localOffset: data.value }, changingZone: true }, () => {
            setTimeout(() => {
                this.setState({ changingZone: false })
            }, 200)
        })
    }

    getLocationInfo = async () => {
        const { apiKey, addAlert } = this.props;
        const { location } = this.state;
       
        if (!location.text) {
            addAlert('Error', 'Add location text to locate', false, false)
        } else {
            await this.setState({ gotLocationDetails: false, fetchinLocation: true, showMap: false }) 
            //geocoding
            Axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(location.text)}&key=${apiKey}`)
            .then(res => {
                
                let street = '';
                let city = '';
                let state = '';
                let country = '';
                let position = res.data.results[0].geometry.location;

                res.data.results[0].address_components.forEach((map, index) => {
                    if (map.types.includes("route")) {
                        street = res.data.results[0].address_components[index].long_name;
                    }
                    if (map.types.includes("locality")) {
                        city = res.data.results[0].address_components[index].long_name;
                    }
                    if (map.types.includes("administrative_area_level_1")) {
                        state = res.data.results[0].address_components[index].long_name;
                    }
                    if (map.types.includes("country")) {
                        country = res.data.results[0].address_components[index].long_name;
                    }
                });
                
                
                this.setState({ gotLocationDetails: true, fetchinLocation: false, showMap: false, location: { ...this.state.location, street, city, state, country, position } }) 
            })
            .catch(error => {
                console.log(error);  
                this.setState({ gotLocationDetails: true, fetchinLocation: false, showMap: true })
                addAlert('Error', error.error_message, false, false)    
            })
        }
    }

    getLocationAutoComplete = text =>{
        const { apiKey, addAlert } = this.props;
        Axios.get(`https://maps.googleapis.com/maps/api/place/queryautocomplete/json?key=${apiKey}&input=${encodeURI(text)}`)
        .then(res => {
           // console.log(res);
            
            let options = res.data.predictions.map(predict => (predict.description));
            
            this.setState({ locationPredictions: options })
        })
        .catch(error => {
           // console.log(error);   
            addAlert('Error', error.error_message, false, false)     
        })
    }

    selectEventCountry = (country) => {
        const { mode, addTicketChargeRate, addAlert } = this.props;
            this.setState({ gettingCountryDetails: true }, () => {
                getCountryDetails(country)
                .then(res => {
                    if (res.data.error) {
                        addAlert('Error', res.data.error , false, false)
                    } else {
                        this.setState({
                            countryDetails: {
                                country: res.data.details.name,
                                states: res.data.details.states,
                                currency: res.data.details.currency,
                                localOffset: res.data.details.localOffset,
                                isoCode: res.data.details.isoCode
                            },
                            time: {
                                ...this.state.time,
                                localOffset: res.data.details.localOffset
                            },
                            location: {
                                ...this.state.location,
                                country: res.data.details.name,
                                isoCode: res.data.details.isoCode
                            },
                            currency: res.data.details.currency,
                            hasCountryDetails: true,
                            gettingCountryDetails: false,
                        }, () => {
                            if (mode === 'create') {
                                addTicketChargeRate(res.data.details.ticketChargeRate)
                            }
                        })
                    }

                })
                .catch((error) => {
                    addAlert('Error', `${error.msg || 'Problem fetch country details. Please try again.'}`, false, false) 
                })
            })
        // }
    }


    render() {
        const { time, name, location, category, eventType, categoryList, eventList, showMap, gotLocationDetails,fetchinLocation, hasInitialLocation,
             changingZone, locationPredictions, countryDetails, hasCountryDetails, gettingCountryDetails } = this.state;
        const { mode, countries } = this.props;
        
        // console.log('local: ', moment.utc(time.start).utcOffset(time.localOffset).format(this.props.timeString));
        // console.log('utc: ', moment.utc(time.start).format(this.props.timeString));

        return (
        <div>
            <Segment inverted>
                <Header inverted>
                    <Header.Content>Country <Icon name="asterisk" color='red' size='mini' /></Header.Content>
                    <Header.Subheader>Select the country to hosting your event in, from the list of countries we operate at.</Header.Subheader>
                </Header>

                <Dropdown
                disabled={mode === 'edit'}
                fluid
                selection
                options={countries.map(country => ({ text: country, value: country, key: country }))}
                defaultValue={location.country}
                onChange={(e, { value, text }) => this.selectEventCountry(value)}
                />

                <Header inverted>
                    <Header.Subheader>NOTE: Country can only be set when creating the event and they are not editable after the event is created.</Header.Subheader>
                </Header>
                {(gettingCountryDetails) && (<Dimmer active>
                    <Loader inverted>Getting Country details...</Loader>
                </Dimmer>)}
            </Segment>
            {(hasCountryDetails) && (!gettingCountryDetails) && (<Form>
                <Form.Field>
                <label>Title <Icon name="asterisk" color='red' size='mini' /></label>
                <input maxLength='75' defaultValue={name} name='name' onChange={(e) => this.onChangeName(e)} placeholder='Enter the title or name of your event' />
                <WordCount count={name} maxLength={75} />
                </Form.Field>

                <Form.Field>
                    <label>Location <Icon name="asterisk" color='red' size='mini' /></label>
                    <Input maxLength={120} defaultValue={location.text} name={'text'} onChange={(e, data) => this.onChangeLocationInput(data)} placeholder='The location of your event'  labelPosition='right' type='text'>
                        <Label basic><Icon loading={fetchinLocation} name='location arrow' /></Label>
                        <input />
                        <Label onClick={() => this.getLocationInfo()}> <Icon disabled={fetchinLocation} name='search' /></Label>
                    </Input>
                    {/* <input maxLength={120} defaultValue={location.text} name={'text'} onChange={(e) => this.onChangeLocation(e)} placeholder='The location of your event' /> */}
                    <WordCount count={location.text} maxLength={120} />
                    <div style={style.center}>
                        <List link relaxed celled>
                            {locationPredictions.map((option, i )=>  <List.Item onClick={() => this.getLocationInfo()} key={i} as='a'>{option}</List.Item>)} 
                        </List>
                    </div>
                </Form.Field>

                    {(hasInitialLocation || gotLocationDetails) &&(<Segment>
                        <Form.Group widths='equal'>
                            <Form.Field>
                                <label>Street <Icon name="asterisk" color='red' size='mini' /></label>
                                <input defaultValue={location.street} name={'street'} onChange={(e) => this.onChangeLocation(e)} placeholder='The location of your event' />
                            </Form.Field>

                            <Form.Field>
                                <label>City <Icon name="asterisk" color='red' size='mini' /></label>
                                <input defaultValue={location.city} name={'city'} onChange={(e) => this.onChangeLocation(e)} placeholder='The location of your event' />
                            </Form.Field>

                            <Form.Field>
                                <label>State <Icon name="asterisk" color='red' size='mini' /></label>
                                {/* <input disabled={!editLocation} defaultValue={location.state} name={'state'} onChange={(e) => this.onChangeLocation(e)} placeholder='The location of your event' /> */}
                                <Select defaultValue={location.state} name={'state'} onChange={(e, dt) => this.onChangeLocationInput(dt)} placeholder='The location of your event' options={countryDetails.states.map(state => ({ key: state, text: state, value: state }))} />
                            </Form.Field>

                            <Form.Field>
                                <label>Country <Icon name="asterisk" color='red' size='mini' /></label>
                                {/* <input disabled={!editLocation} defaultValue={location.country} name={'country'} onChange={(e) => this.onChangeLocation(e)} placeholder='The location of your event' /> */}
                                <Select disabled={mode} defaultValue={location.country} name={'country'} onChange={(e, dt) => this.onChangeLocationInput(dt)} placeholder='The location of your event' options={countries.map(country => ({ text: country, value: country, key: country }))} />

                            </Form.Field>
                        </Form.Group>
                    <h5>latitude <Icon name="asterisk" color='red' size='mini' />: {location.position.lat}</h5>

                    <h5>longitude <Icon name="asterisk" color='red' size='mini' />: {location.position.lng}</h5>
                    {(!showMap) && (<a onClick={() => this.setState({ showMap: true })}>change latitude and longitude</a>)}

                    </Segment>)}
                    {(showMap) && (<MapContainer eventLocation={location.position} pickPosition newPosition={(latLng) => this.setState({ location: { ...this.state.location, position: latLng } })}/>)}
                
                
                {(!changingZone) && (<Form.Group widths='equal'>
                    <Form.Field>
                        <label>Start Time <Icon name="asterisk" color='red' size='mini' /></label>
                        <Datetime dateFormat={'ddd Do MMMM YYYY'} timeFormat={'hh:mm a'} onChange={this.onChangeStart} defaultValue={`${moment.utc(time.start).utcOffset(time.localOffset).format(this.props.timeString)}`} inputProps={{placeholder:"Start Time", name:"start Time" }} />
                    </Form.Field>

                    <Form.Field>
                        <label>End Time <Icon name="asterisk" color='red' size='mini' /></label>
                        <Datetime dateFormat={'ddd Do MMMM YYYY'} timeFormat={'hh:mm a'} onChange={this.onChangeEnd} defaultValue={`${moment.utc(time.end).utcOffset(time.localOffset).format(this.props.timeString)}`} inputProps={{placeholder:"End Time", name:"end Time" }} />
                    </Form.Field>
                </Form.Group>)}
                {(changingZone) && (<Form.Group widths='equal'>
                    <Form.Field>
                        <label>Start Time <Icon name="asterisk" color='red' size='mini' /></label>
                        <Icon name='spinner'rotated='clockwise' loading />
                    </Form.Field>

                    <Form.Field>
                        <label>End Time <Icon name="asterisk" color='red' size='mini' /></label>
                        <Icon name='spinner'rotated='clockwise' loading />
                    </Form.Field>
                </Form.Group>)}
                {/* <div style={{ backgroundColor: '#E0E1E2', padding: "1px", borderRadius: '5px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Dropdown text={`We are using your current timezone offset. If your event is in another timezone, change the offset value: UTC${time.localOffset}`} defaultValue={time.localOffset} scrolling direction="right">
                        <Dropdown.Menu>
                            {utcTz.map(zone => (
                                <Dropdown.Item onClick={(e, data) => this.updateZone(data)} key={zone.name} value={zone.offset}>UTC{zone.offset} {zone.name}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>

                    <div  style={{ marginLeft: '4px', marginRight: '2px', borderRadius: '2px'}}>
                        <Popup trigger={<Icon name="info circle" inverted size="large"/>} position="bottom right" on='click'>
                            <Popup.Content>
                                If your event location is in Nigeria and you are currently in Nigeria when creating this event. You don't need to do anything, you are good to go.
                            </Popup.Content>
                            <Popup.Content>
                                But, if your event location is in Nigeria and you are currently in New York, America when creating this event. You need to change the offset value to UTC+01:00 (West Central Africa).
                            </Popup.Content>
                            <Popup.Content>
                                <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/List_of_UTC_time_offsets">UTC timezone offset list</a>
                            </Popup.Content>
                        </Popup>
                    </div>
                </div> */}

                <br />      
                <Form.Select
                    fluid
                    required
                    label='Category'
                    options={categoryList}
                    placeholder='Category'
                    onChange={(e, data) => this.onChangeCategory(e, data)}
                    name={'category'}
                    defaultValue={category}
                />
{/* 
                <Form.Select
                    fluid
                    label='Event Type'
                    options={eventList}
                    placeholder='Category'
                    onChange={(e, data) => this.onChangeEvent(e, data)}
                    name={'event'}
                    defaultValue={eventType}
                /> */}

                <Form.Field>
                    <label>Event Type</label>
                    <Input
                        action={
                        <Dropdown button basic floating options={eventList} defaultValue={eventType} direction='left' onChange={(e, data) => this.onChangeEvent(e, data)} />
                        }
                        placeholder='Add event type'
                        value={eventType}
                        onChange={(e, data) => this.onChangeEvent(e, data)}
                        name='eventType'
                    />
                </Form.Field>
                
                <Button floated='right' color='pink' onClick={()=> this.next()} type='submit'>
                    Save
                    <Icon name='arrow right' />
                </Button>
            </Form>)}
        </div>
        )
    }
}
