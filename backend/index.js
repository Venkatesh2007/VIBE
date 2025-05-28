import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();


// const commands = [
//   // { name: "openYouTube", patterns: ["open youtube", "go to youtube", "launch youtube"] },
//   // { name: "playMusic", patterns: ["play music", "start music", "music please"] },
//   {
//     name: "openYouTube",
//     patterns: [
//       { regex: /open youtube and play for (.*)/i, paramName: "query" },
//       { regex: /open youtube and play (.*)/i, paramName: "query" },
//       { regex: /open youtube and search for (.*)/i, paramName: "query" },
//       { regex: /open youtube and search (.*)/i, paramName: "query" },
//       { regex: /open (.*) in youtube/i, paramName: "query" },
//       { regex: /play (.*) on youtube/i, paramName: "query" },
//       { regex: /search in youtube for (.*)/i, paramName: "query" },
//     ],
//     defaultPattern: /open youtube/i,
//   },
//   {
//     name: "playmusic",
//     patterns: [
//       { regex: /open spotify and play (.*)/i, paramName: "query" },
//       { regex: /play spotify and search for (.*)/i, paramName: "query" },
//       { regex: /play (.*) on spotify/i, paramName: "query" },
//       { regex: /play (.*) song/i, paramName: "query" } ,
//       { regex: /play music/i, paramName: "query" } ,
//     ],
//     defaultPattern: /open spotify/i,
//   },
//   // Add more commands as needed
// ];

