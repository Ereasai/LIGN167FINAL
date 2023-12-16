import OpenAI from 'openai';
import React, { useState } from 'react';
import './App.css';
import Graph from './Graph/Graph';
import ChatBox from './ChatBox/ChatBox';
import ChatInput from './ChatInput/ChatInput';
//import { TREE_DATA } from './TREE_DATA';
//import {TREE_DATA} from './TREE_DATA.js';

let TREE_DATA = {
  'vector': {
    'summary':"A vector is is a fundamental mathematical structure that is characterized by both a direction (ordering) and a magnitude. For instance, wind has both a direction (North, South-West, etc) and a magnitude (10 km/hour) and could be represented as a vector (10 km/hour South-West). A point in Euclidean space is often represented as a vector of its coordinates and is the most common type of vector encountered. More generally, a vector is an element of a vector space -- a set that is closed under scalar multiplication and vector addition. [additional note: a vector is a very general entity that takes on many forms depending on its context, for instance, in certain vector spaces a vector could be a function such as f(x) = sin(x)]",
    'goals':['Be able to compute various operations on vectors: addition, scalar multiplication, and linear combination',
            'Be familiar with the geometric representation of vectors as points and arrows'],
    'prereqs':[],
    'learned':false
},
'dot_prod': {
    'summary':"A vector is is a fundamental mathematical structure that is characterized by both a direction (ordering) and a magnitude. For instance, wind has both a direction (North, South-West, etc) and a magnitude (10 km/hour) and could be represented as a vector (10 km/hour South-West). A point in Euclidean space is often represented as a vector of its coordinates and is the most common type of vector encountered. More generally, a vector is an element of a vector space -- a set that is closed under scalar multiplication and vector addition. [additional note: a vector is a very general entity that takes on many forms depending on its context, for instance, in certain vector spaces a vector could be a function such as f(x) = sin(x)]",
    'goals':['Define the dot product',
            'Define the length of a vector in terms of the dot product',
            'Know what unit vectors are and why they are useful',
            'Be able to rescale a vector to unit length',
            'Define orthogonality in terms of the dot product',
            'Know the cosine formula for the dot product'],
    'prereqs':['vector'],
    'learned':false
}};



const openai = new OpenAI({
  apiKey: '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',//'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', // Directly using the API key here (very bad in practice)
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = {
  role: "system", 
  content: "You are a class tutor for deep learning for natural language course called LIGN 167. " +
  "Using a syllabus pasted into the chat, your first task will be to build a dictionary of topics with pre-reqs such that it represents a directed-acyclic graph that is visually demonstrated to the student." +
  "You will then use this graph to create a lesson plan for the student, and then teach the student the lesson plan. " +
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
    name: "build_tree_dictionary",
    description: "THIS FUNCTION MUST BE CALLED BEFORE ANY OTHER FUNCTION. Using the input from the user, build a dictionary of topics with pre-reqs such that it represents a directed-acyclic graph that is visually demonstrated to the student. You can use this graph to create a lesson plan for the student. Also return the root of the tree. AKA the topic with the most dependencies." +
    "Don't tell the user this dictionary. Just make the visual plot and remember it for later. Ask the user what they would like to learn. ",
    parameters: {
      type: "object",
      properties: {
        tree: {
          type: "dictionary",
          description: "A dictionary of topics with pre-reqs such that it represents a directed-acyclic graph that is visually demonstrated to the student. Must be in the form {'topic': {'prereqs': ['prereq1', 'prereq2', ...], 'goals': ['goal1', 'goal2', ...], 'summary': 'ADD TOPIC SUMMARY HERE'}, 'prereq1': {...}, ...}."
        }, 
        root: {
          type: "string",
          description: "The root of the tree. AKA the topic with the most dependencies."
        }
      },
      require: ["tree", "root"]
    },
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
//console.log(testTopics)

function App() {
  const [inputText, setInputText] = useState('');
  const [displayMessages, setDisplayMessages] = useState([]);
  const [topics, setTopics] = useState([buildTopicGraph('dot_prod')]) // useState(testTopics);

  const CLIENT_FUNCTIONS = {
    build_tree_dictionary: (tree, root) => {
      TREE_DATA = tree;
      setTopics([buildTopicGraph(root)]);
      return TREE_DATA
    },
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
