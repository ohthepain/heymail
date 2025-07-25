export interface Email {
  id: string;
  sender: string;
  to?: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  type?: "inbox" | "sent";
}
