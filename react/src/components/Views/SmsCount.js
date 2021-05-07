import React from 'react';
import splitter from 'split-sms';
import {Card} from 'semantic-ui-react'

const SmsCount = ({ sms }) => {
    return (
    <Card>
        <Card.Header textAlign='center' as='h5'>
            SMS Count
        </Card.Header>
        <Card.Content>
            <Card.Description >
                Total length: {splitter.split(sms).length}
            </Card.Description>
            <Card.Description >
                Number of parts (SMS): {splitter.split(sms).parts.length}
            </Card.Description>
            {(splitter.split(sms).parts.length > 1) && (<Card.Description >
                Length per part (SMS): {splitter.split(sms).parts[0].length}
            </Card.Description>)}
            <Card.Description >
                Remaining in part (SMS): {splitter.split(sms).remainingInPart}
            </Card.Description>
        </Card.Content>
    </Card>
    )
}


export default SmsCount;