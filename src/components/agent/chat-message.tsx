'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThinkingIndicator } from '@/components/agent/thinking-indicator';
import { ToolResultCard } from '@/components/agent/tool-result';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/agent-store';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-end gap-3"
      >
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm border border-emerald-600/30 bg-emerald-600/10 px-4 py-3">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-emerald-600 text-white">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3"
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-zinc-800 text-emerald-400">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[80%] space-y-3">
        {message.isThinking && <ThinkingIndicator />}
        {message.content && (
          <div className="rounded-2xl rounded-tl-sm bg-zinc-900 border border-border px-4 py-3">
            <div className="prose prose-invert prose-sm max-w-none [&_p]:text-sm [&_p]:leading-relaxed [&_pre]:bg-black/50 [&_pre]:rounded-lg [&_pre]:p-3 [&_code]:text-xs [&_code]:text-emerald-400 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_a]:text-emerald-400 [&_blockquote]:border-l-2 [&_blockquote]:border-emerald-500 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-400">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        )}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-2">
            {message.toolCalls.map((tool) => (
              <ToolResultCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
