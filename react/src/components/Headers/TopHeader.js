import React, { Component } from 'react';
import { Icon, Dropdown, Header, Divider, Button, Label, Item, Form, Input, Checkbox, Modal, Message } from 'semantic-ui-react'
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import style from '../Style/Style';
import validator from 'validator';
import MessageBox from '../Views/MessageBox';
import { store } from '../../index';
import { LIKE_EVENT } from '../../types'
import { sendLikeEvent } from '../../actions/register';
import { getCountriesAction, getCountryDetailsAction } from '../../actions/country'
// import { USER_LOGGED_OUT } from '../../types';
import { userLogOut } from '../../actions/user';
import SearchEvent from '../Views/SearchEvent'


// this.props.match.params.paramsname

class TopHeader extends Component {
    constructor(props) {
        super(props)
        this.state = { 
            subscribe: true, 
            modalOPen: false , 
            openSearch: false,
            data: {
                email: props.customer.email || '',
                event: JSON.parse(sessionStorage.getItem('likes')) || []
            },
            dataError: '',
            selectedCountry: props.selectedCountry,
        };
    
        this.messageBox = React.createRef()
    }

    componentDidMount() {
        const { countriesUpdatedAt } = this.props;

        if (countriesUpdatedAt === null) {
            this.getCountriesList()
        } else if (Date.now() > countriesUpdatedAt + 86400000) {
            // greater than 24 hr
            this.getCountriesList()
        }
    }

    getCountriesList = () => {
        const { getCountries } = this.props;
        getCountries()
        .then((res) => {

        })
        .catch((error) => {
            this.messageBox.addMessage('Error', `${error.msg || 'Error fetching countries'}`, false, true)
        })
    }

    getCountryDetails = country => {
        const { getCountryDetails } = this.props;
        console.log('country_nmae: ', country);
        
        getCountryDetails(country)
        .then((res) => {
            if (res.data.error) {
                this.messageBox.addMessage('Error', res.data.error , false, false)
            } else {
                this.messageBox.addMessage('Success', `${`${country} details fetched`}`, false, true)           
            }
        })
        .catch((error) => {
            this.messageBox.addMessage('Error', `${error.msg || 'Error getting country details'}`, false, true)
        })
    
    }

    handleResultSelect = (e, { result }) => this.setState({ value: result.title })

    removeLikes = (index) => {
       let likes = JSON.parse(sessionStorage.getItem('likes')) || [];

       likes.splice(index, 1)

        sessionStorage.setItem('likes', JSON.stringify(likes))

        this.setState({ modalOPen: true, data: { ...this.state.data, event: JSON.parse(sessionStorage.getItem('likes')) || [] } }, () => {
            store.dispatch({
                type: LIKE_EVENT,
                payload: likes.length
            })
        })
    }

    sendLikesEvent = () => {
        const { data, subscribe } = this.state;

        this.setState({ dataError : '' }, () => {
            let error = this.validateLikes()
            
            if (error)  {
                this.setState({ dataError: error })
            } else {
                this.setState({ modalOPen: false }, () => {
                    let location = [];

                    data.event.forEach(e => {
                        let index = location.findIndex(t => e.location.state === t.state)
                        
                        if (index < 0) {
                            location.push({
                                state: e.location.state,
                                country: e.location.country
                            })
                        }
                    })
                    this.messageBox.addMessage('Success', 'Sending liked events!', true, false)
                    sendLikeEvent({ email: data.email, events: data.event, subscribe: { subscribe, location } })
                    .then((res) => { 

                        if (res.data.error) {
                            this.messageBox.addMessage('Error', res.data.error , false, false)
                        } else {
                            this.messageBox.addMessage('Success', `${res.data.msg || 'Liked events successfully sent'}`, true, false);
                        }

                        // update likes
                        sessionStorage.removeItem('likes');
                        store.dispatch({
                            type: LIKE_EVENT,
                            payload: 0
                        })
                    
                    }) 
                    .catch(err => { 
                        this.messageBox.addMessage('Error', `${err.response.data.msg || 'Problem sending liked events'}`, false, false)
                    })
                })
            }
        })
    }

    validateLikes = () => {
        const { data } = this.state;
        let error = ''
        
        if (!data.email && (data.event.length === 0)) {
            error = 'Add events you want to send and add your email address.'
        } else if (!validator.isEmail(data.email)) {
            error = 'Enter a valid email address'
        } else if (data.event.length === 0) {
            error = 'Add events you want to send to your mail.'
        }
         
        return error;
    }
  
    closeSearch = () => this.setState({ openSearch: false })
    openSearch = () => this.setState({ openSearch: true })

    signUserOut = () => {
        userLogOut()
    }

