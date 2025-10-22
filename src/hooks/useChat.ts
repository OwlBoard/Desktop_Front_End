import { useEffect, useState, useCallback } from 'react';
import { chatApi, ChatMessage } from '../services/chatApi';

interface UseChatParams {
  dashboardId: string;
  userId: string;
  username: string;
}

export const useChat = ({ dashboardId, userId, username }: UseChatParams) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load historical messages
  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const historicalMessages = await chatApi.getMessages(dashboardId);
      setMessages(historicalMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dashboardId]);

  // Send message
  const sendMessage = useCallback((message: string) => {
    if (message.trim() && isConnected) {
      chatApi.sendMessage(message.trim(), userId, username, dashboardId);
    }
  }, [isConnected, userId, username, dashboardId]);

  // Clear messages (persistent - deletes from server)
  const clearMessages = useCallback(async () => {
    try {
      const success = await chatApi.clearAllMessages(dashboardId);
      if (success) {
        // Clear locally immediately for responsiveness
        setMessages([]);
      } else {
        console.error('Failed to clear messages from server');
        // Still clear locally as fallback
        setMessages([]);
      }
    } catch (error) {
      console.error('Error clearing messages:', error);
      // Clear locally as fallback
      setMessages([]);
    }
  }, [dashboardId]);

  useEffect(() => {
    // Set up event handlers
    const handleMessage = (message: ChatMessage) => {
      setMessages((prev: ChatMessage[]) => {
        // If this is a server message, replace any temporary message with the same content
        if ((message as any).isServerMessage) {
          // Remove any temporary message with same content from same user
          const filtered = prev.filter((m: ChatMessage) => 
            !(m.id.startsWith('temp_') && 
              m.content === message.content && 
              m.user_id === message.user_id)
          );
          
          // Check if we already have this server message
          const exists = filtered.some((m: ChatMessage) => m.id === message.id);
          if (exists) return prev;
          
          return [...filtered, message];
        } else {
          // This is an optimistic message
          // Avoid duplicates based on ID
          const exists = prev.some((m: ChatMessage) => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        }
      });
    };

    const handleConnection = (connected: boolean) => {
      setIsConnected(connected);
    };

    const handleMessagesCleared = () => {
      // Clear messages when server notifies that they were cleared
      setMessages([]);
    };

    // Subscribe to events
    chatApi.onMessage(handleMessage);
    chatApi.onConnection(handleConnection);
    chatApi.onMessagesCleared(handleMessagesCleared);

    // Connect to room
    chatApi.connectToRoom(dashboardId, userId, username);
    
    // Load messages independently
    const loadInitialMessages = async () => {
      setIsLoading(true);
      try {
        const historicalMessages = await chatApi.getMessages(dashboardId);
        setMessages(historicalMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialMessages();

    // Cleanup - when dependencies change or component unmounts
    return () => {
      chatApi.removeMessageHandler(handleMessage);
      chatApi.removeConnectionHandler(handleConnection);
      chatApi.removeMessagesClearedHandler(handleMessagesCleared);
      chatApi.disconnect();
    };
  }, [dashboardId, userId, username]); // Update when key parameters change

  return {
    messages,
    isConnected,
    isLoading,
    sendMessage,
    clearMessages,
    loadMessages
  };
};