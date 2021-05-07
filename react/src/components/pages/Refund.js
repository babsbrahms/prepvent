import React from 'react';
import { Segment, Header} from 'semantic-ui-react';
// import { Link } from 'react-router-dom';
import HtmlHeader from '../Views/HtmlHeader';

const Refund = () => {
    return (
        <div className="ui container">
            <HtmlHeader page="Refund Policy" />
            <Segment inverted>
                <Header as='h1' textAlign='center'>
                    <Header.Content>
                        Refund Policy
                    </Header.Content>
                </Header>
            </Segment>

            <Segment>
                <h3>Ticket refund conditions</h3>
                <p>The table below shows the conditions for ticket refund, the percentage of the ticket fee refundable and how long before event-goers get their refund.</p>
                <table>
                    <thead>
                        <tr>
                            <th>Refund condition</th>
                            <th>Percentage refundable</th>
                            <th>Refund duration</th>
                        </tr>
                    </thead>

                    <tbody style={{ textAlign: 'center'}}>

                        <tr>
                            <td>Organizer cancels event</td>
                            <td>90%</td>
                            <td>7-12 working days after the cancellation</td>
                        </tr>

                        <tr>
                            <td>Event-goers cancels ticket (for refundable ticket)</td>
                            <td>90%</td>
                            <td>7-12 working days from request day</td>
                        </tr>
                    </tbody>
                </table>
                <br />

                <p>We allow event organizers to set the refund policy for event-goers ticket cancellation. This determines whether an event goer can request a ticket refund or not, and the duration of the ticket refund before the event starts.</p>
                <p>We handle all refunds and the refund fee are calculated by multiping your ticket fee by percetage refundable (See table above)</p>
            </Segment>          
        </div>
    )
}

export default Refund

//  