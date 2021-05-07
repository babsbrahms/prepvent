import React, { Component } from 'react'
import { Segment, Card, Divider, Button, Icon, Header, Form,  Modal, Radio, Confirm, Statistic, Message } from 'semantic-ui-react';
import parse from 'html-react-parser';
import * as csv from "csvtojson";
import validator from 'validator';
import SmsCount from '../Views/SmsCount';
import Resources from '../Views/Resources';
import splitter from 'split-sms';
import style from '../Style/Style';
import CsvFormat from '../Views/CsvFormat';
import { getEmailRegisterCount, getSmsRegisterCount }  from '../../actions/event';
import PayStack from '../Views/PayStack';
import EmailEditor from '../Editor/EmailEditor';
import TemplateEditor from '../Editor/TemplateEditor';
import TextEditor from '../Editor/TextEditor'


export default class Communication extends Component {
    constructor(props) {
        super(props);
        this.state = {
            link: `${props.hostname}/e/${`${props.eventId}`}`,
            unsubcribeLink: `${props.hostname}/unsubscribe/o/${props.userId}`,
            bulkMethod: '',
            invitationLetter: "",
            smsLetter: '',
            name: 'Event Name',
            modalOPen: false,
            emailList: [],
            smsList: [],
            customizeEmail: false,
            customizeDesign: null,
            emailTemplateText: '',
            textEditorText: '',
            templateEditorText: '',
            templateEditorIndex: 0,
            open: false,
            paymentOpen: false,
            emailSubject: props.name,
            paymentDetails: {
                email: props.email,
                amount: 0,
                currency: props.currency,
                response: null,
            },
            emailCount: 0, // how many contact to send msg to
            smsCount: 0,
            emailSendingMethod: '', // 'imported contact' or 'registered event-goers'
            smsSendingMethod: '', // 'imported contact' or 'registered event-goers'
            EditorType: '', 
            loadingSms: false,
            loadingEmail: false
        }

        this.emailListImport = React.createRef()
        this.smsListImport = React.createRef()
    }

    // onChange(e) {
    //     let reader = new FileReader();
    //     reader.onload = function(e) {
    //         this.setState({file: reader.result})
    //     }
    //     reader.readAsDataURL(e.target.files[0]);
    // }

    onUpload = e => {
        const { addAlert } = this.props;
        const { bulkMethod } = this.state;
      // Check for the various File API support.
        e.preventDefault()
        if (e.target.files.length > 0) {
            if (window.FileReader) {
                if (e.target.files[0].type === "text/csv") {
                    // FileReader are supported.;
                    var reader = new FileReader();
                    // Read file into memory as UTF-8      
                    reader.readAsText(e.target.files[0]);
                    // Handle errors load
                    reader.onload = (event) => {
                        var csvString = reader.result;
                        addAlert('Success', `Fetching data`, true, false)
        
                        csv({
                            // output: "csv"
                        })
                        .fromString(csvString)
                        .then((result) =>{
                            if (bulkMethod === 'sms') {
                                let contact = [];
                                result.forEach(res => { 
                                if(validator.isMobilePhone(res.phone)) contact.push(res.phone)
                                })
                                //let contact = result.map(res =>(res.phone))
                                addAlert('Success', `Got ${contact.length} phone numbers`, true, false)
                                this.setState({ smsList: contact, smsSendingMethod: 'imported contact', smsCount: contact.length })
                            } else {
                                let contact = [];
                                result.forEach(res => { 
                                if(validator.isEmail(res.email)) contact.push(res.email)
                                })
                                //let contact = result.map(res =>(res.email))
                                addAlert('Success', `Got ${contact.length} email list`, true, false)
                                this.setState({ emailList: contact, emailSendingMethod: 'imported contact', emailCount: contact.length  })
                            }  
                        })
                        .catch(err => {
                            addAlert('Error', 'Error converting csv file', false, false)
                        })
                    };
                    reader.onerror = (evt) => {
                        if(evt.target.error.name === "NotReadableError") {
                            addAlert('Error', "Canno't read file !", false, false)
                        }
                    }
                } else {
                    addAlert('Warning', 'The file seleceted is not a csv file-type. Checkout out some information about csv files with the link above the import button', false, false)
                }
            } else {
                addAlert('Error', 'FileReader are not supported in this browser', false, false)
            }

        }
    }

    show = () => this.setState({ open: true })

