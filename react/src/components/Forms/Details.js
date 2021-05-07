import React, { Component } from 'react'
import { Button, Form, Header, TextArea, Icon, Image } from 'semantic-ui-react';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import WordCount from '../Views/WordCount';
import { EditorState, ContentState, convertFromHTML, convertToRaw } from 'draft-js'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import validator from 'validator';
// import img from '../../utils/images/prepvent.jpg';

export default class Details extends Component {
    constructor(props) {
        super(props);
        this.state = {
            poster: props.poster,
            summary: EditorState.createWithContent(
                ContentState.createFromBlockArray(
                  convertFromHTML(props.summary)
                )
            ),
            organizer: props.organizer,
            tag: props.tag,
            promoText: props.promoText,
            htmlSummary: props.summary
        }
    }


    validation = (poster, summary, organizer, promoText) => {
        let error = '';        

        if (!poster || !summary || !promoText || !organizer.phoneNumber || !organizer.email ) {
            error = 'Complete the form'
        } else if (!validator.isEmail(organizer.email)) {
            error = 'Enter a valid email'
        }

        return error
    }


    next=()=> {
        const { next, addAlert } = this.props;
        const { poster, htmlSummary, organizer, tag, promoText } = this.state;

        let error = this.validation(poster, htmlSummary, organizer, promoText);
        
        if (error) {
            addAlert('Warning', error, false, false);

        } else {
            next(poster, htmlSummary, organizer, tag, promoText)
        }
    }


    prev=()=> {
        const { prev } = this.props;
        const { poster, htmlSummary, organizer, tag, promoText } = this.state;

        prev(poster, htmlSummary, organizer, tag, promoText)
    }

    onChangeOrganizer = (e, data) => this.setState({ organizer: { ...this.state.organizer, [data.name]: data.value } })

    onChange = e => this.setState({ [e.target.name]: e.target.value })

    onChangePromotext = data => this.setState({ promoText: data.value })

    uploadPoster = (e) => this.setState({ poster: e.target.files[0]})


    onEditorStateChange = (editor) => {
        let newContent = draftToHtml(convertToRaw(editor.getCurrentContent()))
        this.setState({ summary: editor, htmlSummary: newContent })
    }

    render() {
        const { poster, summary, organizer, tag, promoText } = this.state;
        // const { mode } = this.props;
        return (
            <div>
                <Form>
                    <Form.Field>
                        <label>Poster <Icon name="asterisk" color='red' size='mini' /></label>
                        <Image src={(typeof poster === 'string')? poster : URL.createObjectURL(poster) } fluid />
                        <div style={{ height:'0px', overflow: 'hidden' }}>
                            <input type="file" accept='.png, .jpg, .jpeg' id="fileInput" name="fileInput" onChange={(e) => this.uploadPoster(e)} />
                        </div>
                        <Button content='upload' icon='upload' size='small' color='black' fluid onClick={() => document.getElementById("fileInput").click()}/>

                        {/* <Segment placeholder>
                            <Grid columns={2} relaxed='very' stackable>
                            <Grid.Column>
                                <Button content='Create' icon='plus' size='big' />
                            </Grid.Column>

                            <Grid.Column verticalAlign='middle'>
                                <Button content='upload' icon='upload' size='big' onClick={() => document.getElementById("fileInput").click()}/>
                            </Grid.Column>
                            </Grid>

                            <Divider vertical>Or</Divider>
                        </Segment> */}
                    </Form.Field>


                    <Form.Field>
                        <Header>
                            <Header.Content as='h5'>
                                Summary<Icon name="asterisk" color='red' size='mini' />
                            </Header.Content>
                            <Header.Subheader>
                            Tell event goers what the event is about and what to expect. Get them excited.
                            </Header.Subheader>
                        </Header>
                        {/* <textarea placeholder="Add event summary" defaultValue={summary} name='summary' onChange={(e) => this.onChange(e)}/> */}
                            <Editor
                            defaultEditorState={summary}
                            toolbarClassName="toolbarClassName"
                            wrapperClassName="wrapperClassName"
                            editorClassName="editorClassName"
                            placeholder='Start writing here...'
                            editorStyle={{border:"1px solid #f4f4f4", height:"250px"}}
                            onEditorStateChange={newContent => this.onEditorStateChange(newContent)}
                            />

                    </Form.Field>


                    <Form.Field>
                        <Header>
                            <Header.Content as='h5'>
                            Promo Text (short summary)<Icon name="asterisk" color='red' size='mini' />
                            </Header.Content>
                            <Header.Subheader>
                            Add short text for people that want to share your event or add it to their calandar
                            </Header.Subheader>
                        </Header>
                    
                        <TextArea maxLength={70} placeholder="Add promotional text" defaultValue={promoText} name='promoText' onChange={(e, data) => this.onChangePromotext(data)}/>
                        <WordCount count={promoText} maxLength={70} />
                    </Form.Field>


                    <Header>
                        <Header.Content as='h5'>
                            Contact Information <Icon name="asterisk" color='red' size='mini' />
                        </Header.Content>
                        <Header.Subheader>
                            Add contact information that event-goers can use to contact the event organizers
                        </Header.Subheader>
                    </Header>

                    <Form.Group widths='equal'>
                        <Form.Input maxLength={30} defaultValue={organizer.name} name='name' onChange={(e, data) => this.onChangeOrganizer(e, data)}  type="text" fluid label="Organizer's name" placeholder="Enter organizer's name" />
                        <Form.Input required defaultValue={organizer.email} name='email' onChange={(e, data) => this.onChangeOrganizer(e, data)} type="email" fluid label="Organizer's email address" placeholder="Enter organizer's email" />
                        <Form.Input required defaultValue={organizer.phoneNumber} name='phoneNumber' onChange={(e, data) => this.onChangeOrganizer(e, data)} type="tel" fluid label="Organizer's phone number" placeholder="Enter organizer's phone number" />
                    </Form.Group>
                
                    <Form.Field>
                    <label>Hastag</label>
                    <input maxLength={20} defaultValue={tag} name='tag' onChange={(e) => this.onChange(e)} placeholder='Hastag' />
                    <WordCount count={tag} maxLength={20} />
                    </Form.Field>


                    <Button color='pink' onClick={() => this.next()} floated='right'>
                        Save
                        <Icon name='arrow right' />
                    </Button>
                    <Button color='pink' onClick={()=> this.prev()} floated='left'>
                        <Icon name='arrow left' />
                        Back
                    </Button>
                </Form>
            </div>
        )
    }
}
