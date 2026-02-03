import { conversationRepository } from '../repositories/conversation.repository';
import instructions from '../prompts/chatbot.txt';
import { llmClient } from '../llm/client.js';
import type { Message } from '../repositories/conversation.repository';

export const chatService = {
   async sendMessage(
      prompt: string,
      conversationId: string
   ): Promise<Message | undefined> {
      const response = await llmClient.generateText({
         model: 'gpt-4o-mini',
         instructions,
         prompt,
         temperature: 0.2,
         maxTokens: 200,
         previouseResponceId:
            conversationRepository.getLastResponseId(conversationId),
      });
      const session = await conversationRepository.saveSession(
         conversationId,
         prompt,
         response
      );

      return session.messages.assistant[session.messages.assistant.length - 1];
   },
};
