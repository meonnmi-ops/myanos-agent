'use client';

import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { Send, Paperclip, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, isProcessing, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isProcessing || disabled) return;
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, isProcessing, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
  }, []);

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-xl px-4 pb-4 pt-3">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-secondary/30 px-3 py-2 transition-colors focus-within:border-emerald-600/50 focus-within:ring-1 focus-within:ring-emerald-600/20">
          {/* Paperclip button (disabled) */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground"
                  disabled
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Coming soon</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Send a message..."
            rows={1}
            disabled={disabled}
            className="max-h-[160px] min-h-[36px] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />

          {/* Send button */}
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isProcessing || disabled}
            size="icon"
            className={cn(
              "h-8 w-8 shrink-0 transition-all",
              isProcessing
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            )}
          >
            {isProcessing ? (
              <Sparkles className="h-4 w-4 animate-pulse" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <p className="mt-2 text-center text-[11px] text-zinc-600">
          MyanOS Agent — Shell · MMC Compiler · OneDrive · Termux Tunnel
        </p>
      </div>
    </div>
  );
}
