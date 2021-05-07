import React from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css';
import { composeWithDevTools } from "redux-devtools-extension"; // for browser dev-tool debug
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { Provider } from "react-redux";
import { BrowserRouter, Route } from "react-router-dom";
import rootReducer from "./rootReducer";
import App from './App';
import setHeader from './setHearder';
import decode from 'jwt-decode';
import { USER_LOGGED_IN, FETCH_ALL_EVENT, FETCH_MY_EVENT, UPDATE_CUSTOMERS_INFO, LIKE_EVENT, UPDATE_COUNTRY } from './types'
import * as serviceWorker from './serviceWorker';

export const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)))

if(localStorage.user){
    
    const token = JSON.parse(localStorage.user);
    const tokenDecode = decode(token)._doc;
    setHeader(token);
    
    const user={
        ...tokenDecode, 
        token
    }

    store.dispatch({
        type: USER_LOGGED_IN,
        payload: user
    })
}

if(localStorage.allEvents){
    const events = JSON.parse(localStorage.allEvents)
    
    store.dispatch({
        type: FETCH_ALL_EVENT ,
        payload: events
    })
}


if(localStorage.myEvents){
    const events = JSON.parse(localStorage.myEvents)
    
    store.dispatch({
        type: FETCH_MY_EVENT ,
        payload: events.myEvents
    })
}

if (localStorage.country) {
    const country = JSON.parse(localStorage.country)
    
    store.dispatch({
        type: UPDATE_COUNTRY,
        payload: country
    })
}


if(localStorage.customer){
    const customer = JSON.parse(localStorage.customer)

    let customerData = {
        ...customer,
        likes: JSON.parse(sessionStorage.getItem('likes')) ? JSON.parse(sessionStorage.getItem('likes')).length : 0
    }

    store.dispatch({
        type: UPDATE_CUSTOMERS_INFO,
        payload: customerData
    })
} else {
    
    store.dispatch({
        type: LIKE_EVENT,
        payload: JSON.parse(sessionStorage.getItem('likes')) ? JSON.parse(sessionStorage.getItem('likes')).length : 0
    })
}


ReactDOM.render( 
    <BrowserRouter>
        <Provider store = {store}> 
            <Route  component={App}/> 
        </Provider>
    </BrowserRouter>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();