import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import {
    Button,
    Divider,
    Grid,
    Header,
    Icon,
    Image,
    Segment,
    Step,
    Modal, 
    Form,
    Message,
    Input
} from 'semantic-ui-react';
import validator from 'validator';
import MessageBox from '../Views/MessageBox';
// import { Link } from 'react-router-dom';
import Profile from '../Forms/Profile'
import BankAccount from '../Forms/Payment';
import { emailSignIn, emailSignUp, forgotPassword, googleAuth, twitterAuth, facebookAuth, uploadImage} from '../fbase';
import { createUserAction, userLogginAction } from '../../actions/user';
import style from '../Style/Style';
import HtmlHeader from '../Views/HtmlHeader';
import firebase from '../../firebaseConfig';

let unsubscribe;

export class Authentication extends Component {
    static propTypes = {
        //prop: PropTypes
    }
    constructor (props) {
        super(props);
        this.state = {
            currentForm: 'Profile',
            maxIndex: 1,
            email: '',
            password: '',
            showAuthMethod: true,
            errorMessage: '',
            successMessage: '',
            emailMessage: '',
            data: {
                payment: { 
                    bankName: '',
                    accountNumber: 0,
                    accountName: '',
                },
    
                name: '',
                email: '',
                photoUrl: '',
                phoneNumber: '',
                description: '',
            },
            loadingEmailSignUp: false,
            loadingEmailSignIn: false,
            loadingForgotPassword: false,
            creatingAcct: false
        }


        this.messageBox = React.createRef();
    }

