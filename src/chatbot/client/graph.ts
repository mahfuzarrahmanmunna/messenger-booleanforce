import { StateGraph, END , Annotation, START} from "@langchain/langgraph";
import { llmNode } from "./nodes/llmNodes.js";
import { toolNode } from "./nodes/toolNode.js";
import { StateAnnotation, type AgentState } from "./agentstate.js";

const graph = new StateGraph(StateAnnotation)
  .addNode("llm", llmNode)
  .addNode("tool", toolNode)
  
  .addEdge(START, "llm")
  
  .addConditionalEdges("llm", (state) =>
    state.toolCall ? "tool" : END
  )
  .addEdge("tool", "llm")
  .compile();

export const chatbot = graph;
export type ChatbotState = AgentState;