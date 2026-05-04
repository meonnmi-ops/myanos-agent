import { NextRequest, NextResponse } from 'next/server';

const DANGEROUS_PATTERNS = [
  /rm\s+(-[rfRF]+\s+)?\/$/,
  /mkfs/,
  /dd\s+.*of=\/dev/,
  /:\(\)\{\s*:\|:\s*&\s*\}\s*;/, // fork bomb
  /shutdown/,
  /reboot/,
  /halt/,
  /poweroff/,
  /init\s+[06]/,
  />\/dev\/sd/,
  /chmod\s+(-R\s+)?777\s+\/$/,
];

function isDangerousCommand(command: string): boolean {
  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(command));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { command, tunnelUrl } = body;

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { success: false, output: '', error: 'Command is required and must be a string.' },
        { status: 400 }
      );
    }

    const trimmedCommand = command.trim();

    if (isDangerousCommand(trimmedCommand)) {
      return NextResponse.json({
        success: false,
        output: '',
        error: `Blocked: This command is potentially dangerous and has been blocked for safety reasons.`,
      });
    }

    if (!tunnelUrl) {
      return NextResponse.json({
        success: false,
        output: '',
        error:
          'No tunnel URL configured. Please go to Settings and enter your Termux tunnel URL to enable shell command execution.\n\nTo set up a tunnel on Termux:\n1. Install: pkg install cloudflared\n2. Run: cloudflared tunnel --url http://localhost:8080\n3. Copy the URL and paste it in Settings.',
      });
    }

    try {
      const tunnelResponse = await fetch(tunnelUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: trimmedCommand }),
        signal: AbortSignal.timeout(30000),
      });

      if (!tunnelResponse.ok) {
        const errorText = await tunnelResponse.text().catch(() => 'Unknown error');
        return NextResponse.json({
          success: false,
          output: '',
          error: `Tunnel returned HTTP ${tunnelResponse.status}: ${errorText}`,
        });
      }

      const data = await tunnelResponse.json();
      return NextResponse.json({
        success: true,
        output: data.output || data.stdout || JSON.stringify(data),
        error: data.error || data.stderr || '',
      });
    } catch (fetchError) {
      return NextResponse.json({
        success: false,
        output: '',
        error: `Failed to reach tunnel: ${fetchError instanceof Error ? fetchError.message : 'Connection failed'}. Make sure your Termux tunnel is running and the URL is correct.`,
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        output: '',
        error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
