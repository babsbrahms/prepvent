import React, { Component } from 'react';
import { Modal, Button, Icon, Header, Confirm, Message } from 'semantic-ui-react';
// import { Editor } from 'react-draft-wysiwyg';
// import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
// import { EditorState, ContentState, convertFromHTML, convertToRaw } from 'draft-js'
// import draftToHtml from 'draftjs-to-html';
import JoditEditor from "jodit-react";
// import style from '../Style/Style';
import Resources from '../Views/Resources';

// import '../Style/editor.css'

export default class TextEditor extends Component {
    constructor (props) {
        super(props)
        this.state = {
            modalOpen:  false,
            open: false,
            design: props.design,
            alertError: '',
            selectedMethod: 'editor',
            // emailTemplateText: props.emailTemplateText,
            // textEditorText: EditorState.createWithContent(
            //     ContentState.createFromBlockArray(
            //       convertFromHTML(props.textEditorText)
            //     )
            // ),
            content: props.textEditorText
        };
        this.editor = React.createRef()
    }

    handleOpen = () => this.setState({ modalOpen: true })

    handleClose = () => {
        const { closeEditor } = this.props;
        closeEditor()
        this.setState({ modalOpen: false, alertError: '' })
    }

    exportHtml = async () => {
        const { addHTML } = this.props;
        const { content } = this.state;

        addHTML(content);
        this.handleClose()

    }

    show = () => this.setState({ open: true })
    handleConfirm = () => this.setState({ open: false }, () => this.handleClose())
    handleCancel = () => this.setState({ open: false })

    // onEditorStateChange = (editor) => {
    //     let newContent = draftToHtml(convertToRaw(editor.getCurrentContent()))
    //     this.setState({ textEditorText: editor, content: newContent })
    // }

    render() {
        const { link, poster, tag, unsubcribe } = this.props;
        const {  alertError, content  } = this.state;

        return (
            <div>
                <Button onClick={() => this.handleOpen()} circular size={'tiny'} > Open Text Editor </Button>
                        
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
                            content='Are you sure you want to exit'
                            onCancel={this.handleCancel}
                            onConfirm={this.handleConfirm}
                            cancelButton='Never mind'
                            confirmButton="Exit"
                        />

                        <JoditEditor
                            ref={this.editor}
                            value={content}
                            config={{ readonly: false }}
                            tabIndex={1} // tabIndex of textarea
                            onBlur={newContent => this.setState({ content: newContent })} // preferred to use only this option to update the content for performance reasons
                            onChange={newContent => {}}
                        />
                        <Icon name='lightbulb' color='green' /> You can paste or write html code in the editor by using <Icon name="code" /> icon at the top bar to toggle mode

                           
                        {/* <Editor
                        editorState={textEditorText}
                        toolbarClassName="toolbarClassName"
                        wrapperClassName="wrapperClassName"
                        editorClassName="editorClassName"
                        placeholder='Start writing here...'
                        editorStyle={{border:"1px solid #f4f4f4", height:"300px"}}
                        onEditorStateChange={newContent => this.onEditorStateChange(newContent)}
                        /> */}
                            
                        <Resources link={link} poster={poster} tag={tag} unsubcribe={unsubcribe}/>

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
