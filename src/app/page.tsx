'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  Settings,
  Trash2,
  Terminal,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Command,
  FolderCode,
  Database,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ChatMessage } from '@/components/agent/chat-message';
import { ChatInput } from '@/components/agent/chat-input';
import { TaskSteps } from '@/components/agent/task-step';
import { useAgentStore, type Message } from '@/lib/agent-store';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const quickActions = [
  { icon: <Terminal className="h-4 w-4" />, label: 'List files', prompt: 'List files in the current directory' },
  { icon: <Command className="h-4 w-4" />, label: 'System info', prompt: 'Show system information' },
  { icon: <FolderCode className="h-4 w-4" />, label: 'Compile MMC', prompt: 'Help me compile an MMC program' },
  { icon: <Database className="h-4 w-4" />, label: 'Check storage', prompt: 'Check OneDrive storage quota' },
];

const capabilities = [
  {
    icon: <Terminal className="h-6 w-6 text-emerald-400" />,
    title: 'Shell Commands',
    description: 'Execute shell commands on your Termux environment via secure tunnel.',
  },
  {
    icon: <Cpu className="h-6 w-6 text-amber-400" />,
    title: 'MMC Compiler',
    description: 'Compile and run Myanmar Language (MMC) programs with full output.',
  },
  {
    icon: <HardDrive className="h-6 w-6 text-sky-400" />,
    title: 'OneDrive',
    description: 'Check your OneDrive storage usage and quota information.',
  },
];

export default function Home() {
  const {
    messages,
    isProcessing,
    currentTaskSteps,
    tunnelUrl,
    addMessage,
    updateMessage,
    setProcessing,
    setTaskSteps,
    setTunnelUrl,
    clearChat,
  } = useAgentStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [settingsUrl, setSettingsUrl] = useState(tunnelUrl);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing, currentTaskSteps, scrollToBottom]);

  // Sync settings input with store
  useEffect(() => {
    setSettingsUrl(tunnelUrl);
  }, [tunnelUrl, settingsOpen]);

  const handleSend = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date(),
      };
      addMessage(userMessage);

      const assistantId = generateId();
      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isThinking: true,
      };
      addMessage(assistantMessage);
      setProcessing(true);

      try {
        const chatMessages = useAgentStore
          .getState()
          .messages.filter((m) => m.id !== assistantId)
          .map(({ role, content }) => ({ role, content }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...chatMessages, { role: 'user', content }],
            tunnelUrl,
          }),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();

        updateMessage(assistantId, {
          content: data.content || '',
          isThinking: false,
          toolCalls: data.toolCalls?.map((tc: Record<string, unknown>, i: number) => ({
            id: (tc.id as string) || generateId(),
            name: tc.name as string,
            args: tc.args as Record<string, unknown>,
            status: (tc.status as 'completed' | 'error') || 'completed',
            result: tc.result,
          })),
        });

        if (data.taskSteps) {
          setTaskSteps(data.taskSteps);
        }
      } catch (error) {
        updateMessage(assistantId, {
          content: `Sorry, an error occurred: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
          isThinking: false,
        });
      } finally {
        setProcessing(false);
      }
    },
    [addMessage, updateMessage, setProcessing, setTaskSteps, tunnelUrl]
  );

  const handleSaveSettings = useCallback(() => {
    setTunnelUrl(settingsUrl.trim());
    setSettingsOpen(false);
  }, [settingsUrl, setTunnelUrl]);

  const handleClearChat = useCallback(() => {
    clearChat();
    setClearOpen(false);
  }, [clearChat]);

  const hasTunnel = tunnelUrl.length > 0;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-dvh flex-col bg-background">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border px-4 py-3 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-zinc-800 text-emerald-400">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-sm font-semibold">MyanOS Agent</h1>
              <div className="flex items-center gap-1.5">
                {hasTunnel ? (
                  <Wifi className="h-3 w-3 text-emerald-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-zinc-500" />
                )}
                <span className="text-[11px] text-muted-foreground">
                  {hasTunnel ? 'Tunnel connected' : 'No tunnel configured'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Settings */}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tunnel Settings</DialogTitle>
                  <DialogDescription>
                    Enter your Termux tunnel URL to enable shell execution and MMC compilation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <Input
                    placeholder="https://your-tunnel-url.onrender.com"
                    value={settingsUrl}
                    onChange={(e) => setSettingsUrl(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSettings}>Save</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Clear Chat */}
            <Dialog open={clearOpen} onOpenChange={setClearOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear Chat</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to clear all messages? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setClearOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleClearChat}>
                    Clear
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-hidden">
          {messages.length === 0 ? (
            /* Welcome screen */
            <div className="flex h-full flex-col items-center justify-center px-4 py-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-6 text-center max-w-md"
              >
                {/* Hero icon */}
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600/10 border border-emerald-600/20">
                    <Bot className="h-10 w-10 text-emerald-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Welcome to MyanOS Agent</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your free, unlimited AI agent for Termux shell execution, MMC compiler, and OneDrive integration. Powered by AI.
                  </p>
                </div>

                {/* Capability cards */}
                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
                  {capabilities.map((cap) => (
                    <div
                      key={cap.title}
                      className="rounded-xl border border-border bg-secondary/20 p-4 text-left"
                    >
                      <div className="mb-2">{cap.icon}</div>
                      <h3 className="text-sm font-semibold">{cap.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {cap.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="flex flex-wrap justify-center gap-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSend(action.prompt)}
                      className="gap-2"
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            /* Messages area */
            <div
              ref={scrollContainerRef}
              className="h-full overflow-y-auto scrollbar-thin px-4 py-6"
            >
              <div className="mx-auto max-w-3xl space-y-6">
                {/* Task steps panel */}
                {currentTaskSteps.length > 0 && (
                  <TaskSteps steps={currentTaskSteps} />
                )}

                {/* Messages */}
                <AnimatePresence mode="popLayout">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                </AnimatePresence>

                {/* Processing indicator */}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 px-1"
                  >
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    <span className="text-xs text-muted-foreground">Processing...</span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </main>

        {/* Chat input */}
        <ChatInput onSend={handleSend} isProcessing={isProcessing} />
      </div>
    </TooltipProvider>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
