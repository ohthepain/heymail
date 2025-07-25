import React, { useState, useEffect } from "react";

// Main App component for the AI-based Gmail client
const App = () => {
  // State to manage the currently selected email for viewing
  const [selectedEmail, setSelectedEmail] = useState(null);
  // State to store mock email data
  const [emails, setEmails] = useState([]);
  // State to hold the AI-generated response (summary or draft)
  const [aiResponse, setAiResponse] = useState("");
  // State to indicate if an AI operation is in progress
  const [isLoading, setIsLoading] = useState(false);
  // State to control whether the compose email view is active
  const [composeMode, setComposeMode] = useState(false);
  // States for the compose email form fields
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  // State for displaying messages to the user (e.g., "Email sent!")
  const [message, setMessage] = useState("");

  // Effect to initialize mock email data when the component mounts
  useEffect(() => {
    // Generate some mock email data
    const mockEmails = [
      {
        id: "e1",
        sender: "support@example.com",
        subject: "Your recent order confirmation",
        body: "Dear Customer,\n\nThank you for your recent purchase! Your order #12345 has been confirmed and will be shipped within 2-3 business days. You can track your order at [link to tracking].\n\nBest regards,\nThe Example Team",
        date: "2025-07-20",
        read: false,
      },
      {
        id: "e2",
        sender: "newsletter@techupdates.com",
        subject: "Weekly Tech News Digest",
        body: "Hi there,\n\nWelcome to your weekly dose of tech news! This week, we cover the latest advancements in AI, breakthroughs in quantum computing, and the new smartphone releases. Read more on our blog.\n\nStay curious,\nTech Updates Team",
        date: "2025-07-19",
        read: true,
      },
      {
        id: "e3",
        sender: "colleague@work.com",
        subject: "Meeting follow-up: Project Alpha",
        body: "Hi Team,\n\nFollowing up on our meeting yesterday regarding Project Alpha. Please ensure all tasks assigned are updated in the project management tool by end of day tomorrow. Let me know if you have any blockers.\n\nThanks,\nYour Colleague",
        date: "2025-07-18",
        read: false,
      },
      {
        id: "e4",
        sender: "marketing@offers.com",
        subject: "Exclusive Discount Just For You!",
        body: "Hello!\n\nWe're excited to offer you an exclusive 20% discount on all our premium products for a limited time. Use code \"SAVE20\" at checkout. Don't miss out!\n\nShop now,\nOffers Team",
        date: "2025-07-17",
        read: true,
      },
    ];
    setEmails(mockEmails);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to handle selecting an email from the list
  const handleEmailSelect = (email) => {
    setSelectedEmail(email);
    setAiResponse(""); // Clear previous AI response
    // Mark email as read
    setEmails((prevEmails) => prevEmails.map((e) => (e.id === email.id ? { ...e, read: true } : e)));
  };

  // Function to call the Gemini API for text generation (e.g., summary, draft)
  const callGeminiApi = async (prompt) => {
    setIsLoading(true); // Show loading indicator
    setAiResponse(""); // Clear previous AI response
    setMessage(""); // Clear any previous messages

    try {
      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const apiKey = ""; // API key is provided by the Canvas environment
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      // Check if the response structure is as expected
      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const text = result.candidates[0].content.parts[0].text;
        setAiResponse(text); // Set the AI-generated response
      } else {
        setAiResponse("No AI response generated. Please try again.");
        console.error("Unexpected API response structure:", result);
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setAiResponse(`Failed to get AI response: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  // Function to handle summarizing the selected email
  const handleSummarize = () => {
    if (selectedEmail) {
      const prompt = `Summarize the following email concisely:\n\n${selectedEmail.body}`;
      callGeminiApi(prompt);
    }
  };

  // Function to handle drafting a reply to the selected email
  const handleDraftReply = () => {
    if (selectedEmail) {
      const prompt = `Draft a polite and professional reply to the following email. Keep it brief and acknowledge the sender's points:\n\nSender: ${selectedEmail.sender}\nSubject: ${selectedEmail.subject}\nBody:\n${selectedEmail.body}`;
      callGeminiApi(prompt);
    }
  };

  // Function to handle sending a new email (simulated)
  const handleSendEmail = (e) => {
    e.preventDefault(); // Prevent default form submission

    // Basic validation
    if (!composeTo || !composeSubject || !composeBody) {
      setMessage("Please fill in all fields (To, Subject, Body).");
      return;
    }

    // Simulate sending the email
    const newEmail = {
      id: `e${emails.length + 1}`, // Simple unique ID
      sender: "me@example.com", // Assuming "me" as the sender
      to: composeTo,
      subject: composeSubject,
      body: composeBody,
      date: new Date().toISOString().split("T")[0], // Current date
      read: true, // Sent emails are considered read
      type: "sent", // Mark as sent
    };

    // Add the new email to the list (for display purposes, not actual sending)
    setEmails((prevEmails) => [...prevEmails, newEmail]);

    // Reset compose form fields
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
    setComposeMode(false); // Go back to main view
    setSelectedEmail(newEmail); // Select the newly sent email
    setMessage("Email sent successfully!"); // Display success message

    // Clear message after a few seconds
    setTimeout(() => setMessage(""), 3000);
  };

  // Helper function to format email body for display
  const formatEmailBody = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

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
                Inbox ({emails.filter((e) => !e.read && !e.type).length})
              </a>
            </li>
            {/* Add more navigation items if needed, e.g., Sent, Drafts */}
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
          // Compose Email View
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
                  rows="10"
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
                    From: <span className="font-medium">{selectedEmail.sender}</span>{" "}
                    <span className="ml-4">Date: {selectedEmail.date}</span>
                  </div>
                  <div className="prose text-gray-800 flex-grow overflow-y-auto mb-6">
                    {formatEmailBody(selectedEmail.body)}
                  </div>

                  {/* AI Actions */}
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

                  {/* AI Response Display */}
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
