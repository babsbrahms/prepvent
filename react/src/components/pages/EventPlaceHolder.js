import React, { Component } from 'react';
import { Segment, Loader, Dimmer} from 'semantic-ui-react';
import qs from 'query-string';
import { addPromoClick} from '../../actions/promotion'

export default class EventPlaceHolder extends Component {

    componentDidMount() {
        let id = this.props.match.params.hash;

        let params = qs.parseUrl(this.props.location.search)
        console.log('params: ', { pid: params.query.pid });

        if (params.query.pid) {
            addPromoClick(params.query.pid)
            // console.log(eventId);
            this.props.history.push(`/event/${id}/event_name?pid=${params.query.pid}`)
        } else {
                   // console.log(eventId);
            this.props.history.push(`/event/${id}/event_name`)
        }
        
 
        
    }

    render() {
        return (
            <div className="ui container">  
                <Segment>
                    <Dimmer active inverted>
                        <Loader inverted>Loading</Loader>
                    </Dimmer>
                </Segment>
                
            </div>
        )
    }
}
