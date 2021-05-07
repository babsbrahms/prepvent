import React, { Component } from 'react'
import { Message, Modal, Form, Checkbox, Button, Divider, Input, Icon } from 'semantic-ui-react';
import parser from 'html-react-parser';
import validator from 'validator';

class FollowOrganizer extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            subscriber: {
                // name: this.props.customer.name || '',
                email: this.props.customer.email || '',
                // phoneNumber: this.props.customer.phoneNumber|| '', 
                subscribe: true,
                organizerId: props.organizer._id
            },
            modalOPen: false,
            subscriberError: ''
        };
        this.messageBox = React.createRef()
    }


  onChange = (e,d) => this.setState({ subscriber: { ...this.state.subscriber, [d.name] : d.value } })

  subscribeToOraganizer = () => {
        const { subscriber } = this.state;
        const { organizerSubscriber } = this.props;

        this.setState({ subscriberError : '' }, () => {
            let error = this.validateSubscriber();
            
            if (error)  {
                this.setState({ subscriberError: error })
            } else {
                this.setState({ modalOPen: false }, () => {
                    organizerSubscriber(subscriber)
                })
            }
        })
    }

    validateSubscriber = () => {
        const { subscriber } = this.state;
        let error = ''
        
        if (!validator.isEmail(subscriber.email)) {
            error = 'Enter a valid email address'
        } 
        
        return error;
    }


  render() {
    const { organizer } = this.props;
    const { subscriber, subscriberError, modalOPen } = this.state;
    return (
        <Modal 
        open={modalOPen} 
        onOpen={() => this.setState({ modalOPen: true}) }
        onClose={() => this.setState({ modalOPen: false, subscriberError: ''}) }
        trigger={<a style={{ cursor: "pointer"}}>follow</a>} closeIcon>
            <Modal.Header>Follow {organizer.name}</Modal.Header>
            <Modal.Content>
                <Modal.Description>
                        {(!!subscriberError) && (<Message error>
                            <Message.Header>Error</Message.Header>
                            <Message.Content>
                                {subscriberError}
                            </Message.Content>
                        </Message>)}
                    <Form>
                        {/* <Form.Field>
                            <label>Name</label>
                            <Input type={'text'} name='name' placeholder='Enter your name' onChange={(e,d) => this.onChange(e,d)} defaultValue={subscriber.name}/>
                        </Form.Field> */}
                        <Form.Field>
                            <label>Email <Icon name="asterisk" color='red' size='mini' /></label>
                            <Input error={subscriberError.includes('email')} type={'email'} name={'email'} placeholder='Enter your email address' onChange={(e,d) => this.onChange(e,d)} defaultValue={subscriber.email}/>
                        </Form.Field>

                        {/* <Form.Field>
                            <label>Phone number</label>
                            <Input type='tel' placeholder='Enter your phone number' onChange={(e,d) => this.onChange(e,d)} defaultValue={subscriber.phoneNumber}/>
                        </Form.Field> */}
                        <Divider />
                        <Form.Field>
                            <Checkbox 
                            disabled
                            checked 
                            label={parser(`I accept the <Link to='/terms'>terms of service</Link> and have read the <Link to='/privacy'>privacy policy</Link>. I agree that my information will be shared with the event organizer.`)} />                        
                        </Form.Field>
                        <Form.Field>
                            <Checkbox onChange={() => this.setState({ subscriber: { ...this.state.subscriber, subscribe: !this.state.subscriber.subscribe } })} checked={subscriber.subscribe} label='I want PrepVENT to notify me about new events nearby.' />
                        </Form.Field>
                    </Form>
                
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button color="pink" onClick={() => this.subscribeToOraganizer()}>
                    Follow
                </Button>
            </Modal.Actions>
        </Modal>
    )
  }
}

export default FollowOrganizer;