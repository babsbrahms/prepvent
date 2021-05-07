import { GET_COUNTRIES,  GET_COUNTRY_DETAILS, UPDATE_COUNTRY } from '../types';

const data = {
    countries: ['Nigeria'],
    name: 'Nigeria',
    states: [
        'Abia',
        'Adamawa',
        'Akwa Ibom',
        'Anambra',
        'Bauchi',
        'Bayelsa',
        'Benue',
        'Borno',
        'Cross River',
        'Delta',
        'Ebonyi', 
        'Edo',
        'Ekiti',
        'Enugu',
        'Federal Capital Territory',
        'Gombe',
        'Imo',
        'Jigawa',
        'Kaduna', 
        'Kano', 
        'Katsina', 
        'Kebbi',
        'Kogi', 
        'Kwara',
        'Lagos',
        'Nasarawa',
        'Niger',
        'Ogun', 
        'Ondo',
        'Osun',
        'Oyo', 
        'Plateau',
        'Rivers',
        'Sokoto',
        'Taraba',
        'Yobe',
        'Zamfara'],
    mecca: 'Lagos',
    currency: {
        name: 'Naira',
        abbr: 'ngn'
    },
    localOffset: '+01:00',
    countriesUpdatedAt: null
}

export default function countryReducer (state= data, action){
    switch(action.type){
        case GET_COUNTRIES: 
            return { ...state, countries: action.payload.countries, countriesUpdatedAt: action.payload.countriesUpdatedAt }
        case GET_COUNTRY_DETAILS: {
            state = { ...state, ...action.payload };
            return state;
        }   
        case UPDATE_COUNTRY: {
            state = { ...state, ...action.payload };
            return state;
        }    

        default: return state
    }
}

