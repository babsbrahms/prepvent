import React, { Component } from 'react';
import { Segment, Card, Divider, Button, Icon, Header, Form, Input, Tab, TextArea, Modal, Image, Radio, Confirm, Statistic, Message } from 'semantic-ui-react';
import parse from 'html-react-parser';
import * as csv from "csvtojson";
import validator from 'validator';
import SmsCount from '../Views/SmsCount';
import Resources from '../Views/Resources';
import splitter from 'split-sms';
import style from '../Style/Style';
import SocialShare from '../Views/SocialShare';
import CsvFormat from '../Views/CsvFormat';
import { getOrganizerfollowersEmailCount, getOrganizerfollowersSmsCount } from '../../actions/event';
import PayStack from '../Views/PayStack';
import EmailEditor from '../Editor/EmailEditor';
import TemplateEditor from '../Editor/InviteTemplateEditor';
import TextEditor from '../Editor/TextEditor'


export default class Share extends Component {
    constructor(props) {
        super(props);

        this.state = {
            link: `${props.hostname}/e/${props.eventId}`,
            linkText: 'Click here to copy link',
            unsubcribeLink: `${props.hostname}/unsubscribe/o/${props.userId}`,
            bulkMethod: '',
            invitationLetter: "",
            socialLetter: '',
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
            emailSubject: `You are invited to our ${(props.name).toLowerCase()}`,
            paymentDetails: {
                email: props.email,
                amount: 0,
                currency: props.currency,
                response: null,
            },
            emailCount: 0, // how many contact to send msg to
            smsCount: 0,
            emailSendingMethod: '', // 'imported contact' or 'followers list'
            smsSendingMethod: '', // 'imported contact' or 'followers list'
            EditorType: '', 
            loadingSms: false,
            loadingEmail: false
        }

        this.emailListImport = React.createRef()
        this.smsListImport = React.createRef()
    }

    copyLink = async () => {
        const { link } = this.state;
        await navigator.clipboard.writeText(link);
        await this.setState({ linkText: 'copied!'})
    }

