import React, { Component } from 'react';
import { connect } from "react-redux"
import { Route, Redirect } from 'react-router-dom';
// import PropTypes from "prop-types";
import { Loader, Segment, Dimmer } from 'semantic-ui-react'
import firebase from '../../firebaseConfig';

let unsubscribe;


class GuestRoute extends Component {
    state= {
        loading: true,
        isAuthenticated: false,
        user: {}
    }

    componentDidMount () {
        this.auth()
    }

    componentWillUnmount()  {
        unsubscribe()
    }

    auth = ()=> {
        unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                
                // The user's ID, unique to the Firebase project. Do NOT use
                // this value to authenticate with your backend server, if
                // you have one. Use User.getToken() instead.
               this.setState({ loading: false, isAuthenticated: true})
            } else {
                this.setState({ loading: false, isAuthenticated: false })
            }
          });
    }

    render( ) {
        const {token, component: Component, ...rest} = this.props;
        const {loading, isAuthenticated} = this.state;

        // console.log('guestRoute==', 'token: ', token, 'isAuthenticated: ',isAuthenticated, 'loading: ', loading);
        return (
            <div>
                {loading && (<Segment>
                    <Dimmer active>
                        <br/>
                        <Loader>Loading</Loader>
                        <br/>
                    </Dimmer>

                </Segment>)}
                
                {!loading && !isAuthenticated && !token && (<Route {...rest} render={(props)=> <Component  {...props}/>} />)}
                {!loading && isAuthenticated && !token && (<Route {...rest} render={(props)=> <Component  {...props}/>} />)}
                {!loading && !isAuthenticated && token && (<Route {...rest} render={(props)=> <Component  {...props}/>} />)}
                {!loading && isAuthenticated && token && (<Redirect to="/profile" />)}
            </div>
        )
    }
}
// rest = path, location, exact etc
const mapstateToProps = (state )=> ({
        token: !!state.user.token
})

// GuestRoute.propTypes={
// isAuthenticated: PropTypes.bool.isRequired,
// component: PropTypes.func.isRequired

// } 

export default connect(mapstateToProps)(GuestRoute);