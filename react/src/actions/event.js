import api from '../api';
import { FETCH_MY_EVENT, FETCH_ALL_EVENT, CREATE_EVENT, EDIT_EVENT, DELETE_EVENT } from '../types';

export const searchEvent = search => api.event.searchEvent(search)

export const creatEventAction = (data) => dispatch => api.event.creatEvent(data).then((res) =>  {
    if (res.data.event) {
        return dispatch({
            type: CREATE_EVENT,
            payload: res.data.event
        })
    } else {
        return res
    }
});

export const editEventAction = (data) => dispatch => api.event.editEvent(data).then((res) => {
    if (res.data.event) {
        return dispatch({
            type: EDIT_EVENT,
            payload: res.data.event
        })
    } else {
        return res
    }
});

export const fetchMyActiveEventsAction = (id) => dispatch => api.event.fetchMyActiveEvent(id).then((res) => {

    if (res.data.events) {
        const events = {
            myEvents: res.data.events || [], 
        };
        
        localStorage.myEvents = JSON.stringify(events);
    
        return dispatch({
            type: FETCH_MY_EVENT,
            payload: events.myEvents
        })
    } else {
        return res
    }
})

export const fetchMyInactiveEvent = (id) => api.event.fetchMyInactiveEvent(id)

export const fetchAllEventsAction = (state, country) => dispatch => api.event.fetchAllEvents(state, country).then((res) => {

    if (res.data.events) {
        const events = {
            allEvents: res.data.events, 
            lastAllEventUpdate: Date.now(), 
            state: state, 
            country: country 
        };
        localStorage.allEvents = JSON.stringify(events);
    
        return dispatch({
            type: FETCH_ALL_EVENT,
            payload: events
        })
    } else {
        return res
    }

})
//edit
export const cancelEventAction = (eventId)  => dispatch => api.event.cancelEvent(eventId).then((res) => {
    if (res.data.event) {
        return dispatch({
            type: EDIT_EVENT,
            payload: res.data.event
        })
    } else {
         return res
    }
});

// craete
export const publishEventAction = (eventId) => dispatch => api.event.publishEvent(eventId).then((res) => {
    if ( res.data.event) {
        return dispatch({
            type: CREATE_EVENT,
            payload: res.data.event
        })
    } else {
         return res
    }
});

//delete
export const deleteEventAction = (eventId) => dispatch => api.event.deleteEvent(eventId).then((res) => {
    if ( res.data.event) {
        return dispatch({
            type: DELETE_EVENT,
            payload: res.data.event
        })
    } else {
         return res
    }
});




export const registeringTicket = (tickets, buyer, pid) => api.event.registeringTicket(tickets, buyer, pid)

export const getEvent = (id) => api.event.getEvent(id)

export const getEventAndTicket = (id) => api.event.getEventAndTicket(id)

export const getMyEventAndTicket = (id) => api.event.getMyEventAndTicket(id)

export const getTicket = (id) => api.event.getTicket(id)

export const getMyEventTicket = id => api.event.getMyEventTicket(id)

export const disableTicket = ticketId => api.event.disableTicket(ticketId)

export const enableTicket = ticketId => api.event.enableTicket(ticketId)

export const cancelTicket = (email, registrationNumber, eventId) => api.event.cancelTicket(email, registrationNumber, eventId)


// payment
export const requestForPayment = (eventId, userId, ticketIds) => api.event.requestForPayment(eventId, userId, ticketIds)


//verify that tickt is available
export const verifyTicket = (ticketId,qty,startTime) => api.event.verifyTicket(ticketId, qty,startTime)

// no of contacts
export const getOrganizerfollowersEmailCount =(userId) => api.event.getOrganizerfollowersEmailCount(userId);

export const getOrganizerfollowersSmsCount =(userId) => api.event.getOrganizerfollowersSmsCount(userId);

export const getEmailRegisterCount =(eventId) => api.event.getEmailRegisterCount(eventId);

export const getSmsRegisterCount =(eventId) => api.event.getSmsRegisterCount(eventId);

export const sendComplain = data => api.event.sendComplain(data)