import React, { Component } from 'react'
import { Segment, Header, Form, Button, Confirm, Icon } from 'semantic-ui-react';
import validator  from 'validator'
import HtmlHeader from '../Views/HtmlHeader';
import MessageBox from '../Views/MessageBox';
import { organizerUnsubscribe } from '../../actions/register'

export default class Unsubscribe extends Component {
    constructor (props)  {
        super(props);
        this.state = {
            userId: props.match.params.userId,
            email: '',
            open: false,
            loading: false
        };
        this.messageBox = React.createRef();
    }
    

    onChange = e => this.setState({ [e.target.name]: e.target.value })

    validate = () => {
        const { email } = this.state;

        if (!validator.isEmail(email)) {
            this.messageBox.addMessage('Warning', 'Enter a valid email adddress', false, false)
        } else {
            this.handleConfirm()
        }
    }

    organizerUnsubscribe = () => {
        const { email, userId } = this.state;

        this.messageBox.addMessage('Info', 'Sending unsubscribe request', true, false);

        this.setState({ loading: true }, () => {
            organizerUnsubscribe(email, userId)
            .then(res => { 
                if (res.data.error) {
                    this.messageBox.addMessage('Error', res.data.error , false, false)
                } else {
                    this.messageBox.addMessage('Success', `${res.data.msg || 'You have successfully unsubscribe'}`, true, false)
                }  
                this.setState({ loading: false })     
            }) 
            .catch(err => { 
                this.setState({ loading: false })  
                this.messageBox.addMessage('Error', `${err.response.data.msg || 'Problem unsubscribing from event organizer'}`, false, false)
            }) 
        })
    }

    show = () => this.setState({ open: true })
    handleConfirm = () => this.setState({ open: false }, () => {
        this.organizerUnsubscribe()
    })
    handleCancel = () => this.setState({ open: false })

    render() {
        const { email, loading } = this.state;
        return (
            <div className="ui container">
                <HtmlHeader page="Unsubscribe" />
                
                <Confirm
                    open={this.state.open}
                    content='If you unsubscribe, you will not recieve any notifications / invitation from this event organizer. Are you sure you want to unsubscribe?'
                    onCancel={this.handleCancel}
                    onConfirm={this.handleConfirm}
                    cancelButton='Never mind'
                    confirmButton="Yes"
                />
                <Segment inverted>
                    <Header as='h1' textAlign='center'>
                        <Header.Content>
                            Unsubscribe
                        </Header.Content>
                    </Header>
                </Segment>
                <Segment>
                    <Form loading={loading}>
                        <Form.Field>
                            <label>Email <Icon name="asterisk" color='red' size='mini' /></label>
                            <input type='email' defaultValue={email} name='email' onChange={(e) => this.onChange(e)} />
                        </Form.Field>
                        <Button color='pink' fluid onClick={() => this.validate()}>Unsubscribe</Button>
                    </Form>
                </Segment>
                <MessageBox ref={c=> (this.messageBox = c)} />
            </div>
        )
    }
}
