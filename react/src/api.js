import { instance as axios } from './setHearder';

const api = {
    event: {
        searchEvent: (search) => axios.get(`/api/event/search?q=${search}`),
        creatEvent: (data) => axios.post('/api/event/create', { data }),
        editEvent: (data) => axios.put('/api/event/edit', { data }),
        fetchMyActiveEvent: (id) => axios.get(`/api/event/my_active_event/${id}`),
        fetchMyInactiveEvent: (id) => axios.get(`/api/event/my_inactive_event/${id}`),
        fetchAllEvents: (state, country) => axios.get(`/api/event/all_event/${country}/${state}`),
        getEventAndTicket: (id) => axios.get(`/api/event/event_and_ticket/${id}`),
        getMyEventAndTicket: (id) => axios.get(`/api/event/my_event_and_ticket/${id}`),
        getEvent: (id) => axios.get(`/api/event/${id}`),
        getTicket: (id) => axios.get(`/api/event/ticket/${id}`),
        getMyEventTicket: (id) => axios.get(`/api/event/my_ticket/${id}`),
        disableTicket: (id) => axios.put(`/api/event/disable_ticket/`, { id }),
        enableTicket: (id) => axios.put(`/api/event/enable_ticket/`, { id }),
        cancelEvent: (eventId) => axios.put(`/api/event/cancel_event/`, { id: eventId }),
        publishEvent: (eventId) => axios.put(`/api/event/publish_event/`, { id: eventId }),
        deleteEvent: (eventId) => axios.put(`/api/event/delete_event/`, { id: eventId }),
        registeringTicket: (tickets, buyer, pid) => axios.post(`/api/event/register_ticket/`, { tickets, buyer, pid }),
        requestForPayment: (eventId, userId, ticketIds) => axios.post(`/api/event/request_for_payment/`, { eventId, userId, ticketIds }),
        verifyTicket: (ticketId,qty,startTime) => axios.get(`/api/event/verify_ticket/${ticketId}/${qty}/${startTime}`),
        cancelTicket: (email, registrationNumber, eventId) => axios.put('/api/event/cancel_ticket', { email, registrationNumber, eventId }),
        getOrganizerfollowersEmailCount: (userId) => axios.get(`/api/event/organizer_follower_email_count/${userId}`),
        getOrganizerfollowersSmsCount: (userId) => axios.get(`/api/event/organizer_follower_sms_count/${userId}`),
        getEmailRegisterCount: (eventId) => axios.get(`/api/event/registered_email_count/${eventId}`),
        getSmsRegisterCount: (eventId) => axios.get(`/api/event/registered_sms_count/${eventId}`),
        sendComplain: (data) => axios.post('/api/event/send_complain', { data }),

    },
    user: {
        createUser: (user) => axios.post('/api/user/create_user', { user }),
        userLogin: (id) => axios.get(`/api/user/user_login/${id}`),
        userUpdate: (user) => axios.put('/api/user/user_update', { user }),
        updatePayment: ( payment, userId ) => axios.put('/api/user/user_payment_update', { payment, userId }),
        verifyBankAccount: (account_number, bank_code) => axios.get(`/api/user/verify_bank_account/${account_number}/${bank_code}`)
    },
    register: {
        getCountrySubcriberCount: (country) =>  axios.get(`/api/register/get_country_subscribers_count/${country}`),
        organizerSubscription: (data) =>  axios.post('/api/register/organizer_subscription', { data }),
        sendLikeEvent: (data) =>  axios.post('/api/register/send_likes', { data }),
        updateSubscription: (data) =>  axios.put('/api/register/update_subscriptions', { data }),
        getSubscriptionStates: (email, country) => axios.get(`/api/register/get_subscriptions/${email}/${country}`),
        manageSubscriptions: (data) => axios.put('/api/register/manage_subscriptions', { data }),
        sendContact: (data) => axios.post('/api/register/send_contact', { data }),
        sendBulkEmail: (data) => axios.post('/api/register/send_bulk_email', { data }),
        sendBulkSms: (data) => axios.post('/api/register/send_bulk_sms', { data }),
        sendFollowersEmail: (data) => axios.post('/api/register/send_follower_email', { data }),
        sendFollowerSms: (data) => axios.post('/api/register/send_follower_sms', { data }),
        sendRegisteredEmail: (data) => axios.post('/api/register/send_registered_email', { data }),
        sendRegisteredSms: (data) => axios.post('/api/register/send_registered_sms', { data }),
        getTicketStats: (ticketIds, eventId) => axios.put(`/api/register/ticket_stats`, {ticketIds}),
        downloadRegistrationList: (eventId) => axios.get(`/api/register/registered_list/${eventId}`),
        resendTicket: (email, eventId) => axios.post('/api/register/resend_ticket', { email, eventId }),
        organizerUnsubscribe: (email, userId) =>  axios.put('/api/register/organizer_unsubscribe', { email, userId }),
        validateTicket: (email, registrationNumber) => axios.get(`/api/register/validate_ticket/${email}/${registrationNumber}`)
    },
    promotion: {
        createPromotion: (details, payment) => axios.post('/api/promotion/create_promotion', { details, payment }),
        getPromotions: (eventId) => axios.get(`/api/promotion/get_promotions/${eventId}`),
        getFeaturedEvent: (state, country) => axios.get(`/api/promotion/get_featured_event/${state}/${country}`),
        addPromoClick: id => axios.put('/api/promotion/add_click', { id })
    },
    country: {
        getCountries: () => axios.get('/api/country/get_countries'),
        getCountryDetails: (name) => axios.get(`/api/country/get_country_details/${name}`),
    }
}

export default api;