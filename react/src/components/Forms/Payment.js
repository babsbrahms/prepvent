import React, { useState } from 'react';
import { Form, Icon, Select, Button} from 'semantic-ui-react';
import { verifyBankAcct } from '../../actions/user'
import { paystackList } from '../../utils/templates/bankList';
import style from '../Style/Style'



const Payment = ({payment, onChangeBank, onChange, btnText, save }) => {
    const [error, setError] = useState('');
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(false);

    return (
    <div>
        <Form>
            <Form.Field>
            <label>Bank Name<Icon name="asterisk" color='red' size='mini' /></label>
            <Select defaultValue={payment.bankName} onChange={(e, { value}) => {setVerified(false); onChangeBank(value)}} placeholder='Select your bank name' options={paystackList.map(state => ({ key: state.id, text: state.name, value: state.name }))} />
            {/* <select defaultValue={payment.bankName} onChange={(e) => onChangeBank(e.target.value)} placeholder='Select your bank name'>
            {paystackList.map(bank => (<option value={bank.name} key={bank.id}>{bank.name}</option>))}
            </select> */}
            </Form.Field>
            <Form.Field>
            <label>Account Number<Icon name="asterisk" color='red' size='mini' /></label>
            <input type='tel' defaultValue={payment.accountNumber}  name='accountNumber' onChange={(e) =>{setVerified(false); onChange(e.target)}} placeholder='Enter your account number' />
            </Form.Field>
            <Form.Field>
            <label>Account Name<Icon name="asterisk" color='red' size='mini' /></label>
            <input disabled defaultValue={payment.accountName} name='accountName' onChange={(e) =>{ setVerified(false); onChange(e);}} placeholder='Enter your account name' />
            {(!!error) && (<h5 style={{ color: 'red'}}>{error}</h5>)}

            <br />
            <br />
            <div style={style.alignedRight}>
                {(!verified) && (<Button disabled={(!payment.accountNumber || !payment.bankName || loading)} onClick={() => {
                    const bank = paystackList.find(search => search.name === payment.bankName)
                    if (!payment.accountNumber || !payment.bankName) {
                        setError('Add account number and bank name to verify your bank details')
                    } else {
                        setError('')
                        setLoading(true)
                        verifyBankAcct(payment.accountNumber, bank.code)
                        .then(res => {

                            if (res.data.msg) {
                                setVerified(true)
                                onChange({name: 'accountName', value: res.data.msg.data.account_name})
                            } else {
                                setVerified(false)
                                setError(res.data.error)
                            }
                            setLoading(false)
                        })
                        .catch((err) => {
                            setVerified(false)
                            setLoading(false)
                            setError(err.response.data.msg || 'Problem verifying your account')
                        })
                    }

                }}>{loading? <Icon name="spinner" loading /> : 'Verify Account'}</Button>)}

        
                {(verified) && (<Button color={'pink'} onClick={() => save()}>{btnText || 'Save'}</Button>)}
            </div>
            </Form.Field>
        </Form>
    </div>
    )
}

export default Payment

/// TO RESOLVE ACCOUNT NUMBER
// curl "https://api.paystack.co/bank/resolve?account_number=0022728151&bank_code=063" \
// -H "Authorization: Bearer SECRET_KEY" \
// -X GET


/////RESPONSE
// {
//     "status": true,
//     "message": "Account number resolved",
//     "data": {
//       "account_number": "0022728151",
//       "account_name": "WES GIBBONS"
//     }
//   }




///LIST BANKS
// curl "https://api.paystack.co/bank" \
// -H "Authorization: Bearer SECRET_KEY" 
// -X GET