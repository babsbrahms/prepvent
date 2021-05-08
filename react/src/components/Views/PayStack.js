import React, { Component } from 'react';
import { Button, Segment, Icon, Confirm, Card } from 'semantic-ui-react';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import PaystackButton from 'react-paystack';
import style from '../Style/Style';
import Countdown from './Coutdown'


export default class PayStack extends Component {
    constructor(props) {
        super(props);
        this.state ={
            validationError: '',
            open: false,
            key: process.env.REACT_APP_PAYSTACK_KEY, //PAYSTACK PUBLIC KEY
            email: props.paymentDetails.email,  // customer email
            amount: props.paymentDetails.amount * 100, //in kobo,
            timer: props.paymentDetails.timer,
        }
    }

    callback = (response) => {
        const { gotPayment } = this.props;
        console.log(response); // card charged successfully, get reference here

        let finalData = {
            ...response,
            timestamp: moment.utc().valueOf()
        }
        gotPayment(finalData)
    }

    close = () => {
        const { cancelPayment } = this.props;
        cancelPayment()
    }

    getReference = () => {
        //you can put any unique reference implementation code here
        let text = `PAYSTACK-${uuidv4()}`;
    // let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.=";

    //     for( let i=0; i < 15; i++ )
    //         text += possible.charAt(Math.floor(Math.random() * possible.length));
        
        return text;
    }

    show = () => this.setState({ open: true })
    handleConfirm = () => this.setState({ open: false }, () => {
        const { cancelPayment } = this.props;
        cancelPayment()
    })
    handleCancel = () => this.setState({ open: false })

    render() {
        const { timer } = this.state;
        const { paymentDetails, info } = this.props;

        return (
        <Segment inverted>
            <Confirm
                open={this.state.open}
                content='Are you sure you want to cancel payment?'
                onCancel={this.handleCancel}
                onConfirm={this.handleConfirm}
                cancelButton='Never mind'
                confirmButton="Yes"
            />

            <div style={style.alignedRight}>
                <Icon size='large' name="cc mastercard"/> <Icon size='large' name="cc visa"/> <span style={{ fontSize: 18}}>Verve</span>
            </div>
            <h3 style={{ color: 'white', marginTop: '3px'}}> Payment form will close in: <Countdown timer={timer} cancelPayment={() => this.close()}/></h3>
            <PaystackButton
                text="Make Payment"
                className="payButton"
                callback={this.callback}
                close={this.close}
                disabled={true} //{/*disable payment button*/}
                embed={true} //{/*payment embed in your app instead of a pop up*/}
                reference={this.getReference()}
                email={this.state.email}
                amount={this.state.amount}
                paystackkey={this.state.key}
                currency={paymentDetails.currency.abbr}
                tag="button" //{/*it can be button or a or input tag */}
                metadata= {{
                    custom_fields: info
                 }}
              />

            <div style={style.alignedRight}>
                <Button color='red' inverted onClick={() => this.show()}>Cancel</Button>
            </div>

            <Card>
                <Card.Content>
                    <Card.Header>
                        Card No: 4084084084084081
                    </Card.Header>
                    <Card.Description>
                        EXPIRY: 05/22
                    </Card.Description>
                    <Card.Meta>
                        CVV: 408
                    </Card.Meta>
                </Card.Content>
            </Card>
        </Segment>
        )
    }
}



// export default class PayStack extends Component {
//         state ={
//             data: {
//                 card_name: '',
//                 card_number: 0,
//                 year: 0,
//                 month: 0,
//                 cvv: '',
//                 expireDate: '',
//                 save: false
//             },
//             validationError: '',
//             open: false,
//         }
    


//     componentDidMount() {
//         const { paymentDetails } = this.props;
//         if (paymentDetails.response !== null) {
//             let data = {
//                 ...paymentDetails.response,
//                 cvv: ''
//             }
//             this.setState({ data })
//         }
//     }

//    onChange = (e, d) => this.setState({ data: { ...this.state.data, [d.name]: d.value } })

