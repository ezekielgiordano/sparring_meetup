import React, { Component } from 'react';
import Message from '../components/Message';
import TextFieldWithSubmit from '../components/TextFieldWithSubmit';

class MessagesIndexContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      messages: [],
      message: ''
    }

    this.handleMessageReceipt = this.handleMessageReceipt.bind(this);
    this.handleClearForm = this.handleClearForm.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
  }

  componentDidMount() {
    fetch('/api/v1/users', {
      credentials: 'same-origin',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    .then((response) => {
      let { ok } = response;
      if (ok) {
        return response.json();
      }
    })
    .then((data) => {
      this.setState({user: data})
    })
    App.chatChannel = App.cable.subscriptions.create(
      // Info that is sent to the subscribed method
      {
        channel: 'ChatChannel',
        chat_id: 1
        // If you had router, you could do:
        // chat_id: this.props.params["id"]
      },
      {
        connected: () => console.log("ChatChannel connected"),
        disconnected: () => console.log("ChatChannel disconnected"),
        received: data => {
          // Data broadcasted from the chat channel
          console.log(data)
          this.handleMessageReceipt(data)
        }
      }
    );
  }

  handleMessageReceipt(message) {
    this.setState({ messages: this.state.messages.concat(message) })
  }

  handleClearForm() {
    this.setState({ message: '' })
  }

  handleFormSubmit(event) {
    event.preventDefault();
    let prepMessage = this.state.message
    let user_info = this.state.user

    // Send info to the receive method on the back end
    App.chatChannel.send({
     message: prepMessage,
     user: user_info
    })

    this.handleClearForm();
  }

  handleMessageChange(event) {
    this.setState({ message: event.target.value })
  }

  render() {
    let messages = this.state.messages.map(message => {
      return(
        <Message
          key={message.messageId}
          username={message.user[0].username}
          message={message.message}
        />
      )
    }, this);

    return(
      <div>
        <div>
          {messages}
        </div><br/>
        <form onSubmit={this.handleFormSubmit}>
          <TextFieldWithSubmit
            content={this.state.message}
            name='message'
            handlerFunction={this.handleMessageChange}
          />
        </form>
      </div>
    );
  }
}

export default MessagesIndexContainer
