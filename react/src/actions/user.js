import api from '../api';
import { USER_UPDATE, USER_LOGGED_IN, USER_LOGGED_OUT, CREATE_USER, UPDATE_CUSTOMERS_NAME_EMAIL} from '../types';
import setHeader from '../setHearder';
import { store } from '../index';
import { signOut } from '../components/fbase';

export const userLogginAction = (id) => dispatch => api.user.userLogin(id).then((res) => {
    
    if (res.data.user)  {
        let user = res.data.user;
        
        localStorage.user = JSON.stringify(user.token)
        setHeader(user.token);
        store.dispatch({
            type: UPDATE_CUSTOMERS_NAME_EMAIL,
            payload: { email: user.email || '', name: user.name || '' }
        })   
        return dispatch({
            type: USER_LOGGED_IN,
            payload: user || {}
        })
    } else {
        return res
    }
    

})

export const userUpdateAction = (data) => dispatch => api.user.userUpdate(data).then((res) => {

    if (res.data.user) {
        let user = res.data.user;

        localStorage.user = JSON.stringify(user.token);

        return dispatch({
             type: USER_UPDATE,
             payload: user
         })
    } else {
        return res
    }
})

export const updatePaymentAction = (data, userId) => dispatch => api.user.updatePayment(data, userId).then((res) => {
    if (res.data.user) {
        let user = res.data.user;

        localStorage.user = JSON.stringify(user.token);

        return dispatch({
             type: USER_UPDATE,
             payload: user
        })
    } else {
        return res
    }

})


export const createUserAction = (data) => dispatch => api.user.createUser(data).then((res) => {

    if (res.data.user) {
        let user = res.data.user;

        localStorage.user = JSON.stringify(user.token)
        setHeader(user.token)
        return dispatch({
            type: CREATE_USER,
            payload: user
        })
    } else {
        return res
    }
})

export const userLogOut = () => {    
    signOut().then(() => {
        localStorage.removeItem('user')
        setHeader()
        store.dispatch({
            type: USER_LOGGED_OUT,
            payload: {}
        })
    })
}


export const verifyBankAcct = (account_number, bank_code) => api.user.verifyBankAccount(account_number, bank_code)