    render () {
        const { subscribe, modalOPen, data, dataError, selectedCountry } = this.state;
        const { customer, countries } = this.props;

        
        return (
            <div style={{ backgroundColor: '#e61a8d', padding: '10px', position: 'relative', zIndex: 100 }}>
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <div style={{ display: 'row'}}> 
                        
                        <MessageBox ref={c=> (this.messageBox = c)} />
                        <Modal open={modalOPen} 
                        onOpen={() => this.setState({ modalOPen: true, data: { ...data, event: JSON.parse(sessionStorage.getItem('likes')) || [] } })} 
                        onClose={() => this.setState({ modalOPen: false, data: { ...data, event: JSON.parse(sessionStorage.getItem('likes')) || [] }, dataError: '' })} 
                        trigger={
                            <Button size='tiny' as='div' labelPosition='right'>
                                <Button size='tiny' color='black'>
                                    <Icon name='heart' />
                                    
                                </Button>
                                <Label as='a' basic color='red' pointing='left'>
                                    {customer.likes || 0}
                                </Label>
                            </Button>} closeIcon>
                            <Modal.Header>Likes</Modal.Header>

                            <Modal.Content image scrolling>
                            <Modal.Description>
                                    {(!!dataError) && (<Message error>
                                        <Message.Header>Error</Message.Header>
                                        <Message.Content>{dataError}</Message.Content>
                                    </Message>)}
                                    <Item.Group divided>

                                    {(data.event !== null) && data.event.map((event, i) => (<Item key={event._id}>
                                            <Item.Image size='small' src={event.poster} />

                                            <Item.Content>
                                                <div style={style.spacebetween}>
                                                    <Item.Header as='h3'>
                                                        <Link onClick={() => this.setState({ modalOPen: false })} to={`/e/${event._id}`} >
                                                            {event.name}
                                                        </Link>
                                                    </Item.Header>
                                                    <Icon onClick={() => this.removeLikes(i)} name='delete'/>
                                                </div>
                                                <Item.Meta>
                                                <span className='cinema'>{event.time.startStr}</span>
                                                </Item.Meta>
                                                <Item.Description>{event.location.text}</Item.Description>
                                                <Item.Extra>
                                                    <Item.Header as='h3'>
                                                        {event.free && 'Free'}
                                                    </Item.Header>
                                                    <Button onClick={() => this.setState({ modalOPen: false })} as={Link} to={`/e/${event._id}`}  primary floated='right'>
                                                        Buy tickets
                                                        <Icon name='right chevron' />
                                                    </Button>
                                                </Item.Extra>
                                            </Item.Content>
                                        </Item>))}
                                    </Item.Group>

                            </Modal.Description>
                            </Modal.Content>
                            <Divider />
                            <Modal.Content>
                                <div style={{}}> 
                                    <Form>
                                        <Form.Field>
                                            <label>E-mail <Icon name="asterisk" color='red' size='mini' /></label>
                                            <Input error={dataError.includes('email')} type='email' placeholder='Enter your email address to recieve liked events by mail' defaultValue={data.email} onClick={(e) => this.setState({ data: { ...this.state.data, email: e.target.value }})}/>
                                        </Form.Field>
                                        <Form.Field>
                                            <Checkbox onChange={() => this.setState({ subscribe: !subscribe})} checked={subscribe} label='I want PrepVENT to notify me about new events nearby.' />
                                        </Form.Field>
                                        <Button floated='right' color='pink' type='submit' onClick={() => this.sendLikesEvent()}>
                                            Send
                                        </Button>
                                        <br />
                                        <br />

                                    </Form>
                                </div>
                            </Modal.Content>
                        </Modal>


                        <b style={{ paddingRight: '2px', paddingLeft: '2px'}}>|</b>
                        {/* <Dropdown text='Organizers' direction='left' options={options} simple item /> */}
                        <Dropdown text='Organizers' direction='left'>
                            <Dropdown.Menu>
                                
                                    <Dropdown.Item  icon='user' as={Link} to={'/profile'} text='Profile' />
                                
                                <Dropdown.Divider />
                                
                                    <Dropdown.Item  icon='setting' as={Link} to={'/settings'} text='Settings' />
                                
                                <Dropdown.Divider />
                                    <Dropdown.Item icon='plus' as={Link} to={'/create'} text='Create Event' />
                              
                                <Dropdown.Divider />
                                
                                    {/* <Dropdown.Item icon='sign in' as={Link} to={'/auth'} text='SignIn' />
                               
                                <Dropdown.Divider /> */}
                                
                                    <Dropdown.Item icon='sign out' onClick={() => this.signUserOut()} text='SignOut' />
                                

                                
                            </Dropdown.Menu>
                        </Dropdown>
                        <b style={{ paddingRight: '2px', paddingLeft: '2px'}}>|</b>
                        {/* <Dropdown
                            placeholder='Countires'
                            defaultValue={selectedCountry}
                            direction={'left'}
                            // search
                            // selection
                            options={countries.map((country) => ({ name: country, value: country, text: country }))}
                            compact
                            onChange={(e, data) => this.getCountryDetails(data.value)}
                        /> */}
                        
                           
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <Link to='/'>
                        <Header as='h1'>
                            PrepVENT
                        </Header>
                    </Link>

             
                
                    <Modal
                        trigger={ <Icon name='search' inverted circular onClick={this.openSearch} />}
                        open={this.state.openSearch}
                        onClose={this.closeSearch}
                        basic
                        size='mini'
                        centered={false}
                    >
                        <Header icon='search' content='Search for events' />
                        <Modal.Content>
                            <SearchEvent closeSearch={() => this.closeSearch()} />
                        </Modal.Content>

                    </Modal>
                        
                </div>
            </div>
        )
    }

}


const mapStateToProps = (state) => ({
    customer: state.customer,
    countries: state.country.countries,
    selectedCountry: state.country.name,
    countriesUpdatedAt: state.country.countriesUpdatedAt
})

const mapDispatchToProps = {
    getCountries: getCountriesAction, 
    getCountryDetails: getCountryDetailsAction
}

export default connect(mapStateToProps, mapDispatchToProps)(TopHeader)