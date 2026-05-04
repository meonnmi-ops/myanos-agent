import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    agent: 'MyanOS Agent v1.0.0',
  });
}
