import { create } from 'zustand';

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: unknown;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
  isThinking?: boolean;
}

export interface TaskStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

interface AgentState {
  messages: Message[];
  isProcessing: boolean;
  currentTaskSteps: TaskStep[];
  tunnelUrl: string;

  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setProcessing: (isProcessing: boolean) => void;
  setTaskSteps: (steps: TaskStep[]) => void;
  updateTaskStep: (id: string, status: TaskStep['status']) => void;
  setTunnelUrl: (url: string) => void;
  clearChat: () => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  messages: [],
  isProcessing: false,
  currentTaskSteps: [],
  tunnelUrl: '',

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),

  setProcessing: (isProcessing) => set({ isProcessing }),
  setTaskSteps: (steps) => set({ currentTaskSteps: steps }),

  updateTaskStep: (id, status) =>
    set((state) => ({
      currentTaskSteps: state.currentTaskSteps.map((step) =>
        step.id === id ? { ...step, status } : step
      ),
    })),

  setTunnelUrl: (url) => set({ tunnelUrl: url }),
  clearChat: () => set({ messages: [], currentTaskSteps: [], isProcessing: false }),
}));
