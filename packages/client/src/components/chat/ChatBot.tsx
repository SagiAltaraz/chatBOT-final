import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import TypingIndicator from './TypingIndicator';
import { ChatMessages, type Message } from './ChatMessages';
import { ChatInput } from './ChatInput';
import type { ChatFormData } from './ChatInput';
import popSound from '@/assets/sounds/pop.mp3';
import notificationSound from '@/assets/sounds/notification.mp3';
import Cookies from 'js-cookie';

const popAudio = new Audio(popSound);
popAudio.volume = 0.2;

const notificationAudio = new Audio(notificationSound);
notificationAudio.volume = 0.2;

type ChatResponse = {
   message: string;
};

const ChatBot = () => {
   const [messages, setMessages] = useState<Message[]>([]);
   const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
   const [error, setError] = useState<string | null>(null);
   const cookies = Cookies.get('conversationId');
   const conversationId = cookies
      ? useRef(cookies)
      : useRef(crypto.randomUUID());

   useEffect(() => {
      if (!cookies) {
         return;
      }
      let ignore = false;
      async function fetchMessages() {
         const cookie = Cookies.get('conversationId');
         const data = await axios.post<Message[], any, {}>('/api/getMessages', {
            conversationId: cookie,
         });
         if (!ignore) return;

         for (let index = 0; index < data.data.botMessages.length; index++) {
            console.log(index);

            setMessages((prev) => [
               ...prev,
               { content: data.data.userMessages[index].content, role: 'user' },
               { content: data.data.botMessages[index].content, role: 'bot' },
            ]);
         }
      }
      fetchMessages();
      return () => {
         ignore = true;
      };
   }, []);

   const onSubmit = async ({ prompt }: ChatFormData) => {
      try {
         setMessages((prev) => [...prev, { content: prompt, role: 'user' }]);
         setIsBotTyping(true);
         setError('');
         popAudio.play();

         const { data } = await axios.post<ChatResponse>('/api/chat', {
            prompt,
            conversationId: conversationId.current,
         });

         setMessages((prev) => [
            ...prev,
            { content: data.message, role: 'bot' },
         ]);
         setIsBotTyping(false);
         notificationAudio.play();
      } catch (error) {
         console.error(error);
         setError('Something went wrong. Please try again.');
      } finally {
         setIsBotTyping(false);
      }
   };

   const handleClearChat = async () => {
      try {
         await axios.post('/api/chat/clear');
         setMessages([]);
         conversationId.current = crypto.randomUUID();
         Cookies.remove('conversationId');
         setError('');
      } catch (error) {
         console.error('Failed to clear chat:', error);
         setError('Failed to clear chat. Please try again.');
      }
   };

   return (
      <div className="flex flex-col h-full">
         <div className="flex justify-between items-center mb-2 px-2">
            <h2 className="text-lg font-semibold">Chat</h2>
            <button
               onClick={handleClearChat}
               className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
               title="Clear chat history"
            >
               🗑️ Clear
            </button>
         </div>
         <div className="flex flex-col flex-1 gap-3 mb-10 overflow-y-auto">
            <ChatMessages messages={messages} />
            {isBotTyping && <TypingIndicator />}
            {error && <p className="text-red-500">{error}</p>}
         </div>
         <ChatInput onSubmit={onSubmit} />
      </div>
   );
};
export default ChatBot;
