import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, filename, tunnelUrl } = body;

    if (!source || typeof source !== 'string') {
      return NextResponse.json(
        { success: false, output: 'Source code is required.' },
        { status: 400 }
      );
    }

    if (!filename || typeof filename !== 'string') {
      return NextResponse.json(
        { success: false, output: 'Filename is required.' },
        { status: 400 }
      );
    }

    if (!tunnelUrl) {
      return NextResponse.json({
        success: false,
        output:
          'No tunnel URL configured. Please go to Settings and enter your Termux tunnel URL to enable MMC compilation.\n\nTo set up a tunnel on Termux:\n1. Install: pkg install cloudflared\n2. Run: cloudflared tunnel --url http://localhost:8080\n3. Copy the URL and paste it in Settings.',
      });
    }

    // Step 1: Write source to /tmp/filename via shell_exec
    const escapedSource = source.replace(/'/g, "'\\''");
    const writeCommand = `cat > /tmp/${filename} << 'MMCEOF'\n${source}\nMMCEOF`;

    let writeResponse;
    try {
      writeResponse = await fetch('/api/tools/shell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: writeCommand, tunnelUrl }),
        signal: AbortSignal.timeout(30000),
      });
    } catch {
      return NextResponse.json({
        success: false,
        output: 'Failed to connect to tunnel for file writing.',
      });
    }

    const writeData = await writeResponse.json();
    if (!writeData.success) {
      return NextResponse.json({
        success: false,
        output: `Failed to write source file: ${writeData.error || writeData.output}`,
      });
    }

    // Step 2: Run MMC compiler
    const compileCommand = `python3 ~/mmc-compiler/src/mmc.py compile /tmp/${filename} --run -v`;

    let compileResponse;
    try {
      compileResponse = await fetch('/api/tools/shell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: compileCommand, tunnelUrl }),
        signal: AbortSignal.timeout(60000),
      });
    } catch {
      return NextResponse.json({
        success: false,
        output: 'Failed to connect to tunnel for compilation.',
      });
    }

    const compileData = await compileResponse.json();

    if (compileData.success) {
      return NextResponse.json({
        success: true,
        output: compileData.output || 'Compilation completed.',
      });
    } else {
      return NextResponse.json({
        success: false,
        output: `Compilation failed:\n${compileData.error || compileData.output}`,
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        output: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
