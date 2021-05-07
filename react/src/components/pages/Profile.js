import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Item, Segment, Icon,  Header, Image, Dropdown,  Dimmer, Loader,  Grid, Menu} from 'semantic-ui-react';
import { Link } from 'react-router-dom';
// import moment from 'moment'
import style from '../Style/Style';
import { fetchMyActiveEventsAction, fetchMyInactiveEvent } from '../../actions/event';
import { userLogginAction  } from '../../actions/user';
import MessageBox from '../Views/MessageBox';
import HtmlHeader from '../Views/HtmlHeader';



export class Profile extends Component {

    constructor(props) {
        super(props);
        this.state = {
            events: this.props.events,
            loading: true,
            fetched: false,
            activeTab: 'active',
            updatingUser: false
        }
        this.messageBox = React.createRef();
    }
    

    componentDidMount() {
        this.decideUpdate()
       //this.update()
    }
    
    decideUpdate = () => {
        // more than 6 hours
        this.fetchActive()
        
    }

    fetchActive = () => {
        const { fetchMyActiveEvents } = this.props;
        const { user, events } = this.props;

        this.messageBox.addMessage('Info', 'Making request to fetch active event', true, false);

        this.setState({ loading: true, fetched: false }, () => {
            fetchMyActiveEvents(user._id)
            .then(result => {
              //  console.log('profile:', result.payload );
                
                this.setState({ loading: false, events: result.payload, activeTab: 'active', fetched: true })
            })
            .catch(error => this.setState({ loading: false, events, activeTab: 'active' }, () => {
                this.messageBox.addMessage('Error', `${error.msg || 'Error fetching active events'}`, false, true)
            }))
        })

    }

    fetchInactive = () => {
        const { user } = this.props;

        this.messageBox.addMessage('Info', 'Making request to fetch inactive event', true, false);

        this.setState({ loading: true, fetched: false }, () => {
            fetchMyInactiveEvent(user._id)
            .then(result => {            
                this.setState({ loading: false, events: result.data.events, activeTab: 'inactive', fetched: true })
            })
            .catch(error => this.setState({ loading: false, events: [], activeTab: 'inactive' }, () => {
                this.messageBox.addMessage('Error', `${error.msg || 'Error fetching inactive events'}`, false, true)
            }))
        })
    }

    // to update followers count
    updateUserInfo = () => {
        const { userLoggin, user } = this.props;     

        this.messageBox.addMessage('Info', `Sending request to update user's infomation`, true, false)
        this.setState({ updatingUser: true }, () => {
            userLoggin(user.firebaseId)
            .then(res => {
                this.messageBox.addMessage('Success', `User's infomation updated`, true, false)
                this.setState({ updatingUser: false })
            }).catch(err => {
                this.messageBox.addMessage('Error', `Problem updating user's infomation`, true, false)
                this.setState({ updatingUser: false })
            })
        })
    }

    handleTabClick = tab => this.setState({ activeTab: tab }, () => {
        if (tab === 'active') {
            this.fetchActive()
        } else {
            this.fetchInactive()
        }
    })

    render() {
        const { events, loading, updatingUser, activeTab, fetched } = this.state;
        const { user } = this.props;
        
        return (
            <div className="ui container">
                <HtmlHeader page="Profile" />
                
                <div style={style.alignedRight}>
                    <Link to={'/settings'}>
                        <Icon color='black' name='setting' />
                    </Link>
                </div>
                <Grid stackable celled>
                    <Grid.Column width='6' verticalAlign="middle">
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                            <Image src={user.photoUrl}  size='small' circular /> 
                            
                            {user.followerCount} followers 
                            <br />
                            {/* <br /> */}
                            <Icon disabled={updatingUser} loading={updatingUser} size='large' onClick={() => this.updateUserInfo()} name={'refresh'}/>
                        </div>
                    </Grid.Column>
                    <Grid.Column width='10' verticalAlign="middle">
                        <div style={style.center}>  
                            <Header as='h2' icon>
                                {/* <Icon name='settings' /> */}
                                {user.name}
                                <Header.Subheader>
                                
                                </Header.Subheader>
                                <Header.Subheader>
                                    {user.description}
                                </Header.Subheader>
                            </Header>

                        </div>
                    </Grid.Column>
                </Grid>


            
                    <Menu attached='top' tabular>
                        <Menu.Item
                            name='Active Events'
                            active={activeTab === 'active'}
                            onClick={() => this.handleTabClick('active')}
                        />
                        <Menu.Item
                            name='Inactive Events'
                            active={activeTab === 'inactive'}
                            onClick={() => this.handleTabClick('inactive')}
                        />
                    </Menu>

                    <Segment attached='bottom'>
                    {loading && (<Dimmer active inverted>
                        <Loader inverted>Loading</Loader>
                    </Dimmer>)}
                    {!loading && (events.length === 0) && (<div>
                    <Header as='h3' icon textAlign='center'>
                        <Icon name='find' color='red'/>
                        <Header>
                            <Header.Content>
                                Not found
                            </Header.Content>
                            {(fetched) && <Header.Subheader>
                                You do not have any {activeTab} event. Create an event with the plus icon on the screen.
                            </Header.Subheader>}

                            {(!fetched) && <Header.Subheader>
                                Error fetching {activeTab} event. Try again.
                            </Header.Subheader>}
                        </Header>
                    </Header>
                    </div>)}
                    {!loading && (<Item.Group divided>
                        {events.map(event =>(<Item key={event._id}>
                            <Item.Image src={event.poster} />

                            <Item.Content>
                                <div style={{ width: '100%'}}>
                                    <div style={style.spacebetween}>
                                        <Link style={{ fontSize: '18px'}} as='h3' to={`/dashboard/${event._id}`}>
                                            {event.name}
                                        </Link>

                                        <Dropdown direction='left' icon={<Icon name='ellipsis vertical'/>} compact>
                                            <Dropdown.Menu>
                                                <Dropdown.Item as={Link} to={`/create?id=${event._id}`}>Reuse</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                                <Item.Meta>
                                <span className='cinema'>{event.time.startStr}</span>
                                </Item.Meta>
                                <Item.Description>{event.location.text}</Item.Description>
                                {(!event.published) && <h3 style={{ color: 'red'}}>Cancelled!</h3>}
                            </Item.Content>
                        </Item>))} 
                      
                    </Item.Group>)}

                </Segment>

                {/* <div style={style.center}>
                    <Pagination defaultActivePage={1}  totalPages={5} />
                </div> */}
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <MessageBox ref={c=> (this.messageBox = c)} />
                {/* style="margin: auto 1.5em; display: inline-block;" */}
                {/* style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', position: 'fixed', bottom: '15%', left: '46%'}} */}
                <div  style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', position: 'fixed', bottom: '15%', left: '50%', transform: `translate(-50%, 0)`}}>
                    <Link to='/create'>
                        <Icon size='huge' name='plus circle' color='pink' />
                    </Link>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.user,
    events: state.events.myEvents,
})

const mapDispatchToProps = {
    fetchMyActiveEvents: fetchMyActiveEventsAction,
    userLoggin: userLogginAction
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
