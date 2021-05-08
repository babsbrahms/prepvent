import React, { Component } from 'react';
import { Grid, Segment, List, Accordion, Statistic, Divider, Icon, Header, Button } from 'semantic-ui-react';

export default class AttendanceManagement extends Component {
    state = { activeIndex: 1, loading: false, gettingTicket: false }
    handleClick = (e, titleProps) => {
        const { index } = titleProps
        const { activeIndex } = this.state
        const newIndex = activeIndex === index ? -1 : index
    
        this.setState({ activeIndex: newIndex })
    }

    download = () => {
        const { eventId, getList} = this.props;
        this.setState({ loading: true }, () => {
            getList(eventId)
        })
    }

    getTicket = () => {
        const { addAlert, getTicket, eventId } = this.props;
        addAlert('Info', 'Making request to fecth ticket', true, false)

        getTicket(eventId)
    }

    render() {
        const { activeIndex } = this.state;
        const { ticket, fetchingTicket } = this.props;

        let count = ticket.reduce((prev, curr) => prev + curr.qtySold, 0);
        return (
            <div>
                <Header>
                    Registration
                </Header>
                <Grid stackable celled>
                    <Grid.Column width='8' textAlign='center'>
                        <Statistic>
                            <Statistic.Value>{(ticket.length> 0) ? 
                            count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") :                         
                            <Button color="pink" size='large' disabled={fetchingTicket} onClick={this.getTicket}>{(fetchingTicket)? <Icon name="spinner" loading/> : "Get ticket"}</Button>}
                                </Statistic.Value>    
                            <Statistic.Label>Registered</Statistic.Label>
                        </Statistic>
                    </Grid.Column>
                    <Grid.Column width='8' verticalAlign="middle">
                        <Button  color={'pink'} disabled={(ticket.length === 0) || (count === 0)} fluid onClick={this.download}> <Icon name="download"/> Download registration list</Button>
                    </Grid.Column>
                </Grid>

                {/* <Divider />
                <Header>
                    Check-In
                </Header>
                <Accordion>
                    <Accordion.Title
                        active={activeIndex === 0}
                        index={0}
                        onClick={this.handleClick}
                        >
                        <Icon name='dropdown' />
                        Check-In proceedure
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 0}>
                        <Segment>
                           <List celled relaxed>
                                <List.Item>                         
                                    <List.Content>
                                        <List.Header>Download the registration list as a spreadsheet using the link below</List.Header>
                                        <List.Description as='a'>Download registration list</List.Description>
                                    </List.Content>
                                </List.Item>
                                <List.Item>                         
                                    <List.Content>
                                        <List.Header>Open the Check-in page usnig the link below</List.Header>
                                        <List.Description as='a'>Open check-in page</List.Description>
                                    </List.Content>
                                </List.Item>
                                <List.Item> 
                                    <List.Content>
                                        <List.Header>From the check-in page select the location of your download list to start your check-in process</List.Header>
                                    </List.Content>
                                </List.Item>
                                <List.Item> 
                                    <List.Content>
                                        <List.Header>You can check-in users automatically using a barcode scanner or manually by using their registration number.</List.Header>
                                    </List.Content>
                                </List.Item>
                           </List>
                        </Segment>
                    </Accordion.Content>

                </Accordion>       */}
            </div>
        )
    }
}