    handleConfirm = () => this.setState({ open: false }, () => {
        const { bulkMethod } = this.state;

        if(bulkMethod === 'email') {
            // document.getElementById('uploademailComsCSV').click()
            this.emailListImport.click()
        } else {
           // document.getElementById('uploadsmsComsCSV').click()
           this.smsListImport.click()
        }
    })

    handleCancel = () => this.setState({ open: false })

    useRegiteredUser = () => {
        const { bulkMethod } = this.state;
        const { eventId, addAlert } = this.props;

        if (bulkMethod === 'sms') {
            addAlert('Info', `Making request to get your registered users list`, true, false)
            getSmsRegisterCount(eventId)
            .then(res => {
                if (res.data.error) {
                    addAlert('Error', res.data.error , false, false)
                } else {
                    this.setState({ smsSendingMethod: 'registered event-goers',  smsCount: res.data.count })
                    addAlert('Success', `Got ${res.data.count} sms list`, true, false)
                }

            })
            .catch(() => {
                addAlert('Error', 'Problem getting your registered sms list', false, false)
            })
        } else {
            addAlert('Info', `Making request to get your registered users list`, true, false)
            getEmailRegisterCount(eventId)
            .then(res => {
                if (res.data.error) {
                    addAlert('Error', res.data.error , false, false)
                } else {
                    this.setState({ emailSendingMethod: 'registered event-goers', emailCount: res.data.count  })
                    addAlert('Success', `Got ${res.data.count} email list`, true, false)
                }

            })
            .catch(() => {
                addAlert('Error', 'Problem getting your registered email list', false, false)
            })
        }
    }

    validateMessage = () => {
        const { bulkMethod, smsLetter,  emailSubject, invitationLetter, smsSendingMethod, emailSendingMethod, emailCount, smsCount } = this.state;
        const { addAlert, countryDetails } = this.props;

        if (bulkMethod === 'sms') {
            if (!smsLetter) {
                addAlert('Warning', 'Add SMS message...', false, false)
            } else if (!smsSendingMethod) {
                addAlert('Warning', 'Add contacts you want to send your message to', false, false)
            } else if (smsCount <= 0) {
                addAlert('Warning', 'You cannot send sms to ZERO contact list', false, false)
            } else {
                const count = splitter.split(smsLetter).parts.length;
                this.setState({
                    loadingSms: true,
                    paymentDetails: {   
                        ...this.state.paymentDetails,
                        amount: smsCount*countryDetails.costPerSms*count,
                        bulkMethod: 'sms'
                    }
                }, () => {
                    this.handleOpenPayment()
                })  
            }
        } else {
            //EMAIL
            let emailMsg = invitationLetter;
            if (!emailSubject) {
                addAlert('Warning', 'Add email subject to send message', false, false)
            } else if (!emailMsg) {
                addAlert('Warning', 'Add email body to send message', false, false)
            } else if (!emailSendingMethod) {
                addAlert('Warning', 'Add contacts you want to send your message to', false, false)
            } else if (emailCount === 0) {
                addAlert('Warning', 'You cannot send email to ZERO contact list', false, false)
            } else {
                this.setState({
                    paymentDetails: {
                        ...this.state.paymentDetails,
                        amount: emailCount*countryDetails.costPerEmail,
                        bulkMethod: 'email'
                    }
                }, () => {
                    this.handleOpenPayment()
                })    
            }
        }
    }

    handlePayment = res => {
        const { paymentDetails } = this.state;

        this.setState({ paymentDetails: {...paymentDetails, response: res }}, () => {
            this.handleClosePayment()
            if ( paymentDetails.bulkMethod === 'email') {
                this.sendEmailMessage()
            } else (
                this.sendSmsMessage()
            )
        })
    }

    handleOpenPayment = () => this.setState({ paymentOpen: true })

    handleClosePayment = () => this.setState({ paymentOpen: false })

    sendSmsMessage = () => {
        const { addAlert, registeredSms, bulkSms, eventId } = this.props;
        const {  smsLetter, smsSendingMethod, smsList, paymentDetails   } = this.state;

        if (smsSendingMethod === 'imported contact') {
            this.setState({ loadingSms: false }, () => {
                addAlert('Info', `Sending sms message to ${smsSendingMethod}`, true, false)
                bulkSms(smsLetter, paymentDetails, smsList)
            })

        } else {
            // send to register
            this.setState({ loadingSms: false }, () => {
                addAlert('Info', `Sending sms message to ${smsSendingMethod}`, true, false)
                registeredSms(smsLetter, paymentDetails, eventId)
            })
        }
    }