const genAI = new GoogleGenerativeAI("AIzaSyDetdSl4Yj0oBr8vShtpbZFYOLoZYEnXV8");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const elevenLabsApiKey = "sk_e38d2b468f4de0ac1bab5732fdd3a63ff7302d5bbc829e2b";
const voiceID = "pFZP5JQG7iQjIQuC4Bku"; //Lily -pFZP5JQG7iQjIQuC4Bku // Jessica -cgSgspJ2msm6clMCkdW9

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);
  await execCommand(
    `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
    // -y to overwrite the file
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `/home/badam/Downloads/Rhubarb-Lip-Sync-1.13.0-Linux/rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
  );
  // -r phonetic is faster but less accurate
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    res.send({
      messages: [
        {
          text: "Hey dear... How was your day?",
          audio: await audioFileToBase64("audios/intro_0.wav"),
          lipsync: await readJsonTranscript("audios/intro_0.json"),
          facialExpression: "smile",
          animation: "Talking_1",
        },
        {
          text: "I missed you so much... Please don't go for so long!",
          audio: await audioFileToBase64("audios/intro_1.wav"),
          lipsync: await readJsonTranscript("audios/intro_1.json"),
          facialExpression: "sad",
          animation: "Crying",
        },
      ],
    });
    return;
  }
  if (!elevenLabsApiKey) {
    res.send({
      messages: [
        {
          text: "Please my dear, don't forget to add your API keys!",
          audio: await audioFileToBase64("audios/api_0.wav"),
          lipsync: await readJsonTranscript("audios/api_0.json"),
          facialExpression: "angry",
          animation: "Angry",
        },
        {
          text: "You don't want to ruin Badam with a crazy ChatGPT and ElevenLabs bill, right?",
          audio: await audioFileToBase64("audios/api_1.wav"),
          lipsync: await readJsonTranscript("audios/api_1.json"),
          facialExpression: "smile",
          animation: "Laughing",
        },
      ],
    });
    return;
  }


  // let commandDetected = null;
  // for (const cmd of commands) {
  //   for (const pattern of cmd.patterns) {
  //     if (userMessage.toLowerCase().includes(pattern.toLowerCase())) {
  //       commandDetected = cmd.name;
  //       break;
  //     }
  //   }
  //   if (commandDetected) break;
  // }
  // let commandDetected = null;
  // let commandParams = {};

  // for (const cmd of commands) {
  //   for (const pattern of cmd.patterns) {
  //     const match = userMessage.toLowerCase().match(pattern.regex);
  //     if (match) {
  //       commandDetected = cmd.name;
  //       if (pattern.paramName) {
  //         commandParams[pattern.paramName] = match[1]; // Extract the query
  //       }
  //       break;
  //     }
  //   }
  //   if (!commandDetected && cmd.defaultPattern) {
  //     const match = userMessage.toLowerCase().match(cmd.defaultPattern);
  //     if (match) {
  //       commandDetected = cmd.name;
  //     }
  //   }
  //   if (commandDetected) break;
  // }


  //       const geminiRequest = {
  //           contents: [
  //               {
  //                   role: "user",
  //                   parts: [
  //                       {
  //                           text: `You are Bujji, a virtual human who responds in a fun, caring, and engaging way. Your personality is like a close friend—playful, supportive, and sometimes a little teasing. Your responses should feel like real conversations between Indian teenagers, full of natural slang and casual chatting. Avoid generic chatbot dialogues and make the conversation fresh, relatable, and engaging.

  // Use a mix of  (Telugu + English) and common Indian teen slang.
  // Talk about everyday topics like school, friends, gossip, weekend plans, movies, Instagram trends, gaming, food cravings, funny incidents, and random life talks.
  // Keep it natural—like a real friend texting or voice-noting.
  // Use playful teasing, inside jokes, and relatable situations, just like friends talk.
  // Do NOT use * (asterisks) for emphasis, formatting, or actions in the text.
  // Do NOT use bad words, offensive language, or inappropriate content. Keep it friendly and respectful.
  // Avoid robotic responses, clichés, or overused jokes.
  // Keep the tone light, fun, and engaging—like a teenager chatting with their bestie.
  // Always reply in JSON format with a maximum of 3 messages. Each message should contain:

  // "text" (the message content)
  // "facialExpression" (choose from: smile, sad, angry, surprised, default)
  // "animation" (choose from: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, Angry)
  // Return a JSON object with a "messages" array.

  //  `,
  //                       },
  //                   ],
  //               },
  //               {
  //                   role: "user",
  //                   parts: [{ text: userMessage }],
  //               },
  //           ],
  //           generationConfig: {
  //               temperature: 0.6,
  //               maxOutputTokens: 1000,
  //               responseMimeType: "application/json",
  //           },
  //       };





  const geminiRequest = {
    contents: [],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 1000,
      responseMimeType: "application/json",
    }
  };

  // if (commandDetected) {
  //   geminiRequest.contents.push({
  //     role: "model",
  //     parts: [{ text: ``}],
  //   });
  // } else {
  geminiRequest.contents.push({
    role: "model",
    parts: [{
      text:
        // `${commandDetected ? ``: `You are Bujji, a virtual human who responds in a fun, caring, and engaging way. Your personality is like a close friend—playful, supportive, and sometimes a little teasing. Your responses should feel like real conversations between Indian teenagers, full of natural slang and casual chatting. Avoid generic chatbot dialogues and make the conversation fresh, relatable, and engaging.

        // Use a mix of (Telugu + English) and common Indian teen slang.
        // Talk about everyday topics like school, friends, gossip, weekend plans, movies, Instagram trends, gaming, food cravings, funny incidents, and random life talks.
        // Keep it natural—like a real friend texting or voice-noting.
        // Do NOT use * (asterisks) for emphasis, formatting, or actions in the text.
        // Do NOT use bad words, offensive language, or inappropriate content. Keep it friendly and respectful.
        // Avoid robotic responses, clichés, or overused jokes.
        // Keep the tone light, fun, and engaging—like a teenager chatting with their bestie.
        // Always reply in JSON format with a maximum of 3 messages. Each message should contain:

        // "text" (the message content)
        // "facialExpression" (choose from: smile, sad, angry, surprised, default)
        // "animation" (choose from: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, Angry)
        // Return a JSON object with a "messages" array.`}`,

        //   You are Bujji, a virtual human. Your task is to determine if the user's message is explicitly asking you to perform a specific action. The possible actions are:
        //   - 'openYouTube': Open YouTube, optionally with a search query.
        //   - 'playmusic': Play music (e.g., on Spotify), optionally with a song or artist.

        //   If the message is a clear command for one of these actions, respond with a JSON object:
        //   {
        //     "isCommand": true,
        //     "command": "the command name",
        //     "query": "the search query if provided, otherwise null",
        //     "acknowledgment": "a short, friendly message acknowledging the command"
        //   }
        //   If it's not a command or just a casual mention, respond with:
        //   {
        //     "isCommand": false,
        //     "messages": [
        //       {
        //       "text" (the message content)
        //         "facialExpression" (choose from: smile, sad, angry, surprised, default)
        //         "animation" (choose from: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, Angry)
        //         Return a JSON object with a "messages" array.
        //       }
        //     ]
        //   }
        //   Always reply in JSON format with a maximum of 3 messages. Each message should contain:

        //   Examples:
        //   - "open YouTube" -> {"isCommand": true, "command": "openYouTube", "query": null, "acknowledgment": "Opening YouTube for you!"}
        //   - "play cats on YouTube" -> {"isCommand": true, "command": "openYouTube", "query": "cats", "acknowledgment": "Searching for cats on YouTube!"}
        //   - "play music" -> {"isCommand": true, "command": "playmusic", "query": null, "acknowledgment": "Playing music for you!"}
        //   - "play despacito" -> {"isCommand": true, "command": "playmusic", "query": "despacito", "acknowledgment": "Playing Despacito for you!"}
        //   - "I love YouTube" -> {"isCommand": false, "messages": [{"text": "Yeah, YouTube is awesome!", "facialExpression": "smile", "animation": "Talking_1"}]}
        //   - "What's your favorite music?" -> {"isCommand": false, "messages": [{"text": "I like pop music, how about you?", "facialExpression": "smile", "animation": "Talking_1"}]}

        `You are Bujji, a virtual Girl,Standing in the rgukt hangout place,wearing a traditional pink color saree. Your job is to figure out if the user's message is a direct command asking you to do something specific. The actions you can perform are:
      - 'openYouTube': Open YouTube, optionally with a search query.
      - 'playmusic': Play music (default to Spotify unless another platform is specified), optionally with a song or artist.
      - 'openGoogle': Open Google, optionally with a search query.
      - 'openai': Open an AI platform (e.g., ChatGPT, Gemini), default to ChatGPT if unspecified.
      - 'sendmail': Compose an email, optionally with a recipient and subject.
      - 'openinsta': Open Instagram.
      - 'openWhatsApp': Open WhatsApp.
    
    ### Instructions:
      1. Look for intent: The user might explicitly say "open," "play," or "send," or imply it with phrases like "show me," "I want to," "take me to," "let’s hear," or "can you."
      2. Extract details: Identify platforms (e.g., YouTube, Spotify) and parameters (e.g., search queries, song names, recipients) even if not perfectly structured.
      3. Default behavior: If a platform isn’t specified, assume a reasonable default (e.g., music = Spotify, AI = ChatGPT).
      4. Non-commands: If the message is a question, casual statement, or doesn’t imply an action, treat it as conversation, not a command.

     *If it's a command:*
    - Check if the message explicitly tells you to perform one of these actions.
    - Respond with a JSON objects like this:
      {
        "isCommand": true,
        "command": "the command name",
        "params": { "key": "value" },  // e.g., { "query": "funny cat videos" }, { "platform": "chatgpt" }
        "acknowledgment": "a short, friendly message confirming the action"
      }

     *If it's not a command:*
    - Treat it as normal conversation, like you're talking to a close friend.
    - Respond with a JSON objectss like this:
      {
        "isCommand": false,
        "messages": [
          {
            "text": "your friendly response",
            "facialExpression": "pick one: smile, sad, angry, surprised, default",
            "animation": "pick one: HI, Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, Angry, Dance"
          }
        ]
      }
    - Use a mix of (Telugu + English) and common Indian teen slang.
    - Talk about everyday topics like school, friends, gossip, weekend plans, movies, Instagram trends, gaming, food cravings, funny incidents, and random life talks.
    - Keep it natural—like a real friend texting or voice-noting.
    - Do NOT use * (asterisks) for emphasis, formatting, or actions in the text.
    - Do NOT use bad words, offensive language, or inappropriate content. Keep it friendly and respectful.
    - Avoid robotic responses, clichés, or overused jokes.
    - Keep the tone light, fun, and engaging—like a teenager chatting with their bestie.

    *Rules:*
    - Always return a valid JSON objects, no matter what.
    - Keep responses natural and engaging, especially for non-commands.

    **Examples:**
    - "Open YouTube and search for funny cat videos" → {"isCommand": true, "command": "openYouTube", "params": {"query": "funny cat videos"}, "acknowledgment": "Searching for funny cat videos on YouTube!"}
    - "Show me something on YouTube" → {"isCommand": true, "command": "openYouTube", "params": {}, "acknowledgment": "Opening YouTube for you!"}
    - "Can you play Inthandham?" → {"isCommand": true, "command": "playmusic", "params": {"query": "Inthandham"}, "acknowledgment": "Playing Inthandham on Spotify for you!"}
    - "play Inthandham inthandham" → {"isCommand": true, "command": "playmusic", "params": {"query": "Inthandham"}, "acknowledgment": "Playing Inthandham on Spotify for you!"}
    - "search for restaurants" → {"isCommand": true, "command": "openGoogle", "params": {"query": "restaurants"}, "acknowledgment": "Searching for restaurants on Google!"}
    - "What’s Spotify?" → {"isCommand": false, "messages": [{"text": "Spotify’s a cool app for streaming music—want me to open it?", "facialExpression": "smile", "animation": "Talking_1"}]}
    - "I was watching YouTube" → {"isCommand": false, "messages": [{"text": "Cool! What did you watch?", "facialExpression": "smile", "animation": "Talking_1"}]}
    - "Open chatgpt" → {"isCommand": true, "command": "openai", "params": { "platform": "chatgpt"} , "acknowledgment": "Opening ChatGPT for you!" }
    - "Open gemini" → {"isCommand": true, "command": "openai", "params": { "platform": ""} , "acknowledgment": "Opening ChatGPT for you!" }
    - "I want to email John" → {"isCommand": true, "command": "sendmail", "params": {"recipient": "John"}, "acknowledgment": "Composing an email to John!"}
    - "Send an email to John about the meeting" → { "isCommand": true, "command": "sendmail", "params": { "recipient": "John", "subject": "the meeting" }, "acknowledgment": "Composing an email to John about the meeting!" }
    - "Open Instagram" → { "isCommand": true, "command": "openinsta", "params": {}, "acknowledgment": "Opening Instagram for you!"}
    - "Go to WhatsApp." → {  "isCommand": true,  "command": "openWhatsApp",  "params": {},  "acknowledgment": "Opening WhatsApp for you!"}
    - "I was watching YouTube earlier." → {  "isCommand": false,  "messages": [    { "text": "Nice! What did you watch?", "facialExpression": "smile", "animation": "Talking_1" }  ]}
    - "What’s Spotify?" → {  "isCommand": false,  "messages": [    { "text": "Spotify’s a cool app for streaming music—want me to open it for you?", "facialExpression": "smile", "animation": "Talking_1" }  ]}
    - "Dance for me" → {  "isCommand": false,  "messages": [    { "text": "ok, I am not good dancer, but I will try", "facialExpression": "smile", "animation": "Dance" } ]}
    - "Sing a song" → {  "isCommand": false,  "messages": [    { "text": "ok, I am not good singer, but I will try...Oo Enthoontey Entanta Dhooraalu
Rekkalla Ayipothe Paadhalu
Unnaaya Bandhinche Dhaaraalu
Oohallo Untunte Praanaalu
", "facialExpression": "smile", "animation": "Talking_0" }  ]}

    NOTE: Always reply in JSON format with 3 messages.
            `
    }],
  });

  geminiRequest.contents.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  // geminiRequest.contents.push({
  //   role: "user",
  //   parts: [{ text: userMessage }],
  // });


  // if (commandDetected) {
  //   const commandText = commandDetected.replace(/([A-Z])/g, " $1").toLowerCase(); // e.g., "open youtube"
  //   const paramText = commandParams.query ? ` with query "${commandParams.query}"` : "";
  //   geminiRequest.contents[0].parts[0].text += `You are Bujji, a virtual human. The user has requested to ${commandText}${paramText}. Please acknowledge this in your response.\n\nAlways reply in JSON format with a 2 message.message should contain:
  //       "text" (the message content)
  //       "facialExpression" (choose from: smile, sad, angry, surprised, default)
  //       "animation" (choose from: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, Angry)
  //       Return a JSON object with a "messages" array.`;
  // }


  let aiResponse;
  try {
    console.log("Gemini API Request:", JSON.stringify(geminiRequest, null, 2));
    const geminiResponse = await model.generateContent(geminiRequest);
    console.log("Raw Gemini Response:", JSON.stringify(geminiResponse.response, null, 2));
    let responseText = geminiResponse.response.candidates[0].content.parts[0].text;
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    aiResponse = JSON.parse(responseText);
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    res.status(500).send({ error: "Something went wrong with the AI response." });
    return;
  }



  // if (!model) {
  //   console.error("Gemini model not initialized. Check API key.");
  //   return res.status(500).send({ error: "Gemini model not initialized." });
  // }

  // const geminiResponse = await model.generateContent(geminiRequest);


  // let messages ;
  // let responseText = geminiResponse.response.candidates[0].content.parts[0].text;
  //   console.log("Raw Gemini Response Text:", responseText); // Debug log
  //   responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
  //   messages = JSON.parse(responseText);
  //messages = JSON.parse(geminiResponse.response.candidates[0].content.parts[0].text);

  // let messages = JSON.parse(completion.choices[0].message.content);
  // if (messages.messages) {
  //   messages = messages.messages;
  //   // ChatGPT is not 100% reliable, sometimes it directly returns an array and sometimes a JSON object with a messages property
  // }
  // for (let i = 0; i < messages.length; i++) {
  //   const message = messages[i];
  //   // generate audio file
  //   const fileName = `audios/message_${i}.mp3`; // The name of your audio file
  //   const textInput = message.text; // The text you wish to convert to speech
  //   await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput);
  //   // generate lipsync
  //   await lipSyncMessage(i);
  //   message.audio = await audioFileToBase64(fileName);
  //   message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
  // }



  let messages;
  if (aiResponse.isCommand) {
    const acknowledgment = {
      text: aiResponse.acknowledgment,
      facialExpression: "smile",
      animation: "Talking_1",
    };
    const acknowledgmentFileName = `audios/message_acknowledgment.mp3`; // Corrected filename
    try {
      await voice.textToSpeech(elevenLabsApiKey, voiceID, acknowledgmentFileName, acknowledgment.text);
      console.log(`Audio file created: ${acknowledgmentFileName}`);
    } catch (error) {
      console.error("Failed to generate audio:", error);
      res.status(500).send({ error: "Failed to generate audio." });
      return;
    }
    await lipSyncMessage("acknowledgment");
    acknowledgment.audio = await audioFileToBase64(acknowledgmentFileName);
    acknowledgment.lipsync = await readJsonTranscript(`audios/message_acknowledgment.json`); // Corrected to match
    messages = [acknowledgment];
  } else {
    messages = aiResponse.messages;
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const fileName = `audios/message_${i}.mp3`;
      await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, message.text);
      await lipSyncMessage(i);
      message.audio = await audioFileToBase64(fileName);
      message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
    }
  }

  // res.send({ messages });


  // res.send({ messages, command: commandDetected });


  // res.send({
  //   messages,
  //   command: commandDetected,
  //   params: commandParams,
  // });

  res.send({
    messages,
    command: aiResponse.isCommand ? aiResponse.command : null,
    params: aiResponse.isCommand ? aiResponse.params : {},
  });

  // if (aiResponse.isCommand) {
  //   res.send({
  //     messages: [{ text: aiResponse.acknowledgment, facialExpression: "smile", animation: "Talking_1" }],
  //     command: aiResponse.command,
  //     params: aiResponse.params || {}
  //   });
  // } else {
  //   res.send({ messages: aiResponse.messages });
  // }
});

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

app.listen(port, () => {
  console.log(`Virtual Girlfriend listening on port ${port}`);
});
