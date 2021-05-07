import React, { Component } from 'react';
import { Modal, Button, Icon, Header, Confirm, Message } from 'semantic-ui-react';
// import { Editor } from 'react-draft-wysiwyg';
// import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
// import { EditorState, ContentState, convertFromHTML, convertToRaw } from 'draft-js'
// import draftToHtml from 'draftjs-to-html';
import EmailEditor from 'react-email-editor';
// import style from '../Style/Style';
import Resources from '../Views/Resources';

// import '../Style/editor.css'

export default class EnailEditor extends Component {
    constructor (props) {
        super(props)
        this.state = {
            modalOpen:  false,
            open: false,
            design: props.design,
            alertError: '',
            // emailTemplateText: props.emailTemplateText,
            // textEditorText: EditorState.createWithContent(
            //     ContentState.createFromBlockArray(
            //       convertFromHTML(props.textEditorText)
            //     )
            // ),
            loaded: false
        };
        this.editor = React.createRef()
    }

    componentWillUnmount() {
        clearTimeout(this.watcher)
    }

    handleOpen = () => this.setState({ modalOpen: true })

    handleClose = () => {
        const { closeEditor } = this.props;
        closeEditor()
        this.setState({ modalOpen: false, alertError: '' })
    }
    
    exportHtml = async () => {
        const { addHTML } = this.props;
        try {
            this.editor.exportHtml(data => {
                const { design, html } = data
                    this.editor.saveDesign(design => {
                        this.setState({ emailTemplateText: html, design: design, alertError: '' }, () => {
                            addHTML(html, design);
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

    onLoad = async () => {
        const { design, addAlert } = this.props;
        try {
            // console.log('design: ', design);
            // console.log('editor: ', this.editor);         
            await this.setState({ loaded: true });

            if((design !== null) && ((this.editor !== null) && (this.editor.current !== null))) {
                this.editor.loadDesign(design)
                clearTimeout(this.watcher)
            } else if (design !== null) {
                this.checkAgain()
            } 
        } catch (error) {
            addAlert('Error', 'An error occured while loading editor. Please try again!', false, false);

            this.handleClose()
        }
    }

    checkAgain = () => {     
        this.watcher = setTimeout(() => {
            this.onLoad()
        }, 2000)
    }

    // onEditorStateChange = (editor) => {
    //     const { addTextEditorText } = this.props;
    //     let newContent = draftToHtml(convertToRaw(editor.getCurrentContent()))
    //     this.setState({ textEditorText: editor }, () => addTextEditorText(newContent))
    // }

    render() {
        const { link, poster, tag, unsubcribe } = this.props;
        const {  alertError, loaded } = this.state;

        return (
            <div>
                <Button onClick={() => this.handleOpen()} circular size={'tiny'} > Open Drag & Drop Editor </Button>

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
                        {!loaded && (<h1 style={{ textAlign: 'center', marginTop: '10px'}}>Please wait for the editor to loaded <Icon loading name="spinner" /></h1>)}
                        <EmailEditor
                            ref={editor => this.editor = editor}
                            onLoad={() => this.onLoad()}
                        />
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
