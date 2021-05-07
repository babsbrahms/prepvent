import { UPDATE_CUSTOMERS_INFO, LIKE_EVENT, UPDATE_CUSTOMERS_EMAIL, UPDATE_CUSTOMERS_NAME_EMAIL } from "../types"

const data = {
    name: '',
    email: '',
    phoneNumber: '',
    likes: 0
};

export default function customerReducer (state= data, action){
    switch(action.type){
        case UPDATE_CUSTOMERS_INFO: 
            return { ...state, ...action.payload }
        case LIKE_EVENT:         
            return { ...state, likes: action.payload }
        case UPDATE_CUSTOMERS_EMAIL: {
            let data = { ...state, email: action.payload };
            localStorage.customer = JSON.stringify(data)
            return data;
        }
            
        case UPDATE_CUSTOMERS_NAME_EMAIL: {
           let data = { ...state, email: action.payload.email, name: action.payload.name };
            localStorage.customer = JSON.stringify(data)
           return data;
        }

        default: return state
    }
}


