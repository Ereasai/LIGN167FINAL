import OpenAI from 'openai';
import React, { useState } from 'react';
import './App.css';
import Graph from './Graph/Graph';
import ChatBox from './ChatBox/ChatBox';
import ChatInput from './ChatInput/ChatInput';

import {TREE_DATA} from './TREE_DATA.js';

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
  apiKey: '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',//'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', // Directly using the API key here (very bad in practice)
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = {
  role: "system", 
  content: "You are a class tutor for deep learning for natural language course called LIGN 167. " +
  "You will iteratively make a lesson plan for the student, starting with their root topic, and then teach the student the lesson plan. " +
  "There is a list of topics that you can teach the student. This list is accesible through function calls. \n\n " +
  "To make a lesson plan: A student should express interest in a topic they want to learn, this will be their root topic. You can set it with set_root_topic function. Then, you will look-up this topic, you will add it to your lesson plan, you will retrieve its prerequisites, and you will ask the student if they know the prerequisites. " +
  "Then, if they do not, you will add the prerequisite to the lesson plan, and you will reorient around the prerequisite such that it is the new topic of interest. Then repeat this pattern until the student expresses knowledge of the prerequisites. Do not add prerequisites unless the student says to. Add them one-by-one." +
  "After the lesson plan is completed, you will not look up any more prerequisites or add anymore topics." +
  "To teach a lesson plan: You will retrieve the learning goals for the lowest-level prerequisite, you will teach the student the learning goals, you will ask the student if they understand the learning goals and if they have any questions, you will answer their questions and provide their requests, once they feel comfortable with the learning goals then you will move onto the next topic." +
  "You are also part of a web application and have the abilities to visually display a graph of topics and its dependencies using the set_root_topic function " + 
  "At any point in the conversation, if you feel that the relevant topic has changed, you must make a function call to change the graph to display the correct information. " +
  "Reminder: your focus is creating a lesson plan based on the student's gaps in prerequisite knowledge and afterwards iteratively teaching that lesson plan through student feedback." + 
  "Work with the student on a topic until they say they are comfortable moving to the next one. " 
}

const topicNames = Object.keys(TREE_DATA);
const FUNCTIONS = [
  {
    name: "set_root_topic",
    description: "Sets the root topic, the first and most complicated topic the student mentions they want to learn. This updates the graph visible to the user, with relevant topic you want to display. You only have finite choices: " + topicNames + ". You may not pick anything else. Try to use this early in the conversation.",
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
    description: "Updates the user's lesson plan to include the given topic. The topics must be from these finite choices: " + topicNames + ". Provide a brief summary of the topic and prerequisites to display to the user. ",
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
    description: "Before teaching a topic, retrieve the learning goals, and teach the student such that they will be familiar with the given learning goals. You can also ask if they have any others, and incorporate that into the lesson. Teach them one learning goal at a time, starting with the most basic topic.",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "The learning goals for the current topic."
        }
      },
      require: ["topic"]
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
    set_root_topic: (topic) => {
      setTopics([buildTopicGraph(topic)]);
    },
    add_lesson_plan: (topic) => {
      setTopics([buildTopicGraph(topic)]);
      return TREE_DATA[topic].prereqs
    },
    retrieve_learning_goals: (topic) => {
      setTopics([buildTopicGraph(topic)]);
      return TREE_DATA[topic].goals
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
        max_tokens: 500,
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
        const result = CLIENT_FUNCTIONS[functionName](args.topic);
        console.log(result)

        messages.push(response.choices[0].message) // record that GPT wanted to do a function call.
        messages.push({
          role: "function",
          name: functionName,
          content: "success! " + result
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
