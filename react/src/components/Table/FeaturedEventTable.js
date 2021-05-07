import React from 'react'
import { Button, Table, List, Divider } from 'semantic-ui-react';
import moment from 'moment';


export const FeaturedEventTable = ({ details, currency, editPromo, deletePromo, time, view, analytics }) => {
    return (
    <Table compact celled definition>
        <Table.Header>
        <Table.Row>
            <Table.HeaderCell>State</Table.HeaderCell>
            <Table.HeaderCell>Duration</Table.HeaderCell>
            <Table.HeaderCell>Cost Per Day</Table.HeaderCell>
            <Table.HeaderCell>Cost</Table.HeaderCell>
            <Table.HeaderCell>{(view) && "Ticket Sales"}</Table.HeaderCell>
        </Table.Row>
        </Table.Header>

        <Table.Body>
        {details.map((detail, index) => (
            <Table.Row key={index}>
                <Table.Cell>{detail.state}</Table.Cell>
                <Table.Cell> {moment.utc(detail.duration.start).utcOffset(time.localOffset).format('YYYY-MM-DD')} to {moment.utc(detail.duration.end).utcOffset(time.localOffset).format('YYYY-MM-DD')}</Table.Cell>
                <Table.Cell>{detail.costPerDay}</Table.Cell>
                <Table.Cell>{(detail.cost).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currency.abbr}</Table.Cell>
                <Table.Cell>
                    {(!view) && (<Button.Group size='small'>
                        <Button onClick={() => editPromo(index)} color='blue'>Edit</Button>
                        <Button onClick={() => deletePromo(index)} color='red'>Delete</Button>
                    </Button.Group>)}
                    {(view) && (<div>
                        {(!!analytics.ticket) && (<List divided>
                            {Object.keys(analytics.ticket).map(stats => (
                            <List.Item>
                                <List.Content>
                                    <List.Header as='a'>{stats}</List.Header>
                                    <List.Description>qtySold : {analytics.ticket[stats].qtySold} </List.Description>
                                    <List.Description>revenue : {(analytics.ticket[stats].revenue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currency.abbr.toLocaleUpperCase()}</List.Description>
                                    
                                </List.Content>
                            </List.Item>))}
                        </List>)}
                        <Divider />
                        <b style={{ backgroundColor: '#e61a8d', color: 'white', padding: '3px'}}>Total Revenue: {(analytics.salesRevenue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currency.abbr.toLocaleUpperCase()}</b>
                    </div>)}
                </Table.Cell>
            </Table.Row>
        ))}
        </Table.Body>

        <Table.Footer fullWidth>
        <Table.Row>
            
            <Table.HeaderCell colSpan='3'>     

            </Table.HeaderCell>
            <Table.HeaderCell colSpan='2'>
            <b>Total Cost</b>:{(details.reduce((acc, curr) => acc + curr.cost, 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currency.abbr.toLocaleUpperCase()}
            </Table.HeaderCell>
        </Table.Row>
        </Table.Footer>
    </Table>
    )
}
