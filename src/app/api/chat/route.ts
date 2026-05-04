import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const SYSTEM_PROMPT = `You are MyanOS Agent, a powerful AI assistant specialized in three capabilities:

1. **Shell Commands (shell_exec)**: Execute shell commands on a Termux Android environment via a secure tunnel. You can run any Linux command available in Termux (ls, cat, mkdir, python3, node, git, etc.). Always explain what you're about to do before running commands.

2. **MMC Compiler (mmc_compile)**: Compile and run Myanmar Language (MMC) programs. The user provides source code and a filename, which gets compiled with \`python3 ~/mmc-compiler/src/mmc.py compile /tmp/filename --run -v\`. Help users write, debug, and run MMC programs.

3. **OneDrive Storage (onedrive_quota)**: Check the user's OneDrive storage quota (used, total, remaining).

Important rules:
- Always explain your plan before using tools.
- For shell commands, be careful and avoid destructive operations.
- If the tunnel URL is not configured, guide the user to set it up in Settings.
- Be helpful, concise, and technical when appropriate.
- Format code and terminal output in markdown code blocks.`;

const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'shell_exec',
      description: 'Execute a shell command on the Termux environment via tunnel',
      parameters: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: 'The shell command to execute',
          },
        },
        required: ['command'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'mmc_compile',
      description: 'Compile and run an MMC (Myanmar Language) program',
      parameters: {
        type: 'object',
        properties: {
          source: {
            type: 'string',
            description: 'The MMC source code to compile',
          },
          filename: {
            type: 'string',
            description: 'The filename for the source file (e.g., program.mmc)',
          },
        },
        required: ['source', 'filename'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'onedrive_quota',
      description: 'Check OneDrive storage quota usage',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
];

interface ChatRequestBody {
  messages: Array<{ role: string; content: string }>;
  tunnelUrl: string;
  apiKey?: string;
  baseUrl?: string;
}

async function executeToolCall(
  name: string,
  args: Record<string, unknown>,
  tunnelUrl: string
): Promise<{ success: boolean; result: unknown; error?: string }> {
  try {
    let endpoint = '';
    let body: Record<string, unknown> = {};

    switch (name) {
      case 'shell_exec':
        endpoint = '/api/tools/shell';
        body = { command: args.command, tunnelUrl };
        break;
      case 'mmc_compile':
        endpoint = '/api/tools/mmc';
        body = { source: args.source, filename: args.filename, tunnelUrl };
        break;
      case 'onedrive_quota':
        endpoint = '/api/tools/onedrive';
        body = {};
        break;
      default:
        return { success: false, result: null, error: `Unknown tool: ${name}` };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return { success: data.success !== false, result: data };
  } catch (error) {
    return {
      success: false,
      result: null,
      error: error instanceof Error ? error.message : 'Tool execution failed',
    };
  }
}

// Call OpenAI-compatible API (works with Gemini, Groq, OpenRouter, etc.)
async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  messages: Array<{ role: string; content: string; tool_calls?: unknown[] }>,
  tools?: unknown[]
): Promise<{ content: string; tool_calls: unknown[] }> {
  const url = `${baseUrl}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'default',
      messages,
      tools: tools && tools.length > 0 ? tools : undefined,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API ${response.status}: ${err}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  return {
    content: choice?.message?.content || '',
    tool_calls: choice?.message?.tool_calls || [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { messages, tunnelUrl, apiKey, baseUrl } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentMessages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const toolCalls: Array<{
      id: string;
      name: string;
      args: Record<string, unknown>;
      status: 'completed' | 'error';
      result: unknown;
    }> = [];

    const taskSteps = [
      { id: '1', label: 'Analyzing request', status: 'completed' as const },
    ];

    let finalContent = '';
    let useZAI = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ai: any = null;

    // Determine AI backend:
    // Priority 1: User-provided API key (works from any device)
    // Priority 2: z.ai SDK (only works on z.ai cloud network)
    if (apiKey && baseUrl) {
      // User provided their own API — use OpenAI-compatible format
      // This works with Gemini, Groq, OpenRouter, Ollama, etc.
      useZAI = false;
    } else {
      // Try z.ai SDK (works on z.ai cloud, will fail on Termux)
      try {
        ai = await ZAI.create();
        useZAI = true;
      } catch {
        useZAI = false;
      }
    }

    // Tool-calling loop (max 5 rounds)
    for (let round = 0; round < 5; round++) {
      let aiContent = '';
      let aiToolCalls: unknown[] = [];

      if (useZAI && ai) {
        // Use z.ai SDK
        const completion = await ai.chat.completions.create({
          model: 'default',
          messages: currentMessages,
          tools: TOOL_DEFINITIONS.length > 0 ? TOOL_DEFINITIONS : undefined,
        });
        const choice = completion.choices?.[0];
        if (!choice) {
          finalContent = 'No response from AI model.';
          break;
        }
        aiContent = choice.message?.content || '';
        aiToolCalls = choice.message?.tool_calls || [];
      } else if (apiKey && baseUrl) {
        // Use user-provided API (OpenAI-compatible)
        const result = await callOpenAICompatible(
          baseUrl,
          apiKey,
          currentMessages,
          TOOL_DEFINITIONS.length > 0 ? TOOL_DEFINITIONS : undefined
        );
        aiContent = result.content;
        aiToolCalls = result.tool_calls;
      } else {
        finalContent = 'No AI configured. Please go to Settings and enter your API Base URL and API Key. Get a free key from Google Gemini (ai.google.dev).';
        break;
      }

      // If no tool calls, we're done
      if (!aiToolCalls || aiToolCalls.length === 0) {
        finalContent = aiContent;
        break;
      }

      // Add assistant message with tool calls to conversation
      currentMessages.push({
        role: 'assistant',
        content: aiContent,
        tool_calls: aiToolCalls,
      });

      // Execute each tool call
      for (const toolCall of aiToolCalls as Array<{
        id?: string;
        function?: { name?: string; arguments?: string };
      }>) {
        const tcId = toolCall.id || `tc_${Date.now()}`;
        const toolName = toolCall.function?.name || 'unknown';
        const toolArgs = toolCall.function?.arguments
          ? JSON.parse(toolCall.function.arguments)
          : {};

        taskSteps.push({
          id: `step_${tcId}`,
          label: `Executing ${toolName}`,
          status: 'completed' as const,
        });

        const result = await executeToolCall(toolName, toolArgs, tunnelUrl);

        toolCalls.push({
          id: tcId,
          name: toolName,
          args: toolArgs,
          status: result.success ? 'completed' : 'error',
          result: result.result,
        });

        // Add tool result to conversation
        currentMessages.push({
          role: 'tool',
          tool_call_id: tcId,
          content: JSON.stringify(result.result),
        });
      }
    }

    return NextResponse.json({
      content: finalContent,
      toolCalls,
      taskSteps,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        content: `Error: ${error instanceof Error ? error.message : 'Internal server error'}`,
        toolCalls: [],
        taskSteps: [],
      },
      { status: 500 }
    );
  }
}
