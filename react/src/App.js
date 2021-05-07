import React from 'react';
import { Route, Switch} from "react-router-dom";
// import PropTypes from "prop-types";

import "firebase/analytics";

import GuestRoute from "./components/routes/GuestRoute";
import UserRoute from "./components/routes/UserRoute";

import TopHeader from "./components/Headers/TopHeader";
import BottomHeader from './components/Headers/BottomHeader'
import HomePage from "./components/pages/Home";
import AuthPage from "./components/pages/Authentication";
import ProfilePage from "./components/pages/Profile";
import DashboardPage from "./components/pages/Dashboard";
import ErrorPage from "./components/pages/Error";
import CreateEventPage from "./components/pages/Create";
import EventPage from "./components/pages/Event";
import PrivacyPolicyPage from './components/pages/Privacy';
import TermsAndConditionPage from './components/pages/TermsAndCondition';
import ContactUsPage from './components/pages/Contact';
import EditEventPage  from './components/pages/Edit';
import EventPalceHolderPage from './components/pages/EventPlaceHolder';
import RefundPage from './components/pages/Refund';
import UnsubscribePage from './components/pages/Unsubscribe';
import ManageSubscriptionPage from './components/pages/ManageSubscription';
import ValidateTicketPage from './components/pages/ValdateTicket'
import SettingsPage from './components/pages/Settings';








const App = ({location}) =>  (
      <div>
        <TopHeader location={location} />
        {/* <div className="ui container"> */}
          <Switch>
            <Route location={location} path="/" exact component={HomePage}/>
            <GuestRoute location={location} path="/auth" exact component={AuthPage} />
            <Route location={location} path="/event/:eventId/:eventName" exact component={EventPage} />
            <Route location={location} path="/e/:hash" exact component={EventPalceHolderPage} />
            <UserRoute location={location} path="/profile" exact component={ProfilePage} />
            <UserRoute location={location} path="/dashboard/:eventId" exact component={DashboardPage} />
            <UserRoute location={location} path="/create" exact component={CreateEventPage} />
            <UserRoute location={location} path="/edit/:eventId" exact component={EditEventPage} />
            <UserRoute location={location} path="/settings" exact component={SettingsPage} />
            <Route location={location} path="/privacy" exact component={PrivacyPolicyPage} />
            <Route location={location} path="/terms" exact component={TermsAndConditionPage} />
            <Route location={location} path="/refund" exact component={RefundPage} />
            <Route location={location} path="/contact" exact component={ContactUsPage} />
            <Route location={location} path="/unsubscribe/o/:userId" exact component={UnsubscribePage} />
            <Route location={location} path="/subscriptions" exact component={ManageSubscriptionPage} />
            <Route location={location} path="/validate_ticket/:email/:registrationNumber" exact component={ValidateTicketPage} />
            <Route location={location} path="/*" exact component={ErrorPage} />
          </Switch>
        {/* </div> */}
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br />
        <br/>
        <br/>
        <br />
        <br/>
        <br/>
        <BottomHeader moveUp={() => window.scrollTo({top: 0, left: 100, behavior: 'smooth'})} />
  
  
 

      </div>
);

export default App;
