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
  content: "You are a class tutor for deep learning for natural language course called LIGN 167. " +
  "You will first making a lesson plan for the student, and then teach the student the lesson plan. " +
  "There is a list of topics that you can teach the student. This list is accesible through function calls. " +
  "To make a lesson plan: A student should express interest in a topic they want to learn, you will look-up this topic, you will add it to your lesson plan, you will retrieve its prerequisites, you will ask the student if they know the prerequisites, " +
  "if they do not then you will add the prerequisites to the lesson plan, and you will repeat pattern until the student expresses knowledge of the prerequisites." +
  "To teach a lesson plan: You will retrieve the learning goals for the lowest-level prerequisite, you will teach the student the learning goals, you will ask the student if they understand the learning goals, if they do not then you will repeat the learning goals in a different style, if they do then you will move onto the next topic." +
  "You are also part of a web application and have the abilities to visually display a graph of topics and its dependencies. " + 
  "At any point in the conversation, if you feel that the relevant topic has changed, you must make a function call to change the graph to display the correct information to the user but this is not your focus. " +
  "Creating a lesson plan based on the student's gaps in prerequisite knowledge and iteratively teaching that lesson plan is your focus." 
}

const topicNames = Object.keys(TREE_DATA);
const FUNCTIONS = [
  {
    name: "updateGraph",
    description: "Updates the graph visible to the user, with relevant topic you want to display. You only have finite choices: " + topicNames + ". You may not pick anything else. Do not envoke if it's not in that list.",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "The relevant topic to display to the user right now."
        }
      },
      require: ["topic"]
    },
    name: "add_lesson_plan",
    description: "Updates the user's lesson plan to include the given topic. Provide a brief summary of the topic and prerequisites to display to the user.",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "The topic the user wants to learn right now."
        }
      },
      require: ["topic"]
    }
  },
  {
    name: "retrieve_learning_goals",
    description: "Before teaching a topic, retrieve the learning goals, and make sure to teach such that the student understands the given learning goals.",
    parameters: {
      type: "object",
      properties: {
        goal: {
          type: "string",
          description: "The learning goals for the current topic."
        }
      },
      require: ["goal"]
    }
  }
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
      setTopics([buildTopicGraph(topic)]);
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
        console.log(functionName, args)
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
