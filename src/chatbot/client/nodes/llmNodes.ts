import { model } from "../model.js";
import { SYSTEM_MESSAGE } from "../../prompt.js";
import type { AgentState } from "../agentstate.js";
import {AIMessage, AIMessageChunk, type MessageStructure, type MessageToolSet } from "@langchain/core/messages";
import type { ToolName } from "../tools.js";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

const AVAILABLE_MODELS: string[] = [
    'meta-llama/llama-3-70b-instruct:free',
    'microsoft/wizardlm-2-8x22b:free',
    'mistralai/mistral-7b-instruct:free',
    'google/gemma-7b-it:free',
    'meta-llama/llama-3-8b-instruct', // Try without :free
    'anthropic/claude-3-haiku',
    'openai/gpt-3.5-turbo'
];
export async function llmNode(state: AgentState) : Promise<Partial<AgentState>> {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_MESSAGE],
    new MessagesPlaceholder("messages"),
  ]);

  // const chain = prompt.pipe(model("gpt-3.5-turbo"));
  const chain: any = prompt.pipe(model(AVAILABLE_MODELS[6] as string));

  const response : AIMessageChunk<MessageStructure<MessageToolSet>> = await chain.invoke({
    messages: state.messages,
  })
  const raw: any = response.content;
  const tool_calls = response.tool_calls || [];

  console.log("LLM Response content:", raw);
  console.log("LLM Response tool_calls:", JSON.stringify(response.tool_calls, null, 2));
  
  return {
    toolCall: tool_calls.length > 0
      ? tool_calls.map(tc => ({
          tool: tc.name,
          args: tc.args as Record<string, unknown>,
          tool_call_id: tc.id as string,
        }))
      : [],
    final_output: raw,
    // Optionally, you can append the AI message to the messages array
    messages: tool_calls.length>0
      ? state.messages
      : [
          new AIMessage(raw),
        ],
  };
}
