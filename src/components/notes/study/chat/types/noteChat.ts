
export interface NoteChatMessage {
  id: string;
  note_id: string;
  user_id: string;
  message: string;
  response: string;
  created_at: string;
}

export interface ChatUIMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  suggestions?: string[];
  followUpQuestions?: string[];
}

export interface NoteChatState {
  messages: ChatUIMessage[];
  isLoading: boolean;
  isOpen: boolean;
  error: string | null;
}

export interface SmartSuggestion {
  id: string;
  text: string;
  type: 'question' | 'action' | 'summary';
  icon?: string;
}

export interface ChatContext {
  noteTitle: string;
  noteContent: string;
  subject: string;
  previousMessages: ChatUIMessage[];
}
