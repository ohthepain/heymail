import React, { useState, useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import type { Email } from "./types/email";
import { fetchEmails, sendEmail, summarizeEmail, draftReply } from "./services/heyserv";

const App: React.FC = () => {
  const { keycloak, initialized } = useKeycloak();
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [composeMode, setComposeMode] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (keycloak.authenticated) {
      fetchEmails(keycloak.token!)
        .then(setEmails)
        .catch((err: unknown) =>
          setMessage("Failed to fetch emails: " + (err instanceof Error ? err.message : String(err)))
        );
    }
  }, [keycloak.authenticated, keycloak.token]);

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
    setAiResponse("");
    setEmails((prev) => prev.map((e) => (e.id === email.id ? { ...e, read: true } : e)));
  };

  const handleSummarize = async () => {
    if (!selectedEmail) return;
    setIsLoading(true);
    try {
      const summary = await summarizeEmail(keycloak.token!, selectedEmail.body);
      setAiResponse(summary);
    } catch (err: unknown) {
      setAiResponse("Failed to summarize: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraftReply = async () => {
    if (!selectedEmail) return;
    setIsLoading(true);
    try {
      const draft = await draftReply(keycloak.token!, selectedEmail);
      setAiResponse(draft);
    } catch (err: unknown) {
      setAiResponse("Failed to draft reply: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject || !composeBody) {
      setMessage("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    try {
      const newEmail = await sendEmail(keycloak.token!, {
        sender: keycloak.tokenParsed?.email || "me",
        to: composeTo,
        subject: composeSubject,
        body: composeBody,
        type: "sent",
      });
      setEmails((prev) => [...prev, newEmail]);
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
      setComposeMode(false);
      setSelectedEmail(newEmail);
      setMessage("Email sent!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: unknown) {
      setMessage("Failed to send email: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const formatEmailBody = (text: string) =>
    text.split("\n").map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));

  if (!initialized) return <div>Loading...</div>;

  if (!keycloak.authenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <button
          onClick={() => keycloak.login()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full shadow-md transition duration-300 ease-in-out text-xl"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      {/* Sidebar */}
      <div className="w-64 bg-white p-4 shadow-lg rounded-r-xl flex flex-col">
        <h1 className="text-2xl font-bold text-blue-600 mb-6">AI Mail</h1>
        <button
          onClick={() => {
            setComposeMode(true);
            setSelectedEmail(null);
            setAiResponse("");
            setMessage("");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-full shadow-md transition duration-300 ease-in-out mb-6 flex items-center justify-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Compose
        </button>
        <nav className="flex-grow">
          <ul>
            <li className="mb-2">
              <a
                href="#"
                onClick={() => {
                  setComposeMode(false);
                  setSelectedEmail(null);
                  setAiResponse("");
                  setMessage("");
                }}
                className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition duration-200"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m14 0v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7m14 0h-2M4 13h2m8 0h.01M12 13h.01"
                  ></path>
                </svg>
                Inbox ({emails.filter((e) => !e.read && (!e.type || e.type === "inbox")).length})
              </a>
            </li>
            <li className="mb-2">
              <a
                href="#"
                onClick={() => {
                  setComposeMode(false);
                  setSelectedEmail(null);
                  setAiResponse("");
                  setMessage("");
                }}
                className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition duration-200"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 13H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z"
                  ></path>
                </svg>
                All Mail
              </a>
            </li>
            <li className="mb-2">
              <a
                href="#"
                onClick={() => {
                  setComposeMode(false);
                  setSelectedEmail(null);
                  setAiResponse("");
                  setMessage("");
                }}
                className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition duration-200"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  ></path>
                </svg>
                Sent
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow p-6 flex flex-col">
        {message && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{message}</span>
          </div>
        )}
        {composeMode ? (
          <div className="bg-white p-6 rounded-xl shadow-lg flex-grow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">New Message</h2>
            <form onSubmit={handleSendEmail}>
              <div className="mb-4">
                <label htmlFor="to" className="block text-gray-700 text-sm font-bold mb-2">
                  To:
                </label>
                <input
                  type="email"
                  id="to"
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="subject" className="block text-gray-700 text-sm font-bold mb-2">
                  Subject:
                </label>
                <input
                  type="text"
                  id="subject"
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="body" className="block text-gray-700 text-sm font-bold mb-2">
                  Body:
                </label>
                <textarea
                  id="body"
                  rows={10}
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setComposeMode(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out"
                  disabled={isLoading}
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-grow">
            {/* Email List Pane */}
            <div className="w-1/3 bg-white p-4 rounded-xl shadow-lg overflow-y-auto mr-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Inbox</h2>
              {emails.filter((e) => !e.type || e.type === "inbox").length === 0 ? (
                <p className="text-gray-500">No emails in your inbox.</p>
              ) : (
                <ul>
                  {emails
                    .filter((e) => !e.type || e.type === "inbox")
                    .map((email) => (
                      <li
                        key={email.id}
                        onClick={() => handleEmailSelect(email)}
                        className={`p-3 border-b border-gray-200 cursor-pointer rounded-lg mb-1 transition duration-200 ease-in-out ${
                          selectedEmail?.id === email.id
                            ? "bg-blue-100 border-blue-300"
                            : email.read
                            ? "bg-gray-50 hover:bg-gray-100"
                            : "bg-white hover:bg-blue-50 font-bold"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-sm ${email.read ? "text-gray-600" : "text-gray-900 font-semibold"}`}>
                            {email.sender}
                          </span>
                          <span className="text-xs text-gray-500">{email.date}</span>
                        </div>
                        <p
                          className={`text-base ${
                            email.read ? "text-gray-700" : "text-gray-900 font-semibold"
                          } truncate`}
                        >
                          {email.subject}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{email.body.substring(0, 50)}...</p>
                      </li>
                    ))}
                </ul>
              )}
            </div>
            {/* Email Detail Pane */}
            <div className="w-2/3 bg-white p-6 rounded-xl shadow-lg flex flex-col">
              {selectedEmail ? (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">{selectedEmail.subject}</h2>
                  <div className="text-gray-600 text-sm mb-4">
                    From: <span className="font-medium">{selectedEmail.sender}</span>
                    <span className="ml-4">Date: {selectedEmail.date}</span>
                  </div>
                  <div className="prose text-gray-800 flex-grow overflow-y-auto mb-6">
                    {formatEmailBody(selectedEmail.body)}
                  </div>
                  <div className="flex space-x-4 mb-6">
                    <button
                      onClick={handleSummarize}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out flex items-center"
                      disabled={isLoading}
                    >
                      {isLoading && <span className="animate-spin mr-2">⚙️</span>}
                      Summarize
                    </button>
                    <button
                      onClick={handleDraftReply}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out flex items-center"
                      disabled={isLoading}
                    >
                      {isLoading && <span className="animate-spin mr-2">⚙️</span>}
                      Draft Reply
                    </button>
                  </div>
                  {aiResponse && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mt-4">
                      <h3 className="font-semibold mb-2">AI Suggestion:</h3>
                      <p className="whitespace-pre-wrap">{aiResponse}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg
                    className="w-16 h-16 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 13H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  <p className="text-lg">Select an email to view its content and use AI features.</p>
                  <p className="text-md mt-2">Or click "Compose" to send a new message.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
