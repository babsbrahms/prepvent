import React from 'react'
import { Table, List, Divider } from 'semantic-ui-react';

export const MailingListTable = ({ details, currency, gotFollowers, approve, totalCost, view, analytics}) => {
    return (
    <Table compact celled definition>
        <Table.Header>
        <Table.Row>
            <Table.HeaderCell>state</Table.HeaderCell>
            <Table.HeaderCell>Followers</Table.HeaderCell>
            <Table.HeaderCell>Cost Per Followers</Table.HeaderCell>
            <Table.HeaderCell>Cost</Table.HeaderCell>
            {(view) && <Table.HeaderCell>Sent</Table.HeaderCell>}
            {(view) && <Table.HeaderCell>Ticket Sales</Table.HeaderCell>}
        </Table.Row>
        </Table.Header>

        <Table.Body>
        {details.map(detail => (
            <Table.Row key={detail.state}>
                <Table.Cell>{detail.state}</Table.Cell>
                <Table.Cell>{detail.followers}</Table.Cell>
                <Table.Cell>{detail.costPerMessage}</Table.Cell>
                <Table.Cell>{(detail.cost).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currency.abbr}</Table.Cell>
                {(view) && <Table.Cell>{detail.done.toString()}</Table.Cell>}
                {(view) && 
                <Table.Cell> 
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
                </Table.Cell>}
            </Table.Row> ))}
        </Table.Body>

        <Table.Footer fullWidth>
        <Table.Row>

            <Table.HeaderCell colSpan='3'>     
                {/* {(!view) && (<Button onClick={() => approve()} disabled={gotFollowers} size='small'>
                    Approve All
                </Button>)} */}
            </Table.HeaderCell>
            <Table.HeaderCell colSpan={view? '3': '2'}>
            <b>Total Cost</b>: {(details.reduce((acc, curr) => acc + curr.cost, 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currency.abbr.toLocaleUpperCase()}
            </Table.HeaderCell>
        </Table.Row>
        </Table.Footer>
    </Table>
    )
}
