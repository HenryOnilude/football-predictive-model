/**
 * Discord Webhook Notifications
 * Sends alerts when FPL API status changes
 */

export type NotificationLevel = 'success' | 'warning' | 'critical';

interface DiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
  };
  timestamp: string;
}

interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds: DiscordEmbed[];
}

// Discord embed colors
const COLORS = {
  success: 5763719,    // Green (#57F287)
  warning: 16753920,   // Amber (#FFA500)
  critical: 15158332,  // Red (#E74C3C)
} as const;

// Emoji for each level
const EMOJI = {
  success: '🟢',
  warning: '🟡',
  critical: '🔴',
} as const;

// Discord role ID for critical alert mentions (triggers mobile push)
const ALPHA_ROLE_ID = '1465768895183978789';

// Content strings for each severity level
function getAlertContent(level: NotificationLevel): string | undefined {
  switch (level) {
    case 'critical':
      return `🔴 **CRITICAL SYSTEM ALERT** <@&${ALPHA_ROLE_ID}>`;
    case 'warning':
      return `⚠️ **SYSTEM WARNING**`;
    default:
      return undefined;
  }
}

// Rate limiting: Track last notification to prevent spam
let lastNotificationTime = 0;
let lastNotificationLevel: NotificationLevel | null = null;
const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes between same-level notifications

/**
 * Send a Discord notification about API status
 */
export async function sendDiscordNotification(
  level: NotificationLevel,
  status: string,
  latency: number,
  error?: string
): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('[Notifications] DISCORD_WEBHOOK_URL not configured');
    return false;
  }

  // Rate limiting check
  const now = Date.now();
  if (lastNotificationLevel === level && now - lastNotificationTime < RATE_LIMIT_MS) {
    console.log(`[Notifications] Rate limited: ${level} notification sent ${Math.round((now - lastNotificationTime) / 1000)}s ago`);
    return false;
  }

  const embed: DiscordEmbed = {
    title: `${EMOJI[level]} Axiom Connection Status`,
    description: getDescription(level, status),
    color: COLORS[level],
    fields: [
      {
        name: '📊 Status',
        value: status,
        inline: true,
      },
      {
        name: '⏱️ Latency',
        value: latency > 0 ? `${latency}ms` : 'N/A',
        inline: true,
      },
      {
        name: '🔧 Mode',
        value: getModeDescription(level),
        inline: true,
      },
    ],
    footer: {
      text: 'FPL Axiom Health Monitor',
    },
    timestamp: new Date().toISOString(),
  };

  // Add error field if present
  if (error) {
    embed.fields.push({
      name: '⚠️ Error Details',
      value: `\`\`\`${error.substring(0, 200)}\`\`\``,
      inline: false,
    });
  }

  const payload: DiscordWebhookPayload = {
    username: 'Axiom Monitor',
    avatar_url: 'https://fplaxiom.com/favicon.ico',
    content: getAlertContent(level),
    embeds: [embed],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`[Notifications] Discord webhook failed: ${response.status}`);
      return false;
    }

    // Update rate limiting trackers
    lastNotificationTime = now;
    lastNotificationLevel = level;
    
    console.log(`[Notifications] Sent ${level} notification`);
    return true;
  } catch (err) {
    console.error('[Notifications] Failed to send Discord notification:', err);
    return false;
  }
}

function getDescription(level: NotificationLevel, status: string): string {
  switch (level) {
    case 'success':
      return 'FPL API connection restored. Server proxy is operational.';
    case 'warning':
      return 'Server proxy blocked (403). Client-side fallback is active. Data is still accessible.';
    case 'critical':
      return 'Both server and client connections failed. Data is unavailable.';
    default:
      return `Status: ${status}`;
  }
}

function getModeDescription(level: NotificationLevel): string {
  switch (level) {
    case 'success':
      return 'Server Proxy';
    case 'warning':
      return 'Client Fallback';
    case 'critical':
      return 'Disconnected';
    default:
      return 'Unknown';
  }
}

/**
 * Send a test notification to verify webhook is working
 */
export async function sendTestNotification(): Promise<boolean> {
  return sendDiscordNotification(
    'success',
    'Test notification from FPL Axiom',
    100
  );
}
