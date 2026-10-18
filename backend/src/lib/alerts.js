import { db } from './db.js';

/**
 * External alerts, with the attempt recorded whether or not it worked.
 *
 * The spec's promise is that a missed lead produces a *real* external alert, so every
 * send is persisted with its status and error: the integrations page can show a failed
 * webhook instead of pretending it was delivered, and a demo can point the generic
 * webhook at any request bin.
 */
const alerts = db.collection('alerts');

const TIMEOUT_MS = Number(process.env.ALERT_TIMEOUT_MS || 6000);

async function post(url, body, headers = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    const text = (await response.text().catch(() => '')).slice(0, 200);
    throw new Error(`${response.status} ${text}`.trim());
  }
}

/** Which channels the workspace has configured, in the order they are tried. */
export function configuredChannels(settings) {
  const alerts = settings?.alerts ?? {};
  const channels = [];

  if (alerts.webhookUrl) channels.push({ channel: 'webhook', target: alerts.webhookUrl });
  if (alerts.slackWebhookUrl) channels.push({ channel: 'slack', target: alerts.slackWebhookUrl });
  if (alerts.telegramBotToken && alerts.telegramChatId) {
    channels.push({
      channel: 'telegram',
      target: `chat:${alerts.telegramChatId}`,
    });
  }

  return channels;
}

function getLeadUrl(leadId) {
  if (!leadId) return '';
  const base = (process.env.FRONTEND_URL || process.env.PUBLIC_ORIGIN || 'http://localhost:5173').replace(/\/+$/, '');
  return `${base}/leads/${leadId}`;
}

function payloadFor(channel, message, settings) {
  const link = getLeadUrl(message.leadId);

  if (channel === 'slack') {
    const text = link
      ? `*${message.title}*\n${message.body}\n<${link}|Open Lead in OmniFlow>`
      : `*${message.title}*\n${message.body}`;
    return { text };
  }

  if (channel === 'telegram') {
    const text = link
      ? `${message.title}\n${message.body}\nView Lead: ${link}`
      : `${message.title}\n${message.body}`;
    return {
      url: `https://api.telegram.org/bot${settings.alerts.telegramBotToken}/sendMessage`,
      body: { chat_id: settings.alerts.telegramChatId, text },
    };
  }

  return {
    title: message.title,
    body: message.body,
    leadId: message.leadId ?? null,
    leadUrl: link || null,
    level: message.level ?? null,
    at: new Date().toISOString(),
  };
}

/**
 * Send one alert to every configured channel and record each attempt. Returns the
 * persisted attempts so a caller can show "no channel configured" honestly.
 */
export async function notify({ workspaceId, leadId = null, title, body, level = null, settings }) {
  const channels = configuredChannels(settings);
  const now = new Date().toISOString();

  if (channels.length === 0) {
    const record = await alerts.insert({
      workspaceId,
      leadId,
      channel: 'none',
      target: '',
      title,
      body,
      level,
      status: 'skipped',
      error: 'No alert channel configured',
      at: now,
    });

    return [record];
  }

  const attempts = [];

  for (const { channel, target } of channels) {
    const prepared = payloadFor(channel, { title, body, leadId, level }, settings);

    try {
      if (channel === 'telegram') {
        await post(prepared.url, prepared.body);
      } else {
        await post(target, prepared);
      }

      attempts.push(
        await alerts.insert({
          workspaceId,
          leadId,
          channel,
          target,
          title,
          body,
          level,
          status: 'sent',
          error: null,
          at: now,
        }),
      );
    } catch (error) {
      attempts.push(
        await alerts.insert({
          workspaceId,
          leadId,
          channel,
          target,
          title,
          body,
          level,
          status: 'failed',
          error: String(error.message ?? error).slice(0, 300),
          at: now,
        }),
      );
    }
  }

  return attempts;
}

export async function listAlerts(workspaceId, limit = 50) {
  const rows = await alerts.where((alert) => alert.workspaceId === workspaceId);

  return rows.sort((a, b) => b.at.localeCompare(a.at)).slice(0, Math.min(limit, 200));
}
