import OpenAI from 'openai';
import React, { useState } from 'react';
import './App.css';
import Graph from './Graph';
import ChatBox from './ChatBox';
import ChatInput from './ChatInput';

const testTopics = [
  {
    name: 'SGD',
    related: [
      {
        name: 'Linear Algebra',
        related: [
          { name: 'Matrix Multiplication', related: [] },
          { name: 'Determinants', related: [] },
          { name: 'Transformations', related: [] },
        ]
      },
      {
        name: 'Multivariable Calculus',
        related: [
          {
            name: 'Derivatives', related: [
              { name: 'Single Variable', related: [] },
              { name: 'Multiple Variable', related: [] }
            ]
          }
        ]
      }
    ]
  },
  // ... more topics
];

const openai = new OpenAI({
  apiKey: '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', // Directly using the API key here (very bad in practice)
  dangerouslyAllowBrowser: true,
});

function App() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  
  const [topics, setTopics] = useState(testTopics);
  
  

  const sendMessage = async () => {
    const trimmed = inputText.trim();
    if (trimmed !== '') {

      setMessages(messages => [...messages, { user: 'You', text: trimmed }])
      // Clear input field after sending
      setInputText('');


      try {
        // Adjust the API call as per the correct usage of the OpenAI library
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{role: "user", content: trimmed}],
          max_tokens: 150,
          temperature: 1
        });
        
        const gptResponse = response.choices[0].message.content
        setMessages(messages => [...messages, { user: 'GPT', text: gptResponse }]);
      } catch (error) {
        console.error('Error calling OpenAI API:', error);
        // Handle error appropriately
      }
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <ChatBox messages={messages} />
        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          sendMessage={sendMessage}
        />

      </div>
      <div className="graph-container">
        <Graph topics={topics} />
      </div>
    </div>
  );
}

export default App;
