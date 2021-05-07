import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Image, Button, Message, Segment, Menu, Header } from 'semantic-ui-react';
// import { Link } from 'react-router-dom';
// import moment from 'moment'
import validator from 'validator'
import style from '../Style/Style';
import ProfileForm from '../Forms/Profile';
import PaymentForm from '../Forms/Payment';
import AuthForm from '../Forms/AuthForm';
import { userUpdateAction, updatePaymentAction, userLogOut   } from '../../actions/user';
import { forgotPassword, changePassword, uploadImage } from '../fbase'
import MessageBox from '../Views/MessageBox';
import HtmlHeader from '../Views/HtmlHeader';




export class Settings extends Component {

    constructor(props) {
        super(props);
        this.state = {   
            activeItem: 'Account',     
            data: props.user,
            authData: {
                email: '', 
                oldPassword: '', 
                newPassword: ''
            },
            accountError: '',
            paymentError: '',
            authError: '',
            updatingUser: false,
            loadingAccount: false,
            loadingPayment: false,
            loadingAuth: false
        }
        this.messageBox = React.createRef();
    }

    UNSAFE_componentWillReceiveProps(nextProp){
        // call a function that will update location
        if (nextProp.user.updatedAt !== this.state.data.updatedAt ) {
            this.setState({
                data: nextProp.user
            })
        }   
    }

    updateUser = () => {
        const { data } = this.state;

        this.setState({  accountError : '' }, () => {
            
            if (!data.description || !data.phoneNumber || !data.photoUrl || !data.email || !data.name )  {
                this.setState({ accountError: 'Complete the account form!' })
            } else if (!validator.isEmail(data.email)) {
                this.setState({ accountError: 'Enter a valid email address!' })
            } else {
                    this.uploadDecide()
            }
        })   
    }

    uploadDecide = () => {
        const {user} = this.props;
        const { data } = this.state;

        if (typeof data.photoUrl  === 'string') {
            this.uploadUserAcct(data)
        } else { 
            this.uploadPoster(data.photoUrl, user.firebaseId)
        }
    
    }

