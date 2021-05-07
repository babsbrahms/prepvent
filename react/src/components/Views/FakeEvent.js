
import React from 'react';
import { Segment, Placeholder, Button, Label, Header, Grid, Divider, Icon} from 'semantic-ui-react';
import style from '../Style/Style'

const FakeEvent = () => {
    return (
        <Segment>
                <div style={style.center}>
                    <Placeholder style={{ height: 300, width: '100%', flex: 1 }}>
                        <Placeholder.Image />
                    </Placeholder>
                </div>

                <Divider />
                <div style={style.center}>
                    <Header textAlign='center'> 
                        <Header.Content as='h2'>
                        <Placeholder>
                            <Placeholder.Line length='full' />
                        </Placeholder>
                        </Header.Content>
                        <Header.Subheader>
                            <Placeholder>
                                <Placeholder.Line length='medium' />
                            </Placeholder>                                   
                        </Header.Subheader>
                    </Header>
                </div>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width='7' textAlign='right'>
                            <div>
                                <Placeholder>
                                    <Placeholder.Line length='full' />
                                    <Placeholder.Line length='full' />
                                </Placeholder>
                            </div>    
                        </Grid.Column>
                        <Grid.Column width='1'>
                            <div>|</div>
                        </Grid.Column>
                        <Grid.Column width='7'  verticalAlign='middle'>
                            <div>
                            <Placeholder>
                                <Placeholder.Line length='full' />
                                <Placeholder.Line length='full' />
                            </Placeholder>
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <div>
                    <Button disabled color='pink' circular icon='heart' />
                    <Button disabled circular color='facebook' icon='facebook' />
                    <Button disabled circular color='twitter' icon='twitter' />
                    <Button disabled circular color='instagram' icon='instagram' />
                    <Button disabled circular color='instagram' icon='whatsapp' />
                </div>

                <br/>


                <div>
                    <Label as='a' color='pink'>
                        <Icon disabled name='map marker'/>
                        . . .
                    </Label>

                    <Label as='a' color='pink'>
                        <Icon disabled name='group'/>
                        . . .
                    </Label>

                    <Label as='a' color='pink'>
                        <Icon disabled name='hashtag'/>   
                        . . .
                    </Label>
                </div>
                <div style={style.center}>
                    <Placeholder style={{ width: '100%', flex: 1 }}>
                        <Placeholder.Line length='full' />
                        <Placeholder.Line length='full' />
                        <Placeholder.Line length='full' />
                        <Placeholder.Line length='full' />
                        <Placeholder.Line length='full' />
                        <Placeholder.Line length='full' />
                    </Placeholder>
                </div>

                <br/>
                <br/>
                <br/>            
                <br/>
                <br/>
                <br/>
                <br/>
        </Segment>
    )
}

export default FakeEvent;