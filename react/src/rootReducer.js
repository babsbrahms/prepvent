import { combineReducers } from "redux";

import user from "./reducers/userReducer";
import events from './reducers/eventReducer';
import customer from './reducers/customerReducer';
import country from './reducers/countryReducer'

export default combineReducers({
    user, events, customer, country
});