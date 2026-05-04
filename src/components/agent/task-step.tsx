'use client';

import { Circle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskStep } from '@/lib/agent-store';

const stepIcons: Record<TaskStep['status'], React.ReactNode> = {
  pending: <Circle className="h-5 w-5 text-zinc-500" />,
  running: <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />,
  completed: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
};

const stepColors: Record<TaskStep['status'], string> = {
  pending: 'text-zinc-500',
  running: 'text-foreground',
  completed: 'text-zinc-300',
  error: 'text-red-400',
};

export function TaskStepItem({ step, isLast }: { step: TaskStep; isLast: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center">{stepIcons[step.status]}</div>
        {!isLast && (
          <div className="w-px h-full min-h-[24px] bg-border mt-1" />
        )}
      </div>
      <div className={cn('pb-4 text-sm', stepColors[step.status])}>
        <p className="font-medium">{step.label}</p>
      </div>
    </div>
  );
}

export function TaskSteps({ steps }: { steps: TaskStep[] }) {
  if (steps.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-4">
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Task Progress
      </h3>
      <div>
        {steps.map((step, i) => (
          <TaskStepItem key={step.id} step={step} isLast={i === steps.length - 1} />
        ))}
      </div>
    </div>
  );
}
