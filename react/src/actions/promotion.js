import api from '../api';

export const createPromotion = (details, payment) => api.promotion.createPromotion(details, payment);

export const getPromotions = (eventId) => api.promotion.getPromotions(eventId);

export const getFeaturedEvent = (state, country) => api.promotion.getFeaturedEvent(state, country)

export const addPromoClick = pid => api.promotion.addPromoClick(pid)
                                    .then(res => console.log(res.data.msg))
                                    .catch(err => console.log(err.response.data.msg))
