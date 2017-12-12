import React from 'react';
import ChatContainer from './ChatContainer/ChatContainer';
import SelectionSidebar from './SelectionSidebar/SelectionSidebar';
import OptionsSidebar from './OptionsSidebar/OptionsSidebar';
import fetchMessage from './fetchMessage';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      lastMessageJson: JSON.stringify({ test: 'hi' }),
      lastMessageContext: {},
    };
  }

  componentWillMount() {
    this.userInputEntered('user', '');
  }

  updateChatList(type, text) {
    this.setState({ messages: [...this.state.messages, { type, text }] });

    // autoscroll to bottom
    const chatContainer = document.getElementsByClassName('chat-list');
    if (chatContainer[0] !== undefined) {
      chatContainer[0].scrollTop = chatContainer[0].scrollHeight;
    }
  }

  updateOptionsSidebar(json) {
    this.setState({ lastMessageJson: json });
  }

  updateConversationContext(contextObj) {
    this.setState({ lastMessageContext: contextObj });
  }

  botResponseHandler(outputObj) {
    // always read the text from output
    outputObj.output.text.forEach((response) => {
      if (response !== '') {
        this.updateChatList('bot', response);
      }
    });

    // check for chat options in generic options object
    if (outputObj.output.generic !== undefined) {
      outputObj.output.generic.forEach((response) => {
        // update text responses at bot chat, and option responses as options
        if (response.response_type === 'text') {
          this.updateChatList('bot', response.text);
        } else if (response.response_type === 'option') {
          this.updateChatList('option', response.options);
        }
      });
    }
  }

  userInputEntered(type, text) {
    // add user message to state
    if (type !== 'option') {
      this.updateChatList(type, text);
    }

    fetchMessage(text, this.state.lastMessageContext)
      .then((data) => {
        // render appropriate data
        this.botResponseHandler(data);

        // send stringified JSON to sidebar
        this.updateOptionsSidebar(JSON.stringify(data));

        // update context
        this.updateConversationContext(data.context);
      })
      .catch((err) => {
        this.updateChatList('bot', 'An error has occured.');
        throw new Error(err);
      });
  }

  render() {
    return (
      <div className="ibm App">
        <SelectionSidebar />
        <ChatContainer
          messages={this.state.messages}
          chatOptions={this.state.chatOptions}
          onUserInput={(type, text) => { this.userInputEntered(type, text); }}
        />
        <OptionsSidebar json={this.state.lastMessageJson} />
      </div>
    );
  }
}

export default App;
