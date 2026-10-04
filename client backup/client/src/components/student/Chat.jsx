import React from 'react';

const Chat = () => {
  return (
    <div className="flex flex-col items-center mt-8">
      {/* Chat Container */}
      <div className="w-full max-w-2xl">
        {/* Top Buttons */}
        <div className="flex justify-start space-x-4 mb-6">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            📱 Tutor Contact Details
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            📖 Tutor Profile
          </button>
          <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
            💳 Pay
          </button>
        </div>

        {/* Message Header */}
        <h2 className="text-lg font-semibold mb-4">
          Messages for 
          <span className="text-blue-500"> Online Computer (ICSE) tutor needed in Embakasi</span>
        </h2>

        {/* Message */}
        <div className="flex items-start space-x-4 mb-6">
          <img
            src="https://via.placeholder.com/50"
            alt="profile"
            className="w-12 h-12 rounded-full"
          />
          <div className="bg-gray-100 p-4 rounded-lg shadow-md w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Hemamalini K</span>
              <span className="text-gray-500 text-sm">Sep 8</span>
            </div>
            <p className="text-gray-700">
              Hi,<br />
              I am K. Hemamalini, a retired computer science teacher. I teach complete Java programming
              from the basics and other programming languages. If you need my service, you may get back
              to me.<br /><br />
              My email id is : hema.oasis@gmail.com<br />
              Best wishes,<br />
              K hemamalini
            </p>
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-300 pt-4">
          <textarea
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Type a message here"
            rows="3"
          ></textarea>
          <div className="flex justify-between items-center mt-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              📩 Send
            </button>
            <a href="#all-messages" className="text-blue-500 hover:underline">
              See all messages for this post
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
