import React, { Component } from 'react';
import { Form, Card, Icon, Segment, Button, Message } from 'semantic-ui-react';
import validator from 'validator';
import style from '../Style/Style';

export default class authForm extends Component {
    state = {
        authMethod: '',
        forgot: {
            email: ''
        },
        change: {
            email: '',
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        },
        errorMsg: ''
    }

    onChangePassword = (e) => this.setState({ change: { ...this.state.change, [e.target.name]: e.target.value }})

    onForgotPassword = (e) => this.setState({ forgot: { ...this.state.forgot, [e.target.name]: e.target.value }})

    submitForm = () => {
        const { authMethod, forgot, change } = this.state;
        const { changePassword, resetPassword} = this.props;
        this.setState({ errorMsg: '' }, () => {

            let error = this.validateData(authMethod, forgot, change);

            if (error) {
                this.setState({ errorMsg: error })
            } else {
                if (authMethod === 'change') {
                    changePassword(change.email, change.oldPassword, change.newPassword)
                } else {
                    resetPassword(forgot.email)
                }
            }
        })

    }

    validateData = (authMethod, forgot, change) => {
        let error = ''
        if (authMethod === 'change') {
            if (!change.email || !change.oldPassword || !change.newPassword ) {
                error = 'Complete the change password form'
            } else if (!validator.isEmail(change.email)) {
                error = 'Enter a valid email address!'
            } else if (change.newPassword !== change.confirmPassword) {
                
                error = 'New password and confirm password do not match'
            }

        } else {
            if (!validator.isEmail(forgot.email)) {
                error = 'Enter a valid email address!'
            }
        }

        return error;
    }

    render() {
        const { authMethod, errorMsg } = this.state;
        return (
            <div>
                <Card.Group itemsPerRow='2'>
                    <Card color={authMethod === 'change'? 'pink': 'black'}>
                        <div style={style.center}>
                            <Icon onClick={() => this.setState({ authMethod: 'change', errorMsg: '' })} color={authMethod === 'change'? 'pink': 'black'} name='exchange' size='huge'/>
                        </div>
                        <Card.Content>
                            <Card.Header as='a' onClick={() => this.setState({ authMethod: 'change', errorMsg: '' })} textAlign='center'>Change Password</Card.Header>
                        </Card.Content>
                    </Card>
        
                    <Card color={authMethod === 'forgot'? 'pink': 'black'}>
                        <div style={style.center}>
                            <Icon onClick={() => this.setState({ authMethod: 'forgot'})} color={authMethod === 'forgot'? 'pink': 'black'} name='lock' size='huge'/>
                        </div>
                        <Card.Content>
                            <Card.Header as='a' onClick={() => this.setState({ authMethod: 'forgot'})} textAlign='center'>Forgot Password</Card.Header>
                        </Card.Content>
                    </Card>
                </Card.Group>
                {(!!errorMsg) && (<Message error>
                    <Message.Header>Error</Message.Header>
                    <Message.Content>{errorMsg}</Message.Content>
                </Message>)}
                {(!!authMethod) && (<Segment>
                    {(authMethod === 'forgot') && (<Form>
                        <Form.Field>
                            <label>email<Icon name="asterisk" color='red' size='mini' /></label>
                            <input name='email' type='email' placeholder='Enter your email address' onChange={(e) =>this.onForgotPassword(e)}/>
                        </Form.Field>
                    </Form>)}

                    {(authMethod === 'change') && (<Form>
                        <Form.Field>
                            <label>Email<Icon name="asterisk" color='red' size='mini' /></label>
                            <input name='email' type='email' placeholder='Enter your email address' onChange={(e) =>this.onChangePassword(e)}/>
                        </Form.Field>

                        <Form.Field>
                            <label>Old Password<Icon name="asterisk" color='red' size='mini' /></label>
                            <input name='oldPassword' type='password'  placeholder='Enter your old password' onChange={(e) =>this.onChangePassword(e)} />
                        </Form.Field>

                        <Form.Field>
                            <label>New Password<Icon name="asterisk" color='red' size='mini' /></label>
                            <input name='newPassword' type='password'  placeholder='Enter your new password' onChange={(e) =>this.onChangePassword(e)} />
                        </Form.Field>

                        <Form.Field>
                            <label>Confirm Password<Icon name="asterisk" color='red' size='mini' /></label>
                            <input name='confirmPassword' type='password'  placeholder='Confirm your new password' onChange={(e) =>this.onChangePassword(e)} />
                        </Form.Field>
                    </Form>)}
                </Segment>)}
                <br />
                {(!!authMethod) && <div style={style.alignedRight}>
                    <Button color='pink' onClick={() => this.submitForm()}>{authMethod==='change'? 'Change password' : 'Reset Password'}</Button>
                </div>}
            </div>
        )
    }
}