    sendEmailMessage = () => {
        const { addAlert, registeredEmail, bulkEmail, eventId } = this.props;
        const { emailSendingMethod, emailList, paymentDetails, emailSubject,  invitationLetter  } = this.state;
 
        
        if (emailSendingMethod === 'imported contact') {
            this.setState({ loadingEmail: false }, () => {
                addAlert('Info', `Sending email message to ${emailSendingMethod}`, true, false)
                bulkEmail(emailSubject , invitationLetter, paymentDetails, emailList)
            })

        } else {
            // send to register
            this.setState({ loadingEmail: false }, () => {
                addAlert('Info', `Sending email message to ${emailSendingMethod}`, true, false)
                registeredEmail(emailSubject , invitationLetter, paymentDetails, eventId)
            })

        }

    }

    getCountryDetails = () => {
        const { addAlert, fetchCountryDetails, location } = this.props;

        addAlert('Info', `Sending request to get cost of services and other details`, true, false)

        fetchCountryDetails(location.country)


    }

    handleChange = (e, { value }) => this.setState({ EditorType: value })

    render() {

    const { loadingEmail, bulkMethod, link,  invitationLetter, customizeDesign, emailSubject, emailCount, smsCount,
        emailTemplateText, textEditorText, smsSendingMethod, emailSendingMethod, smsLetter,  EditorType, templateEditorText, templateEditorIndex, open } = this.state;


   const { tag, poster, addAlert, currency, countryDetails, eventId, userId, fetchingCountryDetails } = this.props;

    return (
            <div>
                <Confirm
                    open={this.state.open}
                    content={`Make sure the file type is csv and ${bulkMethod === 'sms'? 'phone number column must be named phone' : 'email column must be named email'}. To learn about csv files, click the "i" icon on top of the import button.`}
                    onCancel={this.handleCancel}
                    onConfirm={this.handleConfirm}
                    cancelButton='Never mind'
                    confirmButton="GET CSV FILE"
                />

                {/* //PAYMENT FORM */}
                <Modal
                    // trigger={<Button onClick={this.handleOpenPayment}>Show Modal</Button>}
                    open={this.state.paymentOpen}
                    // onClose={this.handleClosePayment}
                    basic
                    size='small'
                >
                    <Header inverted icon="money" content='Make Payment' />
                    <Modal.Content>
                        <PayStack 
                        cancelPayment={() => this.setState({ loadingEmail: false, loadingSms: false }, () => this.handleClosePayment())}
                        gotPayment={(res) => this.handlePayment(res)} 
                        info={[
                            {
                                display_name: "Event Id",
                                variable_name: "event_id",
                                value: eventId
                            }
                            ,
                            {
                                display_name: "User Id",
                                variable_name: "user_id",
                                value: userId
                            },
                            {
                            display_name: "Description",
                            variable_name: "description",
                            value: `"Keep in touch" message using ${bulkMethod}`
                        }]}
                        paymentDetails={this.state.paymentDetails}/> 
                    </Modal.Content>
                    <Modal.Actions>
                    {/* <Button color='green' onClick={this.handleClosePayment} inverted>
                        <Icon name='checkmark' /> Close
                    </Button> */}
                    </Modal.Actions>
                </Modal>
                <Message>
                    <Message.Header>Update, Reminder and Appreciation</Message.Header>
                    <Message.Content>
                    Communicate with your event-goer via sms or email to keep them updated on new changes or development in your event. Also, remind them about your event because some of them migth have forgot about your event. Remind them why they do not what to miss it. Get them excited!! Do not forget to send them a "thank you" message after the event.
                    </Message.Content>
                </Message>

                {(Object.keys(countryDetails).length === 0) && (
                    <div style={style.center}>
                        <Button color="pink" size='large' disabled={fetchingCountryDetails} onClick={this.getCountryDetails}>{(fetchingCountryDetails)? <Icon name="spinner" loading/> : "Get cost details"}</Button>
                    </div>
                )}

                {(Object.keys(countryDetails).length > 0) && (<div>
                    <Card.Group itemsPerRow='2'>
                        <Card color={bulkMethod === 'email'? 'pink': 'black'}>
                            <div style={style.center}>
                                <Icon onClick={() => this.setState({ bulkMethod: 'email'})} color={bulkMethod === 'email'? 'pink': 'black'} name='mail' size='huge'/>
                            </div>
                            <Card.Content>
                                <Card.Header as='a' onClick={() => this.setState({ bulkMethod: 'email'})} textAlign='center'>E-mail</Card.Header>
                            </Card.Content>
                        </Card>
            
                        <Card color={bulkMethod === 'sms'? 'pink': 'black'}>
                            <div style={style.center}>
                                <Icon onClick={() => this.setState({ bulkMethod: 'sms'})} color={bulkMethod === 'sms'? 'pink': 'black'} name='call' size='huge'/>
                            </div>
                            <Card.Content>
                                <Card.Header as='a' onClick={() => this.setState({ bulkMethod: 'sms'})} textAlign='center'>SMS</Card.Header>
                            </Card.Content>
                        </Card>
                    </Card.Group>
                    <br />
                    {(bulkMethod === 'email') && (
                    <Form loading={loadingEmail}>
                        <h4>Email Subject</h4>
                        <Form.Input name='title' placeholder={'Add email subject'} defaultValue={emailSubject} onChange={(e, d) => this.setState({ emailSubject: d.value })} />
                    
                        <h4>Email To</h4>
                        <Form.Group widths='equal'>
                            <Form.Field>
                                <label style={{ display: 'flex', flexDirection: 'row'}}>Import email list <CsvFormat /></label>
                                <div>
                                    {(!open) && (<div style={{ height:'0px', overflow: 'hidden' }}>
                                        <input ref={x => this.emailListImport = x} key={'emailupload'} color='black' id='uploademailComsCSV' type='file' accept='.csv' onChange={(e) => this.onUpload(e)} placeholder={'add email list'}/>
                                    </div>)}
                                    <Button color='black' onClick={() => this.show()} fluid>
                                        Import email list {(emailSendingMethod === 'imported contact') && (<Icon name='checkmark' color='pink'/>)}
                                        
                                    </Button>
                                    <small style={{ color: 'red', fontSize: '14px'}}>csv email column must be named email</small>
                                </div>
                            </Form.Field>

                            <Form.Field>
                                <label>{bulkMethod} registered event-goers</label>
                                <Button color='black' onClick={() => this.useRegiteredUser()} fluid>
                                    Use registered event-goers {(emailSendingMethod === 'registered event-goers') && (<Icon name='checkmark' color='pink'/>)}
                                </Button>
                            </Form.Field>
                        </Form.Group>
                       
                        <Form.Field>
                            <h4>Email Body</h4>
                        
                        </Form.Field>

                        <Form.Group inline>
                            <label>Select a method of creating email body</label>
                            <Form.Field
                                control={Radio}
                                label='Drag & Drop Editor (Not suitable for devices with small screen size)'
                                value='EmailEditor'
                                checked={EditorType === 'EmailEditor'}
                                onChange={this.handleChange}
                            />
                            <Form.Field
                                control={Radio}
                                label='PrepVENT Template Editor'
                                value='TemplateEditor'
                                checked={EditorType === 'TemplateEditor'}
                                onChange={this.handleChange}
                            />
                            <Form.Field
                                control={Radio}
                                label='Text Editor (Uses text and html)'
                                value='TextEditor'
                                checked={EditorType === 'TextEditor'}
                                onChange={this.handleChange}
                            />
                        </Form.Group>

                            
                        {(EditorType === 'EmailEditor') && (
                        <EmailEditor 
                            key={'EmailEditor'}
                            link={link} 
                            poster={poster} 
                            tag={tag} 
                            // letter={invitationLetter} 
                            unsubcribe={''}
                            emailTemplateText={emailTemplateText}
                            design={customizeDesign}
                            addHTML={(html, design) => this.setState({ emailTemplateText: html, customizeDesign: design, invitationLetter: html })}
                            closeEditor={() => this.setState({ EditorType: 'EmailEditor' })}
                            addAlert={(h, m, s, p) => addAlert(h, m, s, p)}
                        />)}
                        {(EditorType === 'TemplateEditor') && (
                        <TemplateEditor 
                            key={'TemplateEditor'}
                            link={link} 
                            poster={poster} 
                            tag={tag} 
                            unsubcribe={''}
                            templateEditorText={templateEditorText}
                            templateEditorIndex={templateEditorIndex}
                            addHTML={(html, letter, index) => this.setState({ invitationLetter: html, templateEditorText: letter, templateEditorIndex: index})}
                            closeEditor={() => this.setState({ EditorType: 'TemplateEditor' })}
                            addAlert={(h, m, s, p) => addAlert(h, m, s, p)}
                        />)}


                        {(EditorType === 'TextEditor') && (
                        <TextEditor 
                            key={'TextEditor'}
                            link={link} 
                            poster={poster} 
                            tag={tag} 
                            //letter={invitationLetter} 
                            unsubcribe={''}
                            textEditorText={textEditorText}
                        // addTextEditorText={(text) => this.setState({ textEditorText: text })}
                            addHTML={(html) => this.setState({ invitationLetter: html, textEditorText: html })}
                            closeEditor={() => this.setState({ EditorType: 'TextEditor' })}
                            addAlert={(h, m, s, p) => addAlert(h, m, s, p)}
                        />)}
                            
                            
                        <Segment>
                            {parse(
                                `${invitationLetter}`
                            )}
                        </Segment>

                        
                        {(!!emailSendingMethod) && (<div style={style.center}>
                        <Statistic>
                            <Statistic.Label>Cost per Email: {countryDetails.costPerEmail} {currency.abbr.toLocaleUpperCase()}</Statistic.Label>
                            <Statistic.Label>Contact Count: {emailCount}</Statistic.Label>
                            <Statistic.Value>{(emailCount*countryDetails.costPerEmail).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currency.abbr.toLocaleUpperCase()}</Statistic.Value>  
                        </Statistic>
                        </div>)}
                        <Divider />


                        <div style={style.center}>
                        <Button color={'pink'} onClick={() => this.validateMessage()}>
                            Send email to {emailSendingMethod}
                        </Button>
                        </div>
                    </Form>
                    )}


                    {(bulkMethod === 'sms') && (
                    <Form loading={loadingEmail}>
                        <h4>SMS To</h4>
                        <Form.Group widths='equal'>
                            <Form.Field>
                                <label style={{ display: 'flex', flexDirection: 'row'}}>Import sms list <CsvFormat /></label>

                                {(!open) && (<div style={{ height:'0px', overflow: 'hidden' }}>
                                    <input ref={(x) => this.smsListImport = x} key={'smsupload'} color='black' id='uploadsmsComsCSV' type='file' accept='.csv' onChange={(e) => this.onUpload(e)} placeholder={'add email list'}/>
                                </div>)}
                                <Button color='black' onClick={() => this.show()} fluid>
                                    Import sms list {(smsSendingMethod === 'imported contact') && (<Icon name='checkmark' color='pink'/>)}
                                </Button>
                                <small style={{ color: 'red', fontSize: '14px'}}>csv phone number column must be named phone</small>
                            </Form.Field>

                            <Form.Field>
                                <label>{bulkMethod} registered event-goers</label>
                                <Button color='black' onClick={() => this.useRegiteredUser()} fluid>
                                    Use registered event-goers {(smsSendingMethod === 'registered event-goers') && (<Icon name='checkmark' color='pink'/>)}
                                </Button>
                            </Form.Field>
                        </Form.Group>
                        <Form.Field>
                            <h4>SMS Body</h4>
                            <textarea defaultValue={smsLetter} placeholder='Remind event goers via SMS' onChange={(e) => this.setState({ smsLetter: e.target.value })} />
                            <br />
                            <br />
                            <Card.Group doubling itemsPerRow={2} stackable>
                                <Resources link={link} poster={poster} letter={smsLetter} tag={tag}/>
                                <SmsCount sms={smsLetter} />
                            </Card.Group>
                        </Form.Field>

                            
                        {(!!smsSendingMethod) && (<div style={style.center}>
                        <Statistic>
                            <Statistic.Label>Cost per SMS: {countryDetails.costPerSms} {currency.abbr.toLocaleUpperCase()}</Statistic.Label>
                            <Statistic.Label>SMS PARTS: {splitter.split(smsLetter).parts.length}</Statistic.Label>
                            <Statistic.Label>Contact Count: {smsCount}</Statistic.Label>
                            <Statistic.Value>{(smsCount*countryDetails.costPerSms*(splitter.split(smsLetter).parts.length)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currency.abbr.toLocaleUpperCase()}</Statistic.Value>
                        </Statistic>
                        </div>)}
                        <Divider />




                        <div style={style.center}>
                        <Button color={'pink'} onClick={() => this.validateMessage()}>
                            Send SMS to {smsSendingMethod}
                        </Button>
                        </div>
                    </Form>
                    )}

                </div>)}  
            </div>
        )
    }
}
