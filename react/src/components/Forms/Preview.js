import React, { Component } from 'react'
import { Button, Icon } from 'semantic-ui-react';
import Event from '../Views/Event';


export default class Review extends Component {
    next=()=> {
        const { next } = this.props;

        next()
    }

    prev=()=> {
        const { prev } = this.props;

        prev()
    }
    
    render() {
        const {data, organizer, customer, hostname, addAlert } = this.props;
        
        return (
            <div>
                <Event data={data}  organizer={organizer} loading={false} customer={customer} hostname={hostname} addAlert={(h, m, s, p) => addAlert(h, m, s, p)}/>
                <Button color='pink' onClick={() => this.next()} floated='right'>
                    Publish 
                    <Icon name='checkmark' />
                   
                </Button>
                <Button color='pink' onClick={()=> this.prev()} floated='left'>
                    <Icon name='arrow left' />
                    Back
                </Button>
            </div>
        )
    }
}
