'use client';

import { Terminal, Cpu, HardDrive, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { ToolCall } from '@/lib/agent-store';
import { useState } from 'react';

const toolIcons: Record<string, React.ReactNode> = {
  shell_exec: <Terminal className="h-4 w-4" />,
  mmc_compile: <Cpu className="h-4 w-4" />,
  onedrive_quota: <HardDrive className="h-4 w-4" />,
};

const statusConfig: Record<string, { label: string; variant: 'secondary' | 'default' | 'destructive' | 'outline'; className?: string }> = {
  pending: { label: 'Pending', variant: 'outline', className: 'text-yellow-500 border-yellow-500/30' },
  running: { label: 'Running', variant: 'secondary', className: 'text-blue-400 border-blue-500/30' },
  completed: { label: 'Completed', variant: 'default' },
  error: { label: 'Error', variant: 'destructive' },
};

function getSubtitle(tool: ToolCall): string {
  if (tool.name === 'shell_exec' && tool.args.command) {
    const cmd = String(tool.args.command);
    return cmd.length > 60 ? cmd.slice(0, 60) + '...' : cmd;
  }
  if (tool.name === 'mmc_compile' && tool.args.filename) {
    return String(tool.args.filename);
  }
  if (tool.name === 'onedrive_quota') {
    return 'Check storage quota';
  }
  return '';
}

export function ToolResultCard({ tool }: { tool: ToolCall }) {
  const [open, setOpen] = useState(false);
  const status = statusConfig[tool.status] || statusConfig.pending;
  const icon = toolIcons[tool.name] || <Terminal className="h-4 w-4" />;
  const subtitle = getSubtitle(tool);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3 text-left transition-colors hover:bg-secondary/60 cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{tool.name}</span>
              {subtitle && (
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {subtitle}
                </span>
              )}
            </div>
          </div>
          <Badge variant={status.variant} className={cn('shrink-0', status.className)}>
            {tool.status === 'running' && (
              <span className="mr-1 inline-block h-2 w-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {status.label}
          </Badge>
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform shrink-0",
            open && "rotate-180"
          )} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2 overflow-hidden">
        {/* Args */}
        {Object.keys(tool.args).length > 0 && (
          <div className="rounded-lg border border-border bg-background/50 p-3">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Arguments</p>
            <pre className="overflow-x-auto text-xs text-zinc-300 font-mono whitespace-pre-wrap break-all">
              {JSON.stringify(tool.args, null, 2)}
            </pre>
          </div>
        )}
        {/* Output */}
        {tool.result !== undefined && tool.result !== null && (
          <div className="rounded-lg border border-border bg-background/50 p-3">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Output</p>
            <pre className="overflow-x-auto max-h-48 text-xs text-zinc-300 font-mono whitespace-pre-wrap break-all">
              {typeof tool.result === 'string' ? tool.result : JSON.stringify(tool.result, null, 2)}
            </pre>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