    uploadUserAcct = (data) => {
        const { userUpdate } = this.props;
        this.setState({  accountError : '', loadingAccount: true }, () => {
            if (!data.name || !data.email || !data.phoneNumber || !data.description)  {
                this.setState({ paymentError: 'Complete the account form', loadingAccount: false  })
            } else  {
                this.messageBox.addMessage('Success', 'Sending request update your information', true, false)
                userUpdate(data)
                .then((res) => { 
                    this.setState({ loadingAccount: false }, () => {
                        this.messageBox.addMessage('Success', 'You have successfully updated your information', true, false)
                    })
                 }) 
                .catch(err => { 
                    this.setState({ loadingAccount: false }, () => {
                        this.messageBox.addMessage('Error', `${err.response.data.msg || 'Problem updating your information'}`, false, false) 
                    })
                })
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
          this.setState({ loading: false })
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

    updateUserPayment = () => {
        const { updatePayment, user} = this.props;
        const { data } = this.state
        this.setState({  paymentError : '', loadingPayment: true }, () => {
            if (!data.payment.bankName || !data.payment.accountName || !data.payment.accountNumber)  {
                this.setState({ paymentError: 'Complete the payment form!', loadingPayment: false  })
            } else  {
                this.messageBox.addMessage('Success', 'Sending request to update your payment details', true, false)
                updatePayment(data.payment, user._id)
                .then(() => { 
                    this.setState({ loadingPayment: false }, () => {
                        this.messageBox.addMessage('Success', 'Payment details successfully updated', true, false) 
                    })
                }) 
                .catch(err => { 
                    this.setState({ loadingPayment: false }, () => {
                        this.messageBox.addMessage('Error', `${err.response.data.msg || 'Problem updating your payment details'}`, false, false) 
                    })
                })
            }
        })
        
    }

    changeUserPassword = (email, oldPassword, newPassword) => {
        this.setState({  authError : '', loadingAuth: true }, () => {
            this.messageBox.addMessage('Success', 'Sending request to change your password', true, false)
            changePassword(email, oldPassword, newPassword, () => {
                // success 
                this.setState({ loadingAuth: false }, () => {
                    this.messageBox.addMessage('Success', 'Password Successfully changed', true, false);
                    userLogOut()
                })
                
            }, (error) => {
                //failure
                this.setState({ loadingAuth: false }, () => {
                    this.messageBox.addMessage('Error', error.message, false, false)
                })
                
            })
        })
    }

    resetUserPassword = (email) => {
        this.setState({  authError : '', loadingAuth: true }, () => {
            this.messageBox.addMessage('Success', 'Sending request to reset password', true, false)
            forgotPassword(email)
            .then((user) => {
                // Update successful.
                this.setState({ loadingAuth: false }, () => {
                    this.messageBox.addMessage('Success', 'Check your email for password reset link', true, false)
                    userLogOut()
                })
            }).catch((error) => {
                // An error happened. 
                this.setState({ loadingAuth: false }, () => {
                    this.messageBox.addMessage('Error', error.message, false, false)
                })
            });
            
        })

    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    render() {
        const { accountError, paymentError, authError, data, activeItem, loadingAccount, loadingPayment, loadingAuth } = this.state;
        const { user } = this.props;
        
        return (
            <div className="ui container">
                <HtmlHeader page="Settings" />
                <Segment inverted>
                    <Header as='h1' textAlign='center'>
                        <Header.Content>
                            Settings
                        </Header.Content>
                    </Header>
                </Segment>

                <Menu pointing>
                    <Menu.Item
                        icon='user'
                        name='Account'
                        active={activeItem === 'Account'}
                        onClick={this.handleItemClick}
                    />
                    <Menu.Item
                        icon='money'
                        name='Payment'
                        active={activeItem === 'Payment'}
                        onClick={this.handleItemClick}
                    />
                    <Menu.Item
                        icon='lock'
                        name='Authentication'
                        active={activeItem === 'Authentication'}
                        onClick={this.handleItemClick}
                    />
                </Menu>

                
                    {(activeItem === 'Account') && (<Segment loading={loadingAccount}>
                        {(data.photoUrl) && (<Image centered size='medium' src={(typeof data.photoUrl  === 'string')? data.photoUrl  : URL.createObjectURL(data.photoUrl)} />)}
                        <ProfileForm 
                        key={'account-form'}
                        user={user}
                        edit={true}
                        onChange = {(e) => this.setState({ data: {...this.state.data, [e.name]: e.value } })}
                        onUploadImage= {(e) => this.setState({ data: { ...this.state.data, photoUrl: e.target.files[0] } })}
                        />
                        <br />
                        {(!!accountError) && (<Message error>
                            <Message.Header>Error</Message.Header>
                            <Message.Content>
                            {accountError}
                            </Message.Content>
                        </Message>)}
                        <div style={style.alignedRight}>
                            <Button color='pink' onClick={() => this.updateUser()}>Save</Button>
                        </div>
                    </Segment>)}

                    {(activeItem === 'Payment') && (<Segment loading={loadingPayment}>
                        <PaymentForm 
                            key={'payment-form'}
                            save={() => this.updateUserPayment()}
                            payment={data.payment}
                            onChange = {(e) => this.setState({ data: {...this.state.data, payment: { ...this.state.data.payment, [e.name]: e.value } } })}
                            onChangeBank = {(bankName) => this.setState({ data: {...this.state.data, payment: { ...this.state.data.payment, bankName } } })}
                        />
                        <br />
                        {(!!paymentError) && (<Message error>
                            <Message.Header>Error</Message.Header>
                            <Message.Content>
                                {paymentError}
                            </Message.Content>
                        </Message>)}
                    </Segment>)}

                    {(activeItem === 'Authentication') && (<Segment loading={loadingAuth}>
                        <AuthForm
                        key={'auth-form'}
                        changePassword={(email, oldPassword, newPassword) => this.changeUserPassword(email, oldPassword, newPassword)} 
                        resetPassword={(email) => this.resetUserPassword(email)} />
                    </Segment>)}


                <MessageBox ref={c=> (this.messageBox = c)} />
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.user,
})

const mapDispatchToProps = {
    userUpdate: userUpdateAction, 
    updatePayment: updatePaymentAction,
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
