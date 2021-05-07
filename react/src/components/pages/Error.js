import React, { Component } from 'react';
import {Header, Icon} from 'semantic-ui-react'


export default class Error extends Component {
    render() {
        return (
            <div className="ui container">
                <Header as='h2' icon textAlign='center'>
                    <Icon name='delete' color='red'/>
                    <Header.Content>
                        Error
                    </Header.Content>
                    <Header>
                        This page does not exist
                    </Header>
                </Header>
            </div>
        )
    }
}
