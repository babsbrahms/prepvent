import {USER_LOGGED_IN, USER_LOGGED_OUT, USER_UPDATE, GET_USER_INFO, CREATE_USER} from "../types";

const data = {
        firebaseId: '',
        _id: '',
        photoUrl: '',
        name: '',
        email: '',
        phoneNumber: '',
        description: "",
        followerCount: 0,
        payment: {
            bankName: '',
            accountNumber: '',
            accountName: ""
        },
        token: ''
}


function userReducer (state = data, action){
    switch(action.type){
        case USER_LOGGED_IN:
            return {...state, ...action.payload }
        case USER_UPDATE:
            return {...state, ...action.payload }
        case USER_LOGGED_OUT: 
            return { }
        case GET_USER_INFO: 
            return {...state, ...action.payload }
        case CREATE_USER: 
            return {...state, ...action.payload }
        default: 
            return state;
            
    }

}

export default userReducer