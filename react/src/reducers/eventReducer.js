import {FETCH_ALL_EVENT, FETCH_MY_EVENT, CREATE_EVENT, EDIT_EVENT, DELETE_EVENT } from "../types"

const data = {
    allEvents: [],
    myEvents: [],
    state: '',
    country: 'Nigeria',
    timeString: 'ddd Do MMMM YYYY hh:mm a',
    hostname: window.location.origin
};

export default function eventReducer (state= data, action){
    switch(action.type){
        case FETCH_ALL_EVENT: 
            return {...state, allEvents:[...action.payload.allEvents ], state: action.payload.state, country: action.payload.country }
        case FETCH_MY_EVENT: 
            return {...state, myEvents: action.payload,  }
        case CREATE_EVENT: {
            let event = [action.payload, ...state.myEvents];

            localStorage.myEvents = JSON.stringify({ myEvents: event });
             
            return { ...state, myEvents: event, }
        }
            
        case EDIT_EVENT: {

            let event = action.payload;

            let index = state.myEvents.findIndex(x => x._id === event._id)
        
            if (index >= 0) {
                // add to event to store and localstorage
                state.myEvents[index] = event;
        
                localStorage.myEvents = JSON.stringify({ myEvents: state.myEvents });
            } 

            return state;
        }

        case DELETE_EVENT: {

            let event = action.payload;

            let index = state.myEvents.findIndex(x => x._id === event._id)
        
            if (index >= 0) {
                // add to event to store and localstorage
                state.myEvents.splice(index, 1)
        
                localStorage.myEvents = JSON.stringify({ myEvents: state.myEvents });
            } 

            return state;
        }
        
        default: return state
    }
}