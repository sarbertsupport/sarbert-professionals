import React, { useState } from 'react';

const messagesData = [
  {
    id: 1,
    name: "Nibedita Dan",
    date: "Sep 10",
    content: "Hi, I am interested to teach Java. You can visit my profile.",
    read: false,
  },
  {
    id: 2,
    name: "Chinmay Patel",
    date: "Sep 9",
    content: "I am having 15+ years exp as a java developer and trainer, I provide 1 to 1 training in Java through zoom. Pls check my website www.javatutoronline.com You can contact me at +919853166385",
    read: false,
  },
  {
    id: 3,
    name: "Bhuvana",
    date: "Sep 9",
    content: "Hello Sarah. I am an experienced Java developer and trainer for the past 10 years. I can help you learn with Java basics and other Java concepts. I will deliver to the best of my knowledge. Will be glad to assist you in learning Java basics.",
    read: false,
  },
];

const Messages = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter messages based on search term
  const filteredMessages = messagesData.filter((message) =>
    message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center p-6">
      {/* Header */}
      <div className="flex justify-center items-center mb-4 space-x-4">
        <h1 className="text-xl font-semibold">All Messages</h1>
        <button className="text-sm text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">
          View Unread Messages
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex space-x-2 mb-4 w-full max-w-lg">
        <input
          type="text"
          placeholder="Select requirement to filter messages"
          className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring focus:border-blue-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Search</button>
      </div>

      {/* Messages List */}
      <div className="w-full max-w-lg">
        {filteredMessages.map((message) => (
          <div key={message.id} className="border-b py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <h2 className="text-blue-600 font-semibold">{message.name}</h2>
                {/* Show unread message count */}
                {!message.read && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    1
                  </span>
                )}
                <span className="text-gray-500">{message.date}</span>
              </div>
            </div>
            <p className="mt-2 text-gray-600">{message.content}</p>

            {/* Action Links */}
            <div className="flex space-x-4 mt-2">
              <a href="#read-reply" className="text-blue-600 hover:text-blue-800 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2.94 5.235a1 1 0 000 1.414L8.293 12H3.5a1 1 0 000 2h8a1 1 0 000-2h-3.793l5.353-5.351a1 1 0 10-1.414-1.414L8 10.086 4.354 6.44a1 1 0 00-1.414 0z" />
                </svg>
                Read & Reply
              </a>
              <a href="#view-profile" className="text-blue-600 hover:text-blue-800 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 8a6 6 0 11-12 0 6 6 0 0112 0zM6 8a4 4 0 118 0 4 4 0 01-8 0zm4 6a8 8 0 00-7 4 1 1 0 101.732 1A6 6 0 0110 14a6 6 0 015.268 3A1 1 0 1017 18a8 8 0 00-7-4z"
                    clipRule="evenodd"
                  />
                </svg>
                View Profile
              </a>
              <a href="#view-post" className="text-blue-600 hover:text-blue-800 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm12 14H4V4h12v12zm-7-4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" />
                </svg>
                View Post
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* View All Messages Button */}
      <div className="mt-6">
        <button className="text-sm text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
          View all messages
        </button>
      </div>
    </div>
  );
};

export default Messages;
