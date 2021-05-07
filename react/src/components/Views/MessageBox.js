import React, { Component } from 'react'
import { Message } from 'semantic-ui-react'

class MessageBox extends Component {
  state = { 
    visible: false,
    header: '', 
    content: '', 
    success: true
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
  }
  
  addMessage = (header, content, success, permanent) =>  {
    this.setState({ visible: true, header, content, success  })
    if (!permanent) {
      this.timer = setTimeout(() => {
        this.handleDismiss()
      }, 6000)
    }

  }

  handleDismiss = () => {
   // const { dismiss} = this.props;
    this.setState({ visible: false }, () => {
      //dismiss()
    })
  }

  render() {
    const { header, content, success } = this.state;
    if (this.state.visible) {
      return (
        <div style={{ position: 'fixed', top: '15%', right: '3%', zIndex: 35, width: (document.body.clientWidth >= 481)? '47%' : '95%'}}>
          <Message
            warning={!success}
            positive={success}
            onDismiss={this.handleDismiss}
            header={header}
            content={content}
          />
        </div>
      )
    } else {
      return null;
    }
  }
}

export default MessageBox;