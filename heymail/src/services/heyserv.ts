import type { Email } from "../types/email";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export async function fetchEmails(token: string): Promise<Email[]> {
  const res = await fetch(`${API_BASE_URL}/email`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.messages;
}

export async function sendEmail(token: string, email: Omit<Email, "id" | "read" | "date">): Promise<Email> {
  const res = await fetch(`${API_BASE_URL}/email/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(email),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function summarizeEmail(token: string, emailBody: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/email/summarize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ body: emailBody }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.summary;
}

export async function draftReply(token: string, email: Email): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/email/draft-reply`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(email),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.draft;
}
