import dotenv from 'dotenv';
import { ChatOpenAI, type ChatOpenAICallOptions } from '@langchain/openai';
import {tools} from "./tools.js";
import { type BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { type Runnable } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
dotenv.config();

export const model = (model_name : string) : ChatOpenAI<ChatOpenAICallOptions> =>{

  return new ChatOpenAI({
    modelName: model_name,
    // if using OpenRouter:
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    },
    temperature: 0.7,
    maxTokens: 1000,
  })
}

export const modelwithtool = 
  (model_name : string) : Runnable<BaseLanguageModelInput, AIMessage> =>{

  const model =new ChatOpenAI({
    modelName: model_name,
    // if using OpenRouter:
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    },
    temperature: 0.7,
    maxTokens: 1000,
  })

  return model.bindTools(tools);
}