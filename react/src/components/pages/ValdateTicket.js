import React, { Component } from 'react'
import { Segment, Icon, Header, Grid} from 'semantic-ui-react';
import moment from 'moment'
import HtmlHeader from '../Views/HtmlHeader';
import MessageBox from '../Views/MessageBox';
import { validateTicket } from '../../actions/register';
// import style from '../Style/Style'

export default class ValidateTicket extends Component {
    constructor (props)  {
        super(props);
        this.state = {
            email: this.props.match.params.email,
            registrationNumber: this.props.match.params.registrationNumber,
            loading: false,
            registration: null
        };

        this.messageBox = React.createRef();
    }

    componentDidMount() {
        this.getValidation()
    }
    
    
    getValidation = () => {
        const { email, registrationNumber } = this.state;

        this.setState({ loading: true, }, () => {
            validateTicket(email, registrationNumber)
            .then((res) => { 
                this.setState({ loading: false, registration: res.data.registration })
            }) 
            .catch(err => { 
                this.setState({ loading: false })
                if (this.messageBox) {
                    this.messageBox.addMessage('Error', `${err.response.data.msg || 'Problem getting your tickt validation'}`, false, false)
                }
            })
        })
        
    }

    render() {
        
        const { loading, registration } = this.state;
        return (
            <div className="ui container">
                <HtmlHeader page="Ticket Validation" />
                
                <Segment inverted>
                    <Header as='h1' textAlign='center'>
                        <Header.Content>
                            Ticket Validation
                        </Header.Content>
                    </Header>
                </Segment>
                <Segment loading={loading}>
                    {(registration !== null) && (<div >
                        <Header textAlign='center'> 
                            <Header.Content as='h2'>
                                {registration.eventId.name}
                            </Header.Content>
                            <Header.Subheader>
                                event status: {registration.eventId.published? <b style={{ color: 'green' }}>Active</b> : <b style={{ color: 'red' }}>Inactive</b>}
                            </Header.Subheader>
                        </Header>
                        <Grid>
                        <Grid.Row>
                            <Grid.Column width='7' textAlign='right'>
                                <div>
                                    <p>{registration.eventId.time.startStr} to {registration.eventId.time.startStr}</p>
                                </div>    
                            </Grid.Column>
                            <Grid.Column width='1'>
                                <div>|</div>
                            </Grid.Column>
                            <Grid.Column width='7'>
                                <div>
                                    <p>{registration.eventId.location.text}</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                    <br />

                    <Header textAlign='center'> 
                        <Header.Content as='h2'>
                            Ticket status: {registration.active? <b style={{ color: 'green' }}>Valid</b> : <b style={{ color: 'red' }}>Cancelled</b>}
                        </Header.Content>
                        {(!registration.active) && (<Header.Subheader>
                           Ticket cancellation date: {moment(registration.cancellationDate).toLocaleString()}
                        </Header.Subheader>)}
                    </Header>    
                    </div>)}

                    {(registration  === null) && (<div>
                        <Header as='h3' icon textAlign='center'>
                        <Icon name='find' color='red'/>
                        <Header>
                            <Header.Content>
                                Ticket registration not found
                            </Header.Content>
                        </Header>
                    </Header>
                    </div>)}


                </Segment>
                <MessageBox ref={c=> (this.messageBox = c)} />
            </div>
        )
    }
}