    onUpload = e => {
        const { addAlert } = this.props;
        const { bulkMethod } = this.state;

        e.preventDefault()
        
        if (e.target.files.length > 0) {
        // // Check for the various File API support.
        //     console.log('file length > 0');
            
            if (window.FileReader) {
                // console.log('has file reader');
                if (e.target.files[0].type === "text/csv") {
                    // console.log('content type is csv');
                    
                    // FileReader are supported.;
                    var reader = new FileReader();
                    // Read file into memory as UTF-8      
                    reader.readAsText(e.target.files[0]);
                    // Handle file load
                    reader.onload = (event) => {
                        // console.log(event);
                        
                        var csvString = event.target.result;
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
                                
                                this.setState({ smsList: contact, smsSendingMethod: 'imported contact', smsCount: contact.length }, () => {
                                    addAlert('Success', `Got ${contact.length} phone numbers`, true, false)
                                })
                                
                            } else {
                                let contact = [];
                                result.forEach(res => { 
                                    if(validator.isEmail(res.email)) contact.push(res.email)
                                })
                                
                                this.setState({ emailList: contact, emailSendingMethod: 'imported contact', emailCount: contact.length }, () => {
                                    addAlert('Success', `Got ${contact.length} emails`, true, false)
                                })
                                
                            }     
                        })
                        .catch(err => {
                            addAlert('Error', 'Error converting csv file', false, false)
                        })
                    };

                    //HANDLE FILE ERROR
                    reader.onerror = (evt) => {
                        if(evt.target.error.name === "NotReadableError") {
                            addAlert('Error', "Canno't read file !", false, false)
                        }
                    }
                } else {
                    addAlert('Warning', 'The file seleceted is not a csv file-type. Checkout out some information about csv files with the link above the import button', false, true)
                }
            } else {
                addAlert('Error', 'FileReader are not supported in this browser', false, false)
            }
        }
    }

    show = () => this.setState({ open: true })
    handleConfirm = () => this.setState({ open: false }, () => {
        const { bulkMethod} = this.state;
        if (bulkMethod === 'email') {
           // document.getElementById('uploademailShareCSV').click()
            this.emailListImport.click()
            
        } else {
            //document.getElementById('uploadsmsShareCSV').click()
            this.smsListImport.click()
        }
    })
    handleCancel = () => this.setState({ open: false })


    useFollowerUser = () => {
        const { bulkMethod } = this.state;
        const { userId, addAlert } = this.props;

        if (bulkMethod === 'sms') {
            addAlert('Info', `Making request to get your follower's list`, true, false)
            getOrganizerfollowersSmsCount(userId)
            .then(res => {
                if (res.data.error) {
                    addAlert('Error', res.data.error , false, false)
                } else {
                    this.setState({ smsSendingMethod: 'followers list', smsCount: res.data.count  })
                    addAlert('Success', `Got ${res.data.count} sms list`, true, false)
                }

            })
            .catch(() => {
                addAlert('Error', 'Problem getting your registered sms list', false, false)
            })
        } else {
            addAlert('Info', `Making request to get your follower's list`, true, false)
            getOrganizerfollowersEmailCount(userId)
            .then(res => {
                if (res.data.error) {
                    addAlert('Error', res.data.error , false, false)
                } else {
                    this.setState({ emailSendingMethod: 'followers list', emailCount: res.data.count  })
                    addAlert('Success', `Got ${res.data.count} email list`, true, false)
                }

            })
            .catch(() => {
                addAlert('Error', 'Problem getting your registered email list', false, false)
            })
        }
    }


    validateMessage = () => {
        const { bulkMethod, smsCount, emailCount, invitationLetter, smsLetter, emailSubject, unsubcribeLink, emailSendingMethod, smsSendingMethod } = this.state;
        const { addAlert, countryDetails } = this.props;
        
            if (bulkMethod === 'sms') {
                //SMS
                if (!smsLetter) {
                    addAlert('Warning', 'Add SMS message...', false, false)
                } else if (!smsSendingMethod) {
                    addAlert('Warning', 'Add contacts you want to send your message to', false, false)
                } else if (smsCount === 0) {
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
                } else if (emailCount <= 0) {
                    addAlert('Warning', 'You cannot send email to ZERO contact list', false, false)
                } else {
                    if ((emailSendingMethod === 'followers list') && !emailMsg.includes(unsubcribeLink)) {           
                        addAlert('Warning', 'Email sent with your followers list are required to have unsubscribe link in their message body.', false, true)
                    } else if ((emailSendingMethod === 'imported contact') && emailMsg.includes(unsubcribeLink) ) {          
                        addAlert('Warning', `You don't need to have unsubscribe link in your message body for email you are sending imported email`, false, true)
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
        const {  bulkSms, followerSms, addAlert, userId } = this.props;
        const {  smsLetter, smsSendingMethod, smsList, paymentDetails  } = this.state;
    
        //don't forget to add link to sms
        if (smsSendingMethod === 'imported contact') {
            this.setState({ loadingSms: false }, () => {
                addAlert('Info', `Sending sms message to ${smsSendingMethod}`, true, false)
                bulkSms(smsLetter, paymentDetails, smsList)
            })

        } else {
            // send to register
            this.setState({ loadingSms: false }, () => {
                addAlert('Info', `Sending sms message to ${smsSendingMethod}`, true, false)
                followerSms(smsLetter, paymentDetails, userId)
            })
        }
    }

    sendEmailMessage = () => {
        const { emailSendingMethod, emailList, invitationLetter, paymentDetails, emailSubject } = this.state;
        const {  addAlert, bulkEmail, followerEmail, userId} = this.props;

        
       // don't forget to add emailTemplate for PrepVENT TEMPMATE
        if (emailSendingMethod === 'imported contact') {
            this.setState({ loadingEmail: false }, () => {
                addAlert('Info', `Sending email message to ${emailSendingMethod}`, true, false)
                bulkEmail( emailSubject, invitationLetter, paymentDetails, emailList)
            })
        } else {
            // send to register
            this.setState({ loadingEmail: false }, () => {
                addAlert('Info', `Sending email message to ${emailSendingMethod}`, true, false)
                followerEmail(emailSubject ,invitationLetter, paymentDetails,userId)
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
        const { loadingEmail, loadingSms, bulkMethod, link,  invitationLetter, customizeDesign, emailSubject, unsubcribeLink, emailCount, smsCount, open,
             emailTemplateText, textEditorText, smsSendingMethod, emailSendingMethod, smsLetter,  EditorType, templateEditorText, linkText, socialLetter, templateEditorIndex } = this.state;


        const { tag, organizer, organizerName, name, poster, location, time, hostname, addAlert, currency, countryDetails, eventId, userId, fetchingCountryDetails } = this.props;

        const panes = [
            { menuItem: 'Bulk Invitation', render: () => <Tab.Pane>
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

                <Divider />

                {(bulkMethod === 'email') && (
                    <Form loading={loadingEmail}>
                        <Form.Field>
                            <h4>Email Subject</h4> 
                            <Form.Input name='title' placeholder={'Add email subject'} defaultValue={emailSubject} onChange={(e, d) => this.setState({ emailSubject: d.value })} />
                        </Form.Field>

                            <h4>Email To</h4> 
                        <Form.Group widths='equal'>
                            <Form.Field>
                                <label style={{ display: 'flex', flexDirection: 'row'}}>Import email list <CsvFormat /></label>

                                {(!open) && (<div style={{ height:'0px', overflow: 'hidden' }}>
                                    <input ref={x=> this.emailListImport = x} key={'emailupload'} color='black' type='file' id='uploademailShareCSV' accept='.csv' onChange={(e) => this.onUpload(e)} placeholder={'add email list'}/>
                                </div>)}
                                <Button color='black' onClick={() => this.show()} fluid>
                                    Import email list {(emailSendingMethod === 'imported contact') && (<Icon name='checkmark' color='pink'/>)}
                                </Button>
                                <small style={{ color: 'red', fontSize: '14px'}}>csv email column must be named email</small>
                            </Form.Field>

                            
                            <Form.Field>
                                <label>Use follower's email list</label>
                                <Button color='black' onClick={() => this.useFollowerUser()} fluid>
                                    Use your follower's list {(emailSendingMethod === 'followers list')  && (<Icon name='checkmark' color='pink'/>)}
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
                            unsubcribe={unsubcribeLink}
                            emailTemplateText={emailTemplateText}
                            design={customizeDesign}
                            addHTML={(html, design) => this.setState({ emailTemplateText: html, customizeDesign: design, invitationLetter: html })}
                            closeEditor={() => this.setState({ EditorType: 'EmailEditor' })}
                            addAlert={(h, m, s, p) => addAlert(h, m, s, p)}
                        />)}

                        {(EditorType === 'TemplateEditor') && (
                        <TemplateEditor 
                            key={'TemplateEditor'}
                            name={name}
                            hostname={hostname}
                            time={time}
                            location={location}
                            organizer={organizer} 
                            organizerName={organizerName}
                            sendingMethod={emailSendingMethod} 
                            //unsubcribeLink={unsubcribeLink}
                            link={link} 
                            poster={poster} 
                            tag={tag} 
                            //letter={invitationLetter} 
                            unsubcribe={unsubcribeLink}
                            templateEditorText={templateEditorText}
                            templateEditorIndex={templateEditorIndex}
                            addHTML={(html, letter, index) => this.setState({ invitationLetter: html, templateEditorText: letter, templateEditorIndex: index })}
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
                            unsubcribe={unsubcribeLink}
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

                    </Form>)}  


                    {(bulkMethod === 'sms') && (
                    <Form loading={loadingSms}>
                        <h4>SMS To</h4> 
                        <Form.Group widths='equal'>
                            <Form.Field>
                                <label style={{ display: 'flex', flexDirection: 'row'}}>Import sms list <CsvFormat /></label>

                                {(!open) && (<div style={{ height:'0px', overflow: 'hidden' }}>
                                    <input ref={x => this.smsListImport = x} key={'smsupload'} color='black' type='file' id='uploadsmsShareCSV' accept='.csv' onChange={(e) => this.onUpload(e)} placeholder={'add email list'}/>
                                </div>)}
                                <Button color='black' onClick={() => this.show()} fluid>
                                    Import sms list {(smsSendingMethod === 'imported contact') && (<Icon name='checkmark' color='pink'/>)}
                                </Button>
                                <small style={{ color: 'red', fontSize: '14px'}}>csv phone number column must be named phone</small>
                            
                            </Form.Field>

                            
                            <Form.Field>
                                <label>Use follower's sms list</label>
                                <Button color='black' onClick={() => this.useFollowerUser()} fluid>
                                    Use your follower's list {(smsSendingMethod === 'followers list') && (<Icon name='checkmark' color='pink'/>)}
                                </Button>
                            </Form.Field>
                        </Form.Group>

                        <Form.Field>   
                            <h4>SMS Body</h4>                
                            <TextArea value={smsLetter} placeholder={'Write your sms message'} onChange={(e, dt) => this.setState({ smsLetter: dt.value })}/> 
                            <br />
                            <br />
                            <Card.Group doubling itemsPerRow={2} stackable>
                                <Resources link={link} poster={poster} letter={smsLetter} tag={tag}/>
                                <SmsCount sms={smsLetter} />
                            </Card.Group>
                        </Form.Field>

                        <Divider />

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
                    </Form>)}                                   
                
            </Tab.Pane> },
            { menuItem: 'Social Media', render: () => <Tab.Pane>
                <div>
                <Card.Group doubling itemsPerRow={2} stackable>
                    <Card raised>
                        <Image src={poster} wrapped ui={false} />
                        <Card.Content> 
                                                   
                            <Form>
                                <Form.Field>                 
                                    <TextArea value={socialLetter} placeholder={'Write your social message'} onChange={(e, da) => this.setState({ socialLetter: da.value })}/> 
                                </Form.Field>
                            </Form>
                            <Card.Description>
                                ticket available at: {link}
                            </Card.Description>
                            <Card.Description>
                                {!!tag?`#${tag}`: ''}
                            </Card.Description>
                        </Card.Content>

                    </Card>
                </Card.Group>

                    <SocialShare title={name} image={poster} tag={tag} description={socialLetter} url={link} size={'large'}/>

                </div>
            </Tab.Pane> },
            { menuItem: 'Link', render: () => <Tab.Pane>
                {/* <Button color='pink' fluid onClick={() => this.copyLink()}>
                    {linkText}
                </Button>    */}
                <Input
                    action={{
                    color: 'pink',
                    labelPosition: 'right',
                    icon: 'copy',
                    content: `${linkText}`,
                    onClick: () => this.copyLink()
                    }}
                    
                    
                    value={link}
                />                  
            </Tab.Pane> },
        ]
        return (
            <div>
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
                            value: `Share Invitation using ${bulkMethod}`
                        }]}
                        paymentDetails={this.state.paymentDetails}/> 
                    </Modal.Content>
                    <Modal.Actions>
                    {/* <Button color='green' onClick={this.handleClosePayment} inverted>
                        <Icon name='checkmark' /> Close
                    </Button> */}
                    </Modal.Actions>
                </Modal>
                <Confirm
                    open={this.state.open}
                    content={`Make sure the file type is csv and ${bulkMethod === 'sms'? 'phone number column must be named phone' : 'email column must be named email'}. To learn about csv files, click the "i" icon on top of the import button.`}
                    onCancel={this.handleCancel}
                    onConfirm={this.handleConfirm}
                    cancelButton='Never mind'
                    confirmButton="GET CSV FILE"
                />
                <Message>
                    {/* <Message.Header>Update, Reminder and Appreciation</Message.Header> */}
                    <Message.Content>
                        Share your events with your family, friends, colleagues and event followers via bulk invitation (email and sms), social media pages (Facebook, Twitter, Instagram e.t.c) and event link. To promote your event with our audience, check out the promotion tab to see the available options
                    </Message.Content>
                </Message>
                <br />
                {(Object.keys(countryDetails).length === 0) && (
                    <div style={style.center}>
                        <Button color="pink" size='large' disabled={fetchingCountryDetails} onClick={this.getCountryDetails}>{(fetchingCountryDetails)? <Icon name="spinner" loading/> : "Get cost details"}</Button>
                    </div>
                )}
                    
                {(Object.keys(countryDetails).length > 0) &&<Tab panes={panes} />}        
            </div>
        )
    }
}
