import React from 'react';

const Details = () => {
  return (
    <div className="max-w-screen-lg mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:space-x-8"> {/* Increased space between sections */}
        {/* Teachers Section */}
        <div className="flex-1 lg:flex-2 flex flex-col justify-center items-center"> {/* Adjusted section width and centered content */}
          <h2 className="text-3xl font-semibold mb-4 text-green-600">Teachers</h2> {/* Set text color to green */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* All Teachers Card */}
            <a href="#" className="bg-gray-100 p-4 rounded-lg shadow-md block w-full md:w-auto"> {/* Set item width to full on mobile, auto on larger screens */}
              <h3 className="text-xl font-semibold mb-2">All Teachers</h3>
            </a>
            {/* Online Teachers Card */}
            <a href="#" className="bg-gray-100 p-4 rounded-lg shadow-md block w-full md:w-auto"> {/* Set item width to full on mobile, auto on larger screens */}
              <h3 className="text-xl font-semibold mb-2">Online Teachers</h3>
            </a>
            {/* Home Teachers Card */}
            <a href="#" className="bg-gray-100 p-4 rounded-lg shadow-md block w-full md:w-auto"> {/* Set item width to full on mobile, auto on larger screens */}
              <h3 className="text-xl font-semibold mb-2">Home Teachers</h3>
            </a>
            {/* Assignment Help Card */}
            <a href="#" className="bg-gray-100 p-4 rounded-lg shadow-md block w-full md:w-auto"> {/* Set item width to full on mobile, auto on larger screens */}
              <h3 className="text-xl font-semibold mb-2">Assignment Help</h3>
            </a>
          </div>
        </div>
        <div className="hidden md:block" style={{ width: '40px' }}></div> {/* Increased space between sections on larger screens */}
        {/* Teaching Jobs Section */}
        <div className="flex-1 lg:flex-2 flex flex-col justify-center items-center"> {/* Adjusted section width and centered content */}
          <h2 className="text-3xl font-semibold mb-4 text-green-600">Teaching Jobs</h2> {/* Set text color to green */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* All Jobs Card */}
            <a href="#" className="bg-gray-100 p-4 rounded-lg shadow-md block w-full md:w-auto"> {/* Set item width to full on mobile, auto on larger screens */}
              <h3 className="text-xl font-semibold mb-2">All Jobs</h3>
            </a>
            {/* Online Teaching Card */}
            <a href="#" className="bg-gray-100 p-4 rounded-lg shadow-md block w-full md:w-auto"> {/* Set item width to full on mobile, auto on larger screens */}
              <h3 className="text-xl font-semibold mb-2">Online Teaching</h3>
            </a>
            {/* Home Teaching Card */}
            <a href="#" className="bg-gray-100 p-4 rounded-lg shadow-md block w-full md:w-auto"> {/* Set item width to full on mobile, auto on larger screens */}
              <h3 className="text-xl font-semibold mb-2">Home Teaching</h3>
            </a>
            {/* Assignment Jobs Card */}
            <a href="#" className="bg-gray-100 p-4 rounded-lg shadow-md block w-full md:w-auto"> {/* Set item width to full on mobile, auto on larger screens */}
              <h3 className="text-xl font-semibold mb-2">Assignment Jobs</h3>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
