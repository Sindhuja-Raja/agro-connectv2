import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/components/Chatbot';

export const chatService = {
  // Load chat history for a user
  async loadChatHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(100); // Load last 100 messages

      if (error) {
        console.error('Error loading chat history:', error);
        return [];
      }

      return (data || []).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        imagePreview: msg.image_url || undefined
      }));
    } catch (error) {
      console.error('Failed to load chat history:', error);
      return [];
    }
  },

  // Save a single message to database
  async saveMessage(userId: string, message: Message) {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          role: message.role,
          content: typeof message.content === 'string'
            ? message.content
            : JSON.stringify(message.content),
          image_url: message.imagePreview || null
        });

      if (error) {
        console.error('Error saving message:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to save message:', error);
      return false;
    }
  },

  // Clear all chat history for a user
  async clearChatHistory(userId: string) {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing chat history:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      return false;
    }
  },

  // Delete a specific message
  async deleteMessage(messageId: string) {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('Error deleting message:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to delete message:', error);
      return false;
    }
  }
};