//     submit = () => {
//         const {data} = this.state;
//         const { gotPayment } = this.props;
//         this.setState({ validationError: '' }, () => {
//             const error = this.validate(data);        
        
//             if (error)  {
//                 this.setState({ validationError: error })
//             } else {
//                 let finalData = {
//                     ...data,
//                     timestamp: Date.now()
//                 }
//                 gotPayment(finalData)
//             }
//         })        
//     }

//     validate = (data) => {
//         let error = ''
//         if (!data.card_name || !data.card_number || !data.year || !data.month || !data.expireDate || !data.cvv) {
//             error = 'Complete the payment form'
//         } else if (data.cvv.length < 3) {
//             error ='CVV must be 3 characters'
//         }

//         return error
//     }

//     callback = (response) => {
//         const { data } = this.state;
//         console.log(response); // card charged successfully, get reference here

//         let finalData = {
//             data,
//             timestamp: Date.now()
//         }
//         gotPayment(finalData)
//     }

//     close = () => {
//         const { cancelPayment } = this.props;
//         cancelPayment()
//     }

//     getReference = () => {
//         //you can put any unique reference implementation code here
//         let text = "";
//     let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.=";

//         for( let i=0; i < 15; i++ )
//             text += possible.charAt(Math.floor(Math.random() * possible.length));
        
//         return text;
//     }

//     show = () => this.setState({ open: true })
//     handleConfirm = () => this.setState({ open: false }, () => {
//         const { cancelPayment } = this.props;
//         cancelPayment()
//     })
//     handleCancel = () => this.setState({ open: false })

//     render() {
//        const { paymentDetails } = this.props;
//         const { data, validationError } = this.state;

//         return (
//         <Segment inverted>
//             <Confirm
//                 open={this.state.open}
//                 content='Are you sure you want to cancel payment?'
//                 onCancel={this.handleCancel}
//                 onConfirm={this.handleConfirm}
//                 cancelButton='Never mind'
//                 confirmButton="Yes"
//             />


//             <Form inverted>
//                 <div style={style.alignedRight}>
//                     <Icon size='huge' name="cc mastercard"/> <Icon size='huge' name="cc visa"/> <span style={{ fontSize: 32}}>VERVE</span>
//                 </div>
//                 <Form.Input required defaultValue={data.card_name} onChange={(e, d) => this.onChange(e, d)} name='card_name' type='text' fluid label='CARD HOLDER NAME' placeholder='JOHN DOE JANE' />

//                 <Form.Input required defaultValue={data.card_number} onChange={(e, d) => this.onChange(e, d)} name='card_number' type='number' fluid label='CARD NUMBER' placeholder='XXXX-XXXX-XXXX-XXXX' />

//                 <Form.Group widths='equal'>
//                     <Form.Input required defaultValue={data.expireDate} onChange={(e, d) => this.onChange(e, d)} type="month" name='month' onChange={(e,d) => this.setState({ data: { ...this.state.data, year: parseInt(d.value.split('-')[0], 10), month: parseInt(d.value.split('-')[1], 10), expireDate: d.value } })} fluid label='EXPIRATION DATE' placeholder='XX' />
//                     <Form.Input required defaultValue={data.cvv} onChange={(e, d) => this.onChange(e, d)} type='password' name='cvv' maxLength="3" fluid label='CVV' placeholder='CVC' />
//                 </Form.Group>

//                 <Form.Field>
//                     <Checkbox onChange={() => this.setState({ data: { ...this.state.data, save: !this.state.data.save }})} checked={this.state.data.save} label='Check to save your card on your web browser' />
//                 </Form.Field>
//             </Form> 
//             {(!!validationError) && (<Message error>
//                     <Message.Header>Error</Message.Header>
//                     <Message.Content>{validationError}</Message.Content>
//             </Message>)} 

//             <div style={style.alignedRight}>
//                 <Button color='red' inverted onClick={() => this.show()}>Cancel</Button>

//                 <Button color='green' inverted onClick={() => this.submit()}>Pay {paymentDetails.amount/100} NGN</Button> 
//             </div>
//         </Segment>
//         )
//     }
// }