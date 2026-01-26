import { NextResponse } from 'next/server';
import { sendDiscordNotification } from '@/lib/notifications';

/**
 * Test endpoint for Discord webhook
 * GET /api/test-webhook - Sends a test notification
 */
export async function GET() {
  const webhookConfigured = !!process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookConfigured) {
    return NextResponse.json({
      success: false,
      error: 'DISCORD_WEBHOOK_URL not configured in environment',
    }, { status: 400 });
  }

  const sent = await sendDiscordNotification(
    'success',
    'Test - Webhook Connected',
    42,
    undefined
  );

  return NextResponse.json({
    success: sent,
    message: sent 
      ? 'Test notification sent to Discord!' 
      : 'Failed to send notification - check webhook URL',
    timestamp: new Date().toISOString(),
  });
}
