import React from 'react';
import { Card, Popup } from 'semantic-ui-react'

const Resources = ({ link, poster, letter, tag, unsubcribe }) => {
    return (
    <Card>
        <Card.Header>
            <h5 style={{  textAlign: 'center', color: 'black'}}>Resources</h5>
            
        </Card.Header>
        <Card.Content>
            <Card.Description>
                Click on any item on the list below to copy it!
            </Card.Description>
            <Card.Description >
                <Popup trigger={<a href="#" onClick={() => navigator.clipboard.writeText(link)}>Event page link</a>} on='click'>
                    <Popup.Content>Copied!</Popup.Content>
                </Popup>
            </Card.Description>
            <Card.Description >
                <Popup trigger={<a href="javascript:void(0);" onClick={() => navigator.clipboard.writeText(poster)}>Event poster link</a>} on='click'>
                    <Popup.Content>Copied!</Popup.Content>
                </Popup>
            </Card.Description>   
            {(!!unsubcribe) && (<Card.Description>
                <Popup trigger={ <a href="javascript:void(0);" onClick={() => navigator.clipboard.writeText(unsubcribe)}>unsubcribe link</a>} on='click'>
                    <Popup.Content>Copied!</Popup.Content>
                </Popup>
               </Card.Description>)}  
            {/* <Card.Description>
                <Popup trigger={<a href="javascript:void(0);" onClick={() => navigator.clipboard.writeText(`#${tag}`)}>Hastag</a>} on='click'>
                    <Popup.Content>Copied!</Popup.Content>
                </Popup>
            </Card.Description> */}
        </Card.Content>
    </Card>
    )
}


export default Resources;