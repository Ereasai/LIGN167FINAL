import React from 'react';

const ChatInput = ({ inputText, setInputText, sendMessage }) => {
  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevents default newline on enter
      sendMessage();
    }
  };

  return (
    <div className="input-container">
      <textarea
        className="chat-input"
        placeholder="Type a message..."
        value={inputText}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
      ></textarea>
      <button className="send-button" onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatInput;
