import api from '../api';
import { UPDATE_CUSTOMERS_NAME_EMAIL, UPDATE_CUSTOMERS_EMAIL } from '../types';
import { store } from '../index';

export const organizerSubscription = (data) => api.register.organizerSubscription(data).then((res) => {
    store.dispatch({
        type: UPDATE_CUSTOMERS_EMAIL,
        payload: data.email
    })
    return res;
});

// send liked eventto email
export const sendLikeEvent = (data) => api.register.sendLikeEvent(data).then((res) => {
    store.dispatch({
        type: UPDATE_CUSTOMERS_EMAIL,
        payload: data.email
    })
    return res;
});

//add user to prepvent update list
export const updateSubscription = (data) => api.register.updateSubscription(data).then((res) => {
    store.dispatch({
        type: UPDATE_CUSTOMERS_EMAIL,
        payload: data.email
    })
    return res;
});

export const getSubscriptionStates = (email, country) => api.register.getSubscriptionStates(email, country)

export const manageSubscriptions = (data) => api.register.manageSubscriptions(data) 

// contact and complaint
export const sendContact = (data) => api.register.sendContact(data).then((res) => {
    store.dispatch({
        type: UPDATE_CUSTOMERS_NAME_EMAIL,
        payload: { email: data.email, name: data.name }
    })
    return res;
});;


//send messages
export const sendBulkEmail = data => api.register.sendBulkEmail(data)

export const sendBulkSms = data => api.register.sendBulkEmail(data)

export const sendFollowersEmail = data => api.register.sendFollowersEmail(data)

export const sendFollowerSms= data => api.register.sendFollowerSms(data)

export const sendRegisteredEmail = data => api.register.sendRegisteredEmail(data)

export const sendRegisteredSms = data => api.register.sendRegisteredSms(data)


//ticket
export const getTicketStats = (ticketIds) => api.register.getTicketStats(ticketIds)

// registartion
export const downloadRegistrationList = (eventId) => api.register.downloadRegistrationList(eventId)

// ticket
export const resendTicket = (email, eventId) => api.register.resendTicket(email, eventId).then((res) => {
    store.dispatch({
        type: UPDATE_CUSTOMERS_EMAIL,
        payload: email
    })
    return res;
});

// event organizer unsubscribe
export const organizerUnsubscribe = (email, userId)  => api.register.organizerUnsubscribe(email, userId)

//getCountrySubcriberCount
export const getCountrySubcriberCount = (country) => api.register.getCountrySubcriberCount(country)

export const validateTicket = (email, registrationNumber) => api.register.validateTicket(email, registrationNumber)