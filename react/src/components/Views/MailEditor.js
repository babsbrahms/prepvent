import React, { Component } from 'react';
import { Segment, Modal, Button, Icon, Header, Confirm, Message, Divider } from 'semantic-ui-react';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, ContentState, convertFromHTML, convertToRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html';
import EmailEditor from 'react-email-editor';
import style from '../Style/Style';
import Resources from '../Views/Resources';

// import '../Style/editor.css'

export default class MailEditor extends Component {
    constructor (props) {
        super(props)
        this.state = {
            modalOpen:  false,
            open: false,
            design: props.design,
            alertError: '',
            selectedMethod: 'editor',
            emailTemplateText: props.emailTemplateText,
            textEditorText: EditorState.createWithContent(
                ContentState.createFromBlockArray(
                  convertFromHTML(props.textEditorText)
                )
            ),
        };
        this.editor = React.createRef()
    }

    componentWillUnmount() {
        clearTimeout(this.watcher)
    }

    changeMethod = () => this.setState({ selectedMethod: (this.state.selectedMethod === 'editor')? 'template' : 'editor'}, () => {
        if (this.state.selectedMethod === 'template') {
            this.handleOpen()
        }
    })

    handleOpen = () => this.setState({ modalOpen: true })

    handleClose = () => {
        const { closeEmailTemplate } = this.props;
        closeEmailTemplate()
        this.setState({ modalOpen: false, alertError: '' })
    }
    exportHtml = async () => {
        const { addEmailTemplateText } = this.props;
        try {
            this.editor.exportHtml(data => {
                const { design, html } = data
                    this.editor.saveDesign(design => {
                        this.setState({ emailTemplateText: html, design: design, alertError: '' }, () => {
                            addEmailTemplateText(html, design);
                            this.handleClose()
                        })
                    })
            })   
        } catch (error) {
            this.setState({ alertError: 'An error occured while saving your template' })     
        }
    }

    show = () => this.setState({ open: true })
    handleConfirm = () => this.setState({ open: false }, () => this.handleClose())
    handleCancel = () => this.setState({ open: false })

    onLoad = () => {
        const { design, addAlert } = this.props;
        try {
            // console.log('design: ', design);
            // console.log('editor: ', this.editor);         
            
            if((design !== null) && ((this.editor !== null) && (this.editor.current !== null))) {
                this.editor.loadDesign(design)
                clearTimeout(this.watcher)
            } else if (design !== null) {
                this.checkAgain()
            } 
        } catch (error) {
            addAlert('Error', 'An error occured while saving your template. Please try again!', false, false);

            this.handleClose()
        }
    }

    checkAgain = () => {     
        this.watcher = setTimeout(() => {
            this.onLoad()
        }, 2000)
    }

    onEditorStateChange = (editor) => {
        const { addTextEditorText } = this.props;
        let newContent = draftToHtml(convertToRaw(editor.getCurrentContent()))
        this.setState({ textEditorText: editor }, () => addTextEditorText(newContent))
    }

    render() {
        const { link, poster, tag, letter, unsubcribe } = this.props;
        const { selectedMethod, textEditorText, alertError } = this.state;

        return (
            <div>
                {(document.body.clientWidth >= 1024) && (<div style={style.alignedRight}> 
                    <Button onClick={() => this.changeMethod()} circular size={'small'} color='pink' > 
                        <Icon name='setting' /> {(selectedMethod === 'editor')? 'Use Email Template' : 'Use Text Editor'}
                    </Button>
                </div>)}

                <Segment>
                    {(selectedMethod === 'editor') && (<div>
                        <Header>
                            <Header.Content>
                                Text Editor
                            </Header.Content>
                            <Header.Subheader>
                            {(unsubcribe) && (<div>
                                <Icon name='lightbulb' color='green' /> If you are using your follower's list to send invitation letter, you required to add unsubcribe link to your message
                            </div>)}
                            </Header.Subheader>
                        </Header>
                        <Divider />
                            <div style={{ zIndex: 1000 }}>
                                <Editor
                                editorState={textEditorText}
                                toolbarClassName="toolbarClassName"
                                wrapperClassName="wrapperClassName"
                                editorClassName="editorClassName"
                                placeholder='Start writing here...'
                                editorStyle={{border:"1px solid #f4f4f4", height:"300px"}}
                                onEditorStateChange={newContent => this.onEditorStateChange(newContent)}
                                />
                            </div>
                            <Divider />
                    </div>)}
                        
                    {(selectedMethod === 'template') && (<div>
                        
                        <Header>
                            <Header.Content>
                                Email Template
                            </Header.Content>
                        </Header>

                        <Button onClick={() => this.handleOpen()} circular size={'tiny'} > Open Email Template </Button>
                        
                        <Divider />

                    </div>)}


                    <Resources link={link} poster={poster} letter={letter} tag={tag} unsubcribe={unsubcribe}/>
                </Segment>

                <Modal
                    open={this.state.modalOpen}
                    // onClose={this.handleClose}
                    basic
                    size='fullscreen'
                >
                    <Header icon='html5' content='Create Your Email Template' subheader="Resources and save button are at the bottom of the page" inverted />
                    {(unsubcribe) && (<div style={{ backgroundColor: 'white', color: 'black', padding: '2px', borderRadius: '2px'}}>
                                <Icon name='lightbulb' color='green' /> If you are using your follower's list to send invitation letter, you required to add unsubcribe link to your message
                            </div>)}
                    <Modal.Content>
                        <Confirm
                            open={this.state.open}
                            content='Are you sure you want to exit email template?'
                            onCancel={this.handleCancel}
                            onConfirm={this.handleConfirm}
                            cancelButton='Never mind'
                            confirmButton="Exit"
                        />
                        <EmailEditor
                            ref={editor => this.editor = editor}
                            onLoad={() => this.onLoad()}
                        />
                        <Resources link={link} poster={poster} letter={letter} tag={tag} unsubcribe={unsubcribe}/>

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
