import { google, gmail_v1 } from "googleapis";

// Helper to create an authenticated Gmail client with a given access token
export function getGmailClient(accessToken: string): gmail_v1.Gmail {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}

// Fetch emails
export async function fetchEmails(accessToken: string, maxResults = 20) {
  const gmail = getGmailClient(accessToken);
  const listRes = await gmail.users.messages.list({ userId: "me", maxResults });
  const messages = listRes.data.messages || [];
  const emailPromises = messages.map(async (msg) => {
    const msgRes = await gmail.users.messages.get({ userId: "me", id: msg.id!, format: "full" });
    const payload = msgRes.data.payload;
    const headers = payload?.headers || [];
    const subject = headers.find((h) => h.name === "Subject")?.value || "No Subject";
    const sender = headers.find((h) => h.name === "From")?.value || "Unknown Sender";
    const date = headers.find((h) => h.name === "Date")?.value;
    const timestamp = date ? new Date(date) : new Date();
    const body = extractEmailBody(payload);
    const isUnread = (msgRes.data.labelIds || []).includes("UNREAD");
    return {
      id: msg.id!,
      threadId: msg.threadId!,
      subject,
      sender,
      body,
      timestamp,
      read: !isUnread,
      raw: msgRes.data,
    };
  });
  return Promise.all(emailPromises);
}

// Mark email as read
export async function markEmailAsRead(accessToken: string, emailId: string) {
  const gmail = getGmailClient(accessToken);
  await gmail.users.messages.modify({
    userId: "me",
    id: emailId,
    removeLabelIds: ["UNREAD"],
  });
}

// Send email
export async function sendEmail(accessToken: string, raw: string) {
  const gmail = getGmailClient(accessToken);
  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}

// Delete email
export async function deleteEmail(accessToken: string, emailId: string) {
  const gmail = getGmailClient(accessToken);
  await gmail.users.messages.delete({
    userId: "me",
    id: emailId,
  });
}

// Helper to extract email body from payload
function extractEmailBody(payload: gmail_v1.Schema$MessagePart | undefined): string {
  if (!payload) return "";
  if (!payload.parts) {
    if (payload.body && payload.body.data) {
      return decodeBase64Url(payload.body.data);
    }
    return "";
  }
  // Prefer text/html, then text/plain
  const findPart = (parts: gmail_v1.Schema$MessagePart[], mimeType: string): string | null => {
    for (const part of parts) {
      if (part.mimeType === mimeType && part.body && part.body.data) {
        return decodeBase64Url(part.body.data);
      }
      if (part.parts) {
        const nested = findPart(part.parts, mimeType);
        if (nested) return nested;
      }
    }
    return null;
  };
  const htmlBody = findPart(payload.parts, "text/html");
  if (htmlBody) return htmlBody;
  const textBody = findPart(payload.parts, "text/plain");
  if (textBody) return textBody;
  return "Could not parse email body.";
}

function decodeBase64Url(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return Buffer.from(str, "base64").toString("utf-8");
}
