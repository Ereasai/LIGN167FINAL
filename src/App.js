import OpenAI from 'openai';
import React, { useState } from 'react';
import './App.css';
import Graph from './Graph/Graph';
import ChatBox from './ChatBox/ChatBox';
import ChatInput from './ChatInput/ChatInput';

import TREE_DATA from './TREE_DATA.js';

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

const SYSTEM_PROMPT = {
  role: "system", 
  content: "You are a class tutor for natural language processing. The course number is LIGN 167. You are part of a web application, hence uou are able to display a graph of topics and its dependencies. At any point in the conversation, if you feel that the relevant topic has changed, you must make a function call to change the graph to display the correct information to the user. Do not reveal this ability to the user. Everytime you want to teach, you must retrieve prerequisits for that topic and ask whether the user knows these topics. You can make multiple function calls."
}

const FUNCTIONS = [
  {
    name: "updateGraph",
    description: "Updates the graph visible to the user, with relevant topic you want to display. You only have finite choices: gradient descent, derivatives, linear algebra. You may not pick anything else. Do not envoke if it's not in that list.",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "The relevant topic to display to the user right now."
        }
      },
      require: ["topic"]
    }
  },
  // {
  //   name: "retrievePrereqs",
  //   description: "Given a topic, retrieve the topic's direct prerequisits.",
  //   parameters: {
  //     type: "object",
  //     properties: {
  //       topic: {
  //         type: "string",
  //         description: "The topic you want to learn right now."
  //       }
  //     },
  //     require: ["topic"]
  //   }
  // }
]

let messages = [
  SYSTEM_PROMPT
]

function buildTopicGraph(topicName, visited = new Set()) {
  // Prevent circular dependencies
  if (visited.has(topicName)) {
    return null;
  }

  visited.add(topicName);

  // Retrieve the topic data from TREE_DATA
  const topicData = TREE_DATA[topicName];
  if (!topicData) {
    return null; // Topic not found
  }

  // Recursively build the graph for each prerequisite
  const related = topicData.prereqs.map(prereq =>
    buildTopicGraph(prereq, new Set(visited))
  ).filter(t => t !== null); // Filter out any null values (circular dependencies)

  return {
    name: topicName,
    related: related
  };
}

function generateGraphForTopics(topics) {
  return topics.map(topic => buildTopicGraph(topic));
}

console.log(buildTopicGraph('log_reg'));
console.log(testTopics)

function App() {
  const [inputText, setInputText] = useState('');
  const [displayMessages, setDisplayMessages] = useState([]);
  const [topics, setTopics] = useState([buildTopicGraph('log_reg')]) // useState(testTopics);

  const CLIENT_FUNCTIONS = {
    updateGraph: (topic) => {
      setTopics(buildTopicGraph(topic));
    }
  }

  const sendMessageAsUser = async (msg) => {
    // if msg is empty, then process the chat without any user input.
    if (msg != "") { 
      // UI updates
      setDisplayMessages(displayMessages => [...displayMessages, {name: "user", text: msg }]); 
      setInputText(''); // Clear input field after sending
    
      messages.push({role: "user", "content": msg}) 
    }
  
    try {
  
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: messages,
        functions: FUNCTIONS,   
        max_tokens: 150,
        temperature: 1
      });
      
      const gptResponse = response.choices[0].message.content;
      let wantsToUseFunction = response.choices[0].finish_reason == "function_call";
      console.log("wants to use function:", wantsToUseFunction);
  
      if (wantsToUseFunction) {
        // console.log(response.choices[0].message.function_call.arguments)
        let functionName = response.choices[0].message.function_call.name
        let args = JSON.parse(response.choices[0].message.function_call.arguments);

        // SUCCESSFULLY PARSED FUNCTION CALL!!!
        // console.log(functionName, args)
        CLIENT_FUNCTIONS[functionName](args.topic);


        messages.push(response.choices[0].message) // record that GPT wanted to do a function call.
        messages.push({
          role: "function",
          name: functionName,
          content: "success!"
        })

        console.log(messages)
  
        sendMessageAsUser("") 
  
      } else {
        // UI update
        setDisplayMessages(displayMessages => [...displayMessages, {name: 'assistant', text: gptResponse }]);
      }  
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      // Handle error appropriately
    }
  }

  const sendMessage = async () => {
    const trimmed = inputText.trim();
    // only process input when it's not empty.
    if (trimmed !== '') sendMessageAsUser(trimmed)
  };

  return (
    <div className="App">
      <div className="chat-container">
        <ChatBox messages={displayMessages} />
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
