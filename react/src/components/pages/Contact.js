import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Segment, Header, Form, Icon, Button } from 'semantic-ui-react';
import validator from 'validator';
import MessageBox from '../Views/MessageBox';
import { sendContact }  from '../../actions/register';
import HtmlHeader from '../Views/HtmlHeader';

class Contact extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                name: this.props.customer.name || '',
                email: this.props.customer.email || '',
                reason: 'complaint',
                message: '',
                sendCopy: false
            }
        };
        this.messageBox = React.createRef()
    }

    onChange = (e) => this.setState({ data: {...this.state.data, [e.target.name]: e.target.value } })

    sendContact = () => {
        const { data } = this.state;

        if (!data.email || !data.message || !data.name || !data.reason) {
            this.messageBox.addMessage('Error', 'Complete the contact form', false, false)
        }  else if (!validator.isEmail(data.email)) {
            this.messageBox.addMessage('Error', 'Enter a valid email', false, false)
        }else {
            this.messageBox.addMessage('Info', 'Making a request to send your message', true, false)
            sendContact(data)
            .then((res) => {
                if (res.data.error) {
                    this.messageBox.addMessage('Error', res.data.error , false, false)
                } else {
                    this.messageBox.addMessage('Success', `${ res.data.msg || 'Message sent!'}`, true, false)
                }
                
            }).catch(error => {
                this.messageBox.addMessage('Error', `${error.msg || 'Problem sending your message'}`, false, false)
            })
        }
    }

    render() {
        const { data } = this.state;
        return (
            <div className="ui container">
                <HtmlHeader page='Contact Us'/>
                
            <Segment inverted>
                <Header as='h1' textAlign='center'>
                    <Header.Content>
                        Contact Us
                    </Header.Content>
                </Header>
            </Segment>

            <Segment>
                <Form>
                    <Form.Field>
                        <label>Name <Icon name="asterisk" color='red' size='mini' /></label>
                        <input defaultValue={data.name} type='text' onChange={(e) => this.onChange(e)} name='name' placeholder='Enter your name'/>
                    </Form.Field>

                    <Form.Field>
                        <label>Email <Icon name="asterisk" color='red' size='mini' /></label>
                        <input defaultValue={data.email} type='email' onChange={(e) => this.onChange(e)} name='email' placeholder='Enter your email address' />
                    </Form.Field>

                    <Form.Field>
                        <label>Reason <Icon name="asterisk" color='red' size='mini' /></label>
                        <select defaultValue={data.reason} onChange={(e) => this.onChange(e)} name='reason' placeholder='Choose your reason for contacting us'>
                            <option value='complaint'>Complaint</option>
                            <option value='enquire'>Enquire</option>
                            <option value='recommendation'>Recommendation</option>
                        </select>
                    </Form.Field>

                    <Form.Field>
                        <label>Message <Icon name="asterisk" color='red' size='mini' /></label>
                        <textarea defaultValue={data.message} onChange={(e) => this.onChange(e)} name='message' placholder='write your message here' />
                    </Form.Field>

                    {/* <Form.Field>
    
                        <Checkbox name='sendCopy' defaultChecked={data.sendCopy} onChange={() => this.setState({ data: {...this.state.data, sendCopy: !data.sendCopy } })} label='send a copy to my mail.'/>
                    </Form.Field> */}

                    <Button fluid color='pink' onClick={() => this.sendContact()}>Submit</Button>
                </Form>

            </Segment>
            <MessageBox ref={c=> (this.messageBox = c)} />
        </div>
        )
    }
}


const mapStateToProps = (state) => ({
    customer: state.customer
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(Contact)
