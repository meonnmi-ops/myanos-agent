import { NextResponse } from 'next/server';

const ONEDRIVE_QUOTA_URL = 'https://myanmar-ai-backend.onrender.com/api/storage/quota';

export async function POST() {
  try {
    const response = await fetch(ONEDRIVE_QUOTA_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `OneDrive API returned HTTP ${response.status}`,
        quota: null,
      });
    }

    const data = await response.json();

    // Normalize the response to a consistent format
    const quota = {
      used: data.used || data.usedFormatted || '0 B',
      total: data.total || data.totalFormatted || '0 B',
      remaining: data.remaining || data.remainingFormatted || '0 B',
      usedRaw: data.usedRaw ?? data.used ?? 0,
      totalRaw: data.totalRaw ?? data.total ?? 0,
    };

    return NextResponse.json({
      success: true,
      quota,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Failed to fetch OneDrive quota: ${error instanceof Error ? error.message : 'Unknown error'}`,
      quota: null,
    });
  }
}
