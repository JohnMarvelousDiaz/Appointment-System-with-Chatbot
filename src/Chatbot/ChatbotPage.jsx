import React, { Component } from 'react';
import './ChatbotPage.css';
import { firebase, firestore } from '../firebase-config';
class ChatbotComponent extends Component {
  constructor(props) {
    super(props);
    this.chatboxRef = React.createRef();

    this.state = {
      userMessage: '',
      inputInitHeight: 0,
      chatboxContent: [],
      chatHistory: [],
    };

    this.chatInputRef = React.createRef();
  }

  createChatLi(message, className) {
    const chatboxContent = [...this.state.chatboxContent];
    const id = Date.now();

    chatboxContent.push({
      message,
      className,
      id,
    });

    this.setState({
      chatboxContent,
    });
  }


  async handleChat() {
    const userMessage = this.state.userMessage.trim();

    if (!userMessage) return;

    this.chatInputRef.current.value = "";
    this.setState({ userMessage: '' });

    const user = firebase.auth().currentUser;

    const chatHistory = [...this.state.chatHistory];

    chatHistory.push({
      message: userMessage,
      isBotMessage: false,
      timestamp: Date.now(),
    });

    chatHistory.push({
      message: "Thinking...",
      isBotMessage: true,
      timestamp: Date.now() + 1,
    });

    this.setState({
      chatHistory,
    });

    try {
      const botResponse = await this.getChatbotResponse(userMessage);

      chatHistory.pop();
      chatHistory.push({
        message: botResponse,
        isBotMessage: true,
        timestamp: Date.now() + 2,
      });

      firestore.collection('userMessages').add({
        message: userMessage,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        user: user.uid,
      });

      firestore.collection('botMessages').add({
        message: botResponse,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        user: user.uid,
        isBotMessage: true,
      });

      this.setState({
        chatHistory,
      });

      if (this.chatboxRef.current) {
        this.chatboxRef.current.scrollTop = this.chatboxRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Error getting chatbot response:', error);
    }

    setTimeout(() => {
      if (this.chatboxRef.current) {
        this.chatboxRef.current.scrollTop = this.chatboxRef.current.scrollHeight;
      }
    }, 1000);
  }



  scrollToLastLine() {
    const chatbox = this.chatInputRef.current;
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  async getChatbotResponse(userMessage) {
    const responseRef = firestore.collection('chatbotResponses').doc(userMessage.toLowerCase());

    try {
      const doc = await responseRef.get();

      if (doc.exists) {
        const response = doc.data().response;
        return response;
      } else {
        return "I'm sorry, I didn't understand that. Can you please rephrase your question?";
      }
    } catch (error) {
      console.error('Error getting response from Firestore:', error);
      return "I'm sorry, there was an error processing your request.";
    }
  }

  retrieveUserMessages = async () => {
    const user = firebase.auth().currentUser;

    if (user) {
      const userMessagesRef = firestore.collection('userMessages')
        .where('user', '==', user.uid)
        .orderBy('timestamp');

      const botMessagesRef = firestore.collection('botMessages')
        .where('user', '==', user.uid)
        .orderBy('timestamp');

      try {
        const [userQuerySnapshot, botQuerySnapshot] = await Promise.all([
          userMessagesRef.get(),
          botMessagesRef.get(),
        ]);

        const chatHistory = [];

        userQuerySnapshot.forEach((doc) => {
          chatHistory.push({
            message: doc.data().message,
            isBotMessage: doc.data().isBotMessage || false,
            timestamp: doc.data().timestamp,
          });
        });

        botQuerySnapshot.forEach((doc) => {
          chatHistory.push({
            message: doc.data().message,
            isBotMessage: true,
            timestamp: doc.data().timestamp,
          });
        });

        chatHistory.sort((a, b) => a.timestamp - b.timestamp);

        this.setState({ chatHistory });
      } catch (error) {
        console.error('Error retrieving user messages:', error);
      }
    }
  };






  componentDidMount() {

    document.querySelector('.chatbox').addEventListener('click', this.handleButtonClick);

    firestore.collection('chatbotMessages').doc('initialMessage').get()
      .then((doc) => {
        if (doc.exists) {
          const initialMessage = doc.data().message;

          this.createChatLi(initialMessage, 'incoming');
        } else {
          console.log('No such document!');
        }
      })
      .catch((error) => {
        console.log('Error getting document:', error);
      })
      .finally(() => {
        this.retrieveUserMessages();
      });
  }



  componentWillUnmount() {

    document.querySelector('.chatbox').removeEventListener('click', this.handleButtonClick);
  }

  handleButtonClick = async (event) => {

    if (event.target.tagName === 'BUTTON') {

      const buttonId = event.target.id;
      const buttonText = event.target.innerText;

      const fieldName = buttonId.replace('-', '');

      try {
        const user = firebase.auth().currentUser;
        if (user) {

          await firestore.collection('userMessages').add({
            message: buttonText,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            user: user.uid,
          });
        }

        const chatHistory = [...this.state.chatHistory];
        chatHistory.push({
          message: buttonText,
          isBotMessage: false,
          timestamp: Date.now(),
        });

        this.setState({
          chatHistory,
        });

        const responseDoc = await firestore.collection('buttonResponses').doc(buttonId).get();

        if (responseDoc.exists) {
          const botResponse = responseDoc.data().response;

          chatHistory.push({
            message: botResponse,
            isBotMessage: true,
            timestamp: Date.now() + 1,
          });

          this.setState({
            chatHistory,
          });

          if (user) {
            await firestore.collection('botMessages').add({
              message: botResponse,
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              user: user.uid,
              isBotMessage: true,
            });
          }

          const totalClicksDoc = firestore.collection('buttonClick').doc('totalClicks');

          firestore.runTransaction(async (transaction) => {
            const doc = await transaction.get(totalClicksDoc);

            if (doc.exists) {

              const countFieldName = fieldName;
              const count = doc.data()[countFieldName] || 0;
              transaction.update(totalClicksDoc, { [countFieldName]: count + 1 });
            } else {

              const countFieldName = fieldName;
              transaction.set(totalClicksDoc, { [countFieldName]: 1 }, { merge: true });
            }
          });


          if (this.chatboxRef.current) {
            this.chatboxRef.current.scrollTop = this.chatboxRef.current.scrollHeight;
          }
        } else {

          console.error('Button response document does not exist.');
        }
      } catch (error) {
        console.error('Error getting button response from Firestore:', error);
      }
    }
  };


  updateChatboxWithResponse(response) {
    const chatboxContent = [...this.state.chatboxContent];
    const lastMessage = chatboxContent[chatboxContent.length - 1];

    if (lastMessage.className === "incoming" && lastMessage.message === "Thinking...") {
      lastMessage.message = response;
      this.setState({
        chatboxContent,
      });
    }
  }



  toggleChatbot() {
    document.body.classList.toggle("show-chatbot");
  }

  render() {
    setTimeout(() => {
      const chatbox = document.querySelector('.chatbox');
      if (chatbox) {
        chatbox.scrollTop = chatbox.scrollHeight;
      }
    }, 0);



    return (
      <div>
        <button
          className="chatbot-toggler"
          onClick={() => this.toggleChatbot()}
        >
          <img
            src={require('../images/chatbot_toggle.png')}
            alt="chatbot toggler"
            className="chatbot-toggle-img"
          />
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="chatbot">
          <header>
            <img
              src={require('../images/chatbot_toggle.png')}
              alt="chatbot logo"
              className="chatbot-header-img"
            />
            <h2>CICT CHATBOT SYSTEM</h2>
            <p>Bulacan State University</p>
            <span className="close-btn material-symbols-outlined">close</span>
          </header>
          <ul className="chatbox" ref={this.chatboxRef}>
            <button
              style={{ display: 'none' }}
              data-testid="handle-button"
              onClick={() => {
                // Handle the testing action here
                // For example, you can set a flag or trigger a specific response
              }}
            >
              Hidden Test Button
            </button>
            {/* Render chatboxContent */}
            {this.state.chatboxContent.map((item, index) => (
              <li
                key={item.id}
                className={`chat ${item.className}`}
                ref={index === this.state.chatboxContent.length - 1 ? this.lastChatRef : null}
              >
                {item.className === "incoming" ? (
                  <img
                    src={require('../images/chatbot_logo.png')}
                    alt="chatbot toggler"
                    className="chatbot-logo-img"
                  />
                ) : null}
                {/* Render the message as HTML */}
                <p dangerouslySetInnerHTML={{ __html: item.message }}></p>
              </li>
            ))}
            {this.state.chatHistory.map((item, index) => (
              <li
                key={index}
                className={`chat ${item.isBotMessage ? 'incoming' : 'outgoing'}`}
                ref={index === this.state.chatHistory.length - 1 ? this.lastChatRef : null}
              >
                {item.isBotMessage && (
                  <img
                    src={require('.././images/chatbot_logo.png')}
                    alt="chatbot toggler"
                    className="chatbot-logo-img"
                  />
                )}
                <p dangerouslySetInnerHTML={{ __html: item.message }}></p>
              </li>
            ))}
          </ul>

          <div className="chat-input">
                <p>Powered by:</p> <h1>TEAM NOSASCEND</h1>
                <img
                    src={require('.././images/nosascend-logo.png')}
                    alt="nosascend-logo"
                    className="nosascend"
                  />
            
          </div>
        </div>
      </div>
    );
  }
}

export default ChatbotComponent;