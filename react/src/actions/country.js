import api from '../api';
import {GET_COUNTRIES,  GET_COUNTRY_DETAILS } from '../types';

export const getCountriesAction = () => (dispatch, getState) => api.country.getCountries().then((res) => {
    const { country } = getState()
    let data = {
        ...country,
        countries: res.data.countries,
        countriesUpdatedAt: Date.now()
    };


    localStorage.country = JSON.stringify(data);

    return dispatch({
        type: GET_COUNTRIES,
        payload: {
            countries: data.countries,
            countriesUpdatedAt: data.countriesUpdatedAt
        }
    });
}) 

export const getCountryDetailsAction = name => (dispatch, getState) => api.country.getCountryDetails(name).then((res) => {
    const { country } = getState();

    if (res.data.details !== null) {
        let data = {
            ...country,
            ...res.data.details
        };
    
        localStorage.country = JSON.stringify(data);
    
        return dispatch({
            type: GET_COUNTRY_DETAILS,
            payload: res.data.details
        })
    }

});


export const getCountryDetails = name => api.country.getCountryDetails(name)
