import React, { useEffect, useRef } from 'react';

const ChatBox = ({ messages }) => {
  const chatBoxRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom of the chat box when messages update
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-box" ref={chatBoxRef}>
      {messages.map((message, index) => (
        <div key={index}>{`${message.user}: ${message.text}`}</div>
      ))}
    </div>
  );
};

export default ChatBox;