    componentDidMount() {
        unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                var {email, uid, phoneNumber, displayName, photoURL} = user;
                
                this.setState({ data: { ...this.state.data, firebaseId: uid,  photoUrl: photoURL, email: email, phoneNumber: phoneNumber, name: displayName } }, () => {
                    this.userLoggin(uid)
                })
            } else {
                // this.setState({ loading: false, isAuthenticated: false })
                console.log('Nouser');
                
            }
        });
    }

    componentWillUnmount()  {
        unsubscribe()
    }

    onChange = (e, data) => this.setState({ [data.name] : data.value })

    auhSuccess = (result) => {
        // HANDLED BY componentDidMount
        // if (result.user !== null)  {
        //     var {email, uid, phoneNumber, displayName, photoURL} = result.user;
        
        //     this.setState({ data: { ...this.state.data, firebaseId: uid,  photoUrl: photoURL, email: email, phoneNumber: phoneNumber, name: displayName } }, () => {
        //         this.userLoggin(uid)
        //     })
        // } else {
        //     console.log('auhSuccess:', result);
            
        // }
        

        // result.user.getIdToken(true).then(function(idToken) {
        //     // Send token to your backend via HTTPS
        //     // ...
        //   }).catch(function(error) {
        //     // Handle error
        //   });
    }

    authFailure = (error) => {
        // Handle Errors here.
        // var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        // let email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        // let credential = error.credential;

        this.setState({ errorMessage })
    }

    emailFailure = (error) => {
        console.log('err:', error);
        
        // Handle Errors here.
        // var errorCode = error.code;
        var message = error.message;
        // The email of the user's account used.
        // let email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        // let credential = error.credential;
        console.log(message);
        
        this.setState({ emailMessage: message })
    }

    emailLogin = () => {
        const { email, password } = this.state;
        this.setState({ errorMessage: '', successMessage: '', emailMessage: '', loadingEmailSignIn: true }, () => {
            emailSignIn(email, password)        
            .then((result) => {
                this.setState({ loadingEmailSignIn: false }, () => {
                    result.user.getIdToken()
                   // this.auhSuccess(result)
                })

            }).catch((error) => {
                this.setState({ loadingEmailSignIn: false }, () => {
                    this.emailFailure(error)
                })    
            })
        })
    }

    emailRegister = () => {
        const { email, password } = this.state;
        this.setState({errorMessage: '', successMessage: '', emailMessage: '', loadingEmailSignUp: true }, () => {
            emailSignUp(email, password)
            .then((result) => {
                this.setState({ loadingEmailSignUp: false }, () => {
                   // this.auhSuccess(result)
                })
                
            }).catch((error) => {
                this.setState({ loadingEmailSignUp: false }, () => {
                    this.emailFailure(error)
                })
                
            })
        })

    }

    emailForgotPassword = () => {
        const { email } = this.state;
        this.setState({errorMessage: '', successMessage: '',  emailMessage: '', loadingForgotPassword: true }, () => {
            forgotPassword(email)
            .then((result) => {
                this.setState({ loadingForgotPassword: false }, () => {
                    this.setState({ emailMessage: 'Reset password link has been sent to your email' })
                })
            }).catch((error) => {
                this.setState({ loadingForgotPassword: false }, () => {
                     this.emailFailure(error)
                })
               
            })
        })
        
    }

    facebookLogin = () => {
        this.setState({ errorMessage: '', successMessage: ''}, () => {
            facebookAuth()
            .then((result) => {
               // this.auhSuccess(result)
            }).catch((error) => {
                this.authFailure(error)
            })
        })
    }

    googleLogin = () => {
        this.setState({ errorMessage: '', successMessage: ''}, () => {
            googleAuth()
            .then((result) => {
                console.log('.then: ', result);
                
               // this.auhSuccess(result)
            }).catch((error) => {
                console.log('.catch: ', error);
                this.authFailure(error)
            })
        })
    }


    twitterLogin = () => {
        this.setState({ errorMessage: '', successMessage: ''}, () => {
            twitterAuth()
            .then((result) => {
               // this.auhSuccess(result)
            }).catch((error) => {
                this.authFailure(error)
            })
        })
    }


    // determine if the user is register
    userLoggin = (id) => {
        const { userLoggin } = this.props;
        this.setState({ errorMessage: '', successMessage: '' }, () => {
            this.messageBox.addMessage('Info', 'Confirming your registration status', true, false)
            userLoggin(id)
            .then(res => {
                
                if (res.data && res.data.error)  {
                    this.messageBox.addMessage('Info', `${res.data.error}`, false, false)
                    this.setState({ showAuthMethod: false })
                }
            })
            .catch((err) => {
                console.log('err auth: ', err);
                
                if(this.messageBox !== null ) {
                    this.messageBox.addMessage('Error', `${err.response.data.msg || 'Error logging user in'}`, false, false)
                }
            })
        })
    }

    updateUserProfile = () => {
        const { data } = this.state;

        if (!data.description || !data.phoneNumber || !data.photoUrl || !data.email || !data.name )  {
            this.messageBox.addMessage('Error', 'Complete the account form!', false, false);
    
        } else if (!validator.isEmail(data.email)) {
            this.messageBox.addMessage('Error', 'Enter a valid email address!' , false, false);
 
        } else { 
            this.setState({ currentForm: 'BankAccount', maxIndex: 2 })
        }

    }

    updateUserPayment = () => {
        const { data } = this.state;
        
        if (!data.payment.bankName || !data.payment.accountName || !data.payment.accountNumber)  {
            this.messageBox.addMessage('Error', 'Complete the payment form!', false, false);
        } else  {
            this.createUser()    
        } 
    }

    createUser = () => {
        const { data } = this.state;

        this.setState({ loading: true, creatingAcct: true }, () => {
            if (data.photoUrl  === 'string') {
                this.uploadUserAcct(data)
            } else { 
                this.uploadPoster(data.photoUrl, data.firebaseId)
            }
        })
    }

    uploadUserAcct = (data) => {
        const { createUser } = this.props;

        this.messageBox.addMessage('Info', 'Sending request to create your account', true, false)
        createUser(data)
        .then((res) => { 
            if (res.data && res.data.error)  {
                this.messageBox.addMessage('Info', `${res.data.error}`, false, false)     
            } else {
                if (this.messageBox) { 
                    this.messageBox.addMessage('Success', 'You have successfully created your account', true, false)  
                }
            }
            this.setState({ showAuthMethod: false, creatingAcct: false })
        }) 
        .catch(err => { 
            if (this.messageBox) {
                this.messageBox.addMessage('Error', `${err.response.data.msg || 'Problem creating your account'}`, false, false)
                this.setState({ creatingAcct: false })  
            }
      
        })  
    }

    uploadPoster = (poster, firebaseId) => {
        var uploadTask =  uploadImage('users', `${firebaseId}-${poster.name}`, poster)
        uploadTask.on('state_changed', (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          this.messageBox.addMessage('Info', `Uploading profile image:  ${progress.toFixed(2)}% uploaded `, true, true)
    
        }, (error) => {
          // Handle unsuccessful uploads
          this.setState({ creatingAcct: false })
          this.messageBox.addMessage('Error', error.message, false, true)
        }, () => {
          // Handle successful uploads on complete
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            this.setState({ data: { ...this.state.data, photoUrl: downloadURL } }, () => {
                this.uploadUserAcct(this.state.data)
            })
          });
        });
    }

    render() {
        const { currentForm, showAuthMethod, errorMessage, successMessage, emailMessage,
            email, password, data, loadingEmailSignUp, loadingForgotPassword, loadingEmailSignIn, creatingAcct } = this.state;
            
        return (
            <div className="ui container">
                <Segment inverted>
                    <Header as='h1' textAlign='center'>
                        <Header.Content>
                            Authentication
                        </Header.Content>
                    </Header>
                </Segment>
                <HtmlHeader page='Authentication' />
                {(!!errorMessage || !!successMessage)  && (
                    <Message error={!!errorMessage} success={!!successMessage}>
                        <Message.Content>
                            {successMessage}
                            {errorMessage}
                        </Message.Content>
                    </Message>
                )}
                {(showAuthMethod) && (<div>
                <Segment placeholder>
                    <Grid columns={2} textAlign='center'>
                    <Divider vertical>Or</Divider>

                    <Grid.Row verticalAlign='top'>
                        <Grid.Column>
                        <Header icon>
                            {/* <Icon name='user circle' /> */}
                            Sign Up
                        </Header>

                        <div>
                            <Modal onClose={() => this.setState({ emailMessage: '' })} size={'small'} trigger={ <Button size='big' circular color='twitter' icon='mail' />} closeIcon>
                                <Modal.Header>Sign Up</Modal.Header>
                                <Modal.Content>
                                    <Modal.Description>
                                            {(!!emailMessage)  && (
                                                <Message error={!!emailMessage}>
                                                    <Message.Content>
                                                     
                                                        {emailMessage}
                                                    </Message.Content>
                                                </Message>
                                            )}
                                        <Form>

                                            <Form.Field>
                                                <label>Email <Icon name="asterisk" color='red' size='mini' /></label>
                                                <Form.Input error={emailMessage.includes('email')} type={'email'} placeholder={'Enter your email address'} defaultValue={email} name='email' onChange={(e, d) => this.onChange(e, d)}/>
                                            </Form.Field>

                                            <Form.Field>
                                                <label>Password <Icon name="asterisk" color='red' size='mini' /></label>
                                                <Input error={emailMessage.includes('password')} type={'password'} placeholder={'Enter your secure password'} defaultValue={password} name='password' onChange={(e, d) => this.onChange(e, d)}/>
                                            </Form.Field>
                                        </Form>
                                    
                                    </Modal.Description>
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button disabled={loadingEmailSignUp} color={'pink'} onClick={() => this.emailRegister()}>
                                        {loadingEmailSignUp? <Icon name='spinner' loading /> :"Sign Up"}
                                    </Button>
                                </Modal.Actions>
                            </Modal>
                        </div>

                       
                        </Grid.Column>

                        <Grid.Column>
                        <Header icon>
                            {/* <Icon name='sign in' /> */}
                            Sign In
                        </Header>
                        <div>
                            <Modal onClose={() => this.setState({ emailMessage: '' })} size={'small'} trigger={ <Button size='big' circular color='twitter' icon='mail' />} closeIcon>
                                <Modal.Header>Sign In</Modal.Header>
                                <Modal.Content>
                                    <Modal.Description>
                                            {(!!emailMessage)  && (
                                                <Message error={!!emailMessage}>
                                                    <Message.Content>
                                                     
                                                        {emailMessage}
                                                    </Message.Content>
                                                </Message>
                                            )}
                                        <Form>
                                            <Form.Field>
                                                <label>Email <Icon name="asterisk" color='red' size='mini' /></label>
                                                <Input error={emailMessage.includes('email')} type={'email'} placeholder={'Enter your email address'} name='email' defaultValue={email} onChange={(e, d) => this.onChange(e, d)}/>
                                            </Form.Field>

                                            <Form.Field>
                                                <label>Password <Icon name="asterisk" color='red' size='mini' /></label>
                                                <Input error={emailMessage.includes('password')} type={'password'} placeholder={'Enter your secure password'} name='password' defaultValue={password} onChange={(e, d) => this.onChange(e, d)}/>
                                            </Form.Field>
                                        </Form>
                                    
                                    </Modal.Description>
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button disabled={loadingEmailSignIn} color={'pink'} onClick={() => this.emailLogin()}>
                                        
                                        {loadingEmailSignIn? <Icon name='spinner' loading /> :"Sign In"}
                                    </Button>
                                </Modal.Actions>
                            </Modal>
                            <br />

                            
                            <Modal onClose={() => this.setState({ emailMessage: '' })} size={'small'} trigger={<a>Forgot Password</a>} closeIcon>
                                <Modal.Header>Forgot Password</Modal.Header>
                                <Modal.Content>
                                    <Modal.Description>
                                        {(!!emailMessage)  && (
                                                <Message error={!!emailMessage}>
                                                    <Message.Content>
                                                     
                                                        {emailMessage}
                                                    </Message.Content>
                                                </Message>
                                            )}
                                        <Form>
                                            <Form.Field>
                                                <label>Email <Icon name="asterisk" color='red' size='mini' /></label>
                                                <Input error={emailMessage.includes('email')} type={'email'} placeholder={'Enter your email address'} name='email' defaultValue={email}  onChange={(e, d) => this.onChange(e, d)}/>
                                            </Form.Field>
                                        </Form>
                                    
                                    </Modal.Description>
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button disabled={loadingForgotPassword} color={'pink'} onClick={() => this.emailForgotPassword()}>
                                        
                                        {loadingForgotPassword? <Icon name='spinner' loading /> :"Reset password"}
                                    </Button>
                                </Modal.Actions>
                            </Modal>
                        </div>
                        </Grid.Column>
                    </Grid.Row>
                    </Grid>
                </Segment>
                <Segment inverted attached='top' textAlign='center'>
                        <Button circular size='big' color='facebook' icon='facebook' onClick={() => this.facebookLogin()}/>
                        <Button circular size='big' color='twitter' icon='twitter' onClick={() => this.twitterLogin()}/>
                        <Button circular size='big' color='instagram' icon='google' onClick={() => this.googleLogin()}/>
                        {/* <Button circular color='facebook' icon='facebook' onClick={() => this.facebookLogin()}/>
                        <Button circular color='twitter' icon='twitter' onClick={() => this.twitterLogin()}/>
                        <Button circular color='instagram' icon='google' onClick={() => this.googleLogin()}/> */}
                </Segment>
                </div>)}


                {(!showAuthMethod) && (<div>
                    <Step.Group attached='top'>
                            <Step onClick={() => this.setState({ currentForm: 'Profile' })} active={this.state.currentForm === 'Profile'}>
                            <Icon name='user' />
                            <Step.Content>
                                <Step.Title>Account</Step.Title>
                                <Step.Description>Enter your account details</Step.Description>
                            </Step.Content>
                            </Step>
                    
                            <Step onClick={() => this.setState({ currentForm: 'BankAccount' })} active={this.state.currentForm === 'BankAccount'} disabled={(this.state.maxIndex < 2)}>
                            <Icon name='money' />
                            <Step.Content>
                                <Step.Title>Payment</Step.Title>
                                <Step.Description>Enter your bank information</Step.Description>
                            </Step.Content>
                            </Step>
                    </Step.Group>
                
                    <Segment attached loading={creatingAcct}>
                            {(currentForm === 'Profile') && (<div>
                                {(!!data.photoUrl) && (<Image centered size='medium' src={(typeof data.photoUrl  === 'string')? data.photoUrl  : URL.createObjectURL(data.photoUrl)} />)}
                                <Profile 
                                user={data}
                                edit={false}
                                onChange = {(e) => this.setState({ data: {...this.state.data, [e.name]: e.value } })}
                                onUploadImage= {(e) => this.setState({ data: { ...this.state.data, photoUrl: e.target.files[0] } })}
                                />
                                <br />
                                <Button color='pink' onClick={() => this.updateUserProfile()} floated='right'>
                                    Next
                                    <Icon name='arrow right' />
                                </Button>
                            </div>)}

                            {(currentForm === 'BankAccount') && (
                                <div>
                                    <Header textAlign='center'>
                                        <Header.Subheader>
                                            Disclaimer: Your bank information will only be used to pay you your ticket revenue.
                                        </Header.Subheader>
                                    </Header>
                                    <BankAccount
                                    save={() => this.updateUserPayment()}
                                    payment={data.payment}
                                    onChange = {(e) => this.setState({ data: {...this.state.data, payment: { ...this.state.data.payment, [e.name]: e.value } } })}
                                    onChangeBank = {(bankName) => this.setState({ data: {...this.state.data, payment: { ...this.state.data.payment, bankName } } })}
                                    />

                                    <br />
                                    <br />

                                    <div style={style.center}>
                                        <a style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => this.createUser()}>skip</a>
                                    </div>
                                        
                                    <br />
                                    <br />
                                    <br />
                                
                                    {/* <Button color='pink' onClick={() => this.updateUserPayment()} floated='right'>
                                        Save
                                    </Button> */}
                                    <Button color='pink' onClick={()=> this.setState({ currentForm: 'Profile' })} floated='left'>
                                        <Icon name='arrow left' />
                                        Back
                                    </Button>
                                </div>
                            )}


                    </Segment>
                </div>)}
                <MessageBox ref={c=> (this.messageBox = c)} />
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.user
})

const mapDispatchToProps = { 
    createUser: createUserAction, 
    userLoggin: userLogginAction
}

export default connect(mapStateToProps, mapDispatchToProps)(Authentication)
