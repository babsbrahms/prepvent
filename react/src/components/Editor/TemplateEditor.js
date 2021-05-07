import React, { Component } from 'react';
import { Modal, Button, Icon, Header, Confirm, Message, Form, Segment } from 'semantic-ui-react';
import parse from 'html-react-parser';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, ContentState, convertFromHTML, convertToRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html';
import Resources from '../Views/Resources';
import emailTemplate from '../../utils/templates/emailTemplate';

// import '../Style/editor.css'

export default class TemplateEditor extends Component {
    constructor (props) {
        super(props)
        this.state = {
            modalOpen:  false,
            open: false,
            alertError: '',
            invitationLetter: props.templateEditorText,
            selectedEmailTemplate: props.templateEditorIndex,
            emailTemplateText: props.emailTemplateText,
            textEditorText: EditorState.createWithContent(
                ContentState.createFromBlockArray(
                  convertFromHTML(props.templateEditorText)
                )
            ),
        };
    }


    handleOpen = () => this.setState({ modalOpen: true })

    handleClose = () => {
        const { closeEditor } = this.props;
        closeEditor()
        this.setState({ modalOpen: false, alertError: '' })
    }
    exportHtml = async () => {
        const { link, poster, name, addHTML} = this.props;
        const {selectedEmailTemplate, invitationLetter } = this.state;

        let html = emailTemplate[selectedEmailTemplate].style(invitationLetter, name, poster)
        addHTML(html, invitationLetter, selectedEmailTemplate);
        this.handleClose()
    }

    onEditorStateChange = (editor) => {
        let newContent = draftToHtml(convertToRaw(editor.getCurrentContent()))
        this.setState({ textEditorText: editor, invitationLetter: newContent })
    }

    show = () => this.setState({ open: true })
    handleConfirm = () => this.setState({ open: false }, () => this.handleClose())
    handleCancel = () => this.setState({ open: false })

    render() {
        const { link, poster, tag, unsubcribe} = this.props;
        const { alertError, selectedEmailTemplate, invitationLetter, textEditorText } = this.state;

        return (
            <div>
                <Button onClick={() => this.handleOpen()} circular size={'tiny'} > Open PrepVENT Template </Button>


                <Modal
                    open={this.state.modalOpen}
                    // onClose={this.handleClose}
                    basic={false}
                    size='fullscreen'
                >
                    <Header icon='html5' content='Create Your Email Body' subheader="Resources and save button are at the bottom of the page" inverted />
                    {(unsubcribe) && (<div style={{ backgroundColor: 'white', color: 'black', padding: '2px', borderRadius: '2px'}}>
                                <Icon name='lightbulb' color='green' /> If you are using your follower's list to send invitation letter, you required to add unsubcribe link to your message
                            </div>)}
                    <Modal.Content>
                        <Confirm
                            open={this.state.open}
                            content='Are you sure you want to exit?'
                            onCancel={this.handleCancel}
                            onConfirm={this.handleConfirm}
                            cancelButton='Never mind'
                            confirmButton="Exit"
                        />
                            
                            <Form>
                                <Form.Field>
                                    <h3><b>1 of 2: </b>Write message</h3>   

                                    <Editor
                                        editorState={textEditorText}
                                        toolbarClassName="toolbarClassName"
                                        wrapperClassName="wrapperClassName"
                                        editorClassName="editorClassName"
                                        placeholder='Start writing here...'
                                        editorStyle={{border:"1px solid #f4f4f4", height:"200px"}}
                                        onEditorStateChange={newContent => this.onEditorStateChange(newContent)}
                                    /> 
                                    <Resources link={link} poster={poster} tag={tag} unsubcribe={unsubcribe}/>
               
                                </Form.Field>
                            </Form>

                            <h3><b>2 of 2: </b>Select template (message written above will appear in the selected template)</h3>
                            <Segment style={{ overflowY: "scroll", maxHeight: '350px', backgroundColor: 'black'}}>
                                {emailTemplate.map((temp, index) => (
                                    <Segment style={{ backgroundColor:  selectedEmailTemplate === index? 'grey': 'white'}} key={temp.id} onClick={() => this.setState({ selectedEmailTemplate: index })}>
                                    {parse(`
                                        ${emailTemplate[index].style(selectedEmailTemplate === index? invitationLetter: 'Text will appear here.')}
                                    `)}
                                    </Segment>
                                ))}
                            </Segment>

                            
                            {/* <select value={selectedEmailTemplate} onChange={(e) => this.setState({ selectedEmailTemplate: e.target.value })}>
                                {emailTemplate.map(temp => (<option style={{ color: 'white', backgroundColor: 'black'}} key={temp.id} label={`Select Template ${temp.id}`} value={temp.id}/>))}
                            </select>  */}

                            {/* <h3>Preview Template</h3>
                            <Segment>
                                {parse(`
                                    ${emailTemplate[selectedEmailTemplate].style(invitationLetter)}
                                `)}
                            </Segment> */}

                        {(!!alertError) && (<Message error>
                            <Message.Header>Error</Message.Header>
                        <Message.Content>{alertError}</Message.Content>
                        </Message>)}
                    </Modal.Content>
                    <Modal.Actions>
                    <Button color='red' onClick={this.show} inverted>
                        
                        <Icon name='close' /> Exit
                    </Button>
                    <Button color='green' onClick={this.exportHtml} inverted>
                        
                        <Icon name='checkmark' /> Save
                    </Button>

                    </Modal.Actions>
                </Modal>
            
            
            </div>
        )
    }
}
