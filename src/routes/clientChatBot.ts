import express from "express";
import { chatbot } from "../chatbot/client/graph.js";
import { type AgentState } from "../chatbot/client/agentstate.js";
import { v4 as uuidv4 } from "uuid"; // for generating new thread IDs
import { connectDatabase } from "../config/database.js";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
const router = express.Router();

router.use(express.json());
// 2. Export the function with proper types
router.get("/connection", async (req: express.Request, res: express.Response) => {
  const { thread_id } = req.body as { thread_id: string | null };
  const DB = await connectDatabase();
  const chathistoryCollection = DB.collection('chatHistory');
  if (!thread_id) {
    console.log("User started a new Chatbot thread");
    const new_thread_id: string = uuidv4()
    await chathistoryCollection.insertOne({ thread_id: new_thread_id, messages: [] });
    return res.status(400).json({ 
      status: "new_thread", 
      thread_id: new_thread_id 
    });
  }else {
    const existingThread = await chathistoryCollection.findOne({ thread_id: thread_id });
    if (!existingThread) {
      console.log(`No existing thread found for ID: ${thread_id}`);
      return res.status(404).json({ 
        status: "invalid_thread", 
        error: "Thread ID not found" 
      });
    }else{
      console.log(`User joined the Chatbot: ${thread_id}`);
      return res.status(200).json({
        status: "existing_thread",
        thread_id: thread_id
      });
    }
  }
});

router.post("/message", async (req: express.Request, res: express.Response) => {
  const { message, thread_id } = req.body as { message: string; thread_id: string | null };
  const DB = await connectDatabase();
  const chathistoryCollection = DB.collection('chatHistory');
  if (!thread_id) {
    console.log("No thread_id provided in /chatbot/message");
    return res.status(400).json({ 
      status: "error", 
      error: "thread_id is required" 
    });
  }
  console.log(`Message received in /chatbot/message: ${message} for thread: ${thread_id}`);
  const existingThread = await chathistoryCollection.findOne({ thread_id: thread_id }) as AgentState | null;

  if (!existingThread) {
    console.log(`No existing thread found for ID: ${thread_id} in /chatbot/message`);
    return res.status(404).json({
      status: "invalid_thread",
      error: "Thread ID not found"
    });
  }
  const initialState: AgentState = {
      messages: existingThread.messages.concat([new HumanMessage(message)]),
      final_output: existingThread.final_output,
      toolCall: existingThread.toolCall,
  };

  try {
    const result: AgentState = await Promise.race([
      chatbot.invoke(initialState),
      new Promise<AgentState>((_, reject) =>
          setTimeout(() => reject(new Error("LLM call timed out")), 130000) // 30s timeout
      ),
    ]);
    
    const chathistory = result.messages.map((msg: BaseMessage) => ({
      role: msg.constructor.name === 'HumanMessage' ? 'user' : 'ai',
      content: msg.content
    }));
    
    console.log(`Chatbot processing completed for thread ${thread_id} and message array is:\n${JSON.stringify(chathistory, null, 2)}`);
    await chathistoryCollection.updateOne(
      { thread_id: thread_id },
      { $set: { messages: chathistory, final_output: result.final_output, toolCall: result.toolCall } }
    );

    return res.status(200).json({ 
      status: "success", 
      response: result.final_output 
    });}
    catch (err : any) {
      console.error(`Error in /chatbot/message for thread ${thread_id}:`, err);
    if (err && err.message && err.message.includes('timed out')) {
      return res.status(504).json({ status: 'error', error: 'LLM call timed out' });
    }
    return res.status(500).json({ status: 'error', error: 'Internal server error' });
  }
});

router.get("/chathistory", async (req: express.Request, res: express.Response) => {
  const { thread_id } = req.body as { thread_id: string };
  console.log(`Fetching chat history for thread: ${thread_id}`);

  return res.status(200).json({ 
    status: "success", 
    history: [
      { role: "user", content: "Hello, how can I apply for scholarships?" },
      { role: "ai", content: "You can start by researching available scholarships on our platform..." }
    ] // Placeholder for actual chat history
  });
});

export default router