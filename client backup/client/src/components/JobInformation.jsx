import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import getTutorRequestById from './service/GetTutorRequestService';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
const JobInformation = () => {
  // Define job data within the component
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  console.log("jobId",jobId)
  useEffect(() => {
    // Fetch job details using jobId
    const fetchJob = async () => {
      const jobData = await getTutorRequestById(jobId);
      if (jobData) {
        setJob(jobData);
      }
    };
    fetchJob();
  }, [jobId]);

  if (!job) {
    return <p>Loading...</p>;
  }
  // Function to calculate the recommendation based on job data
  const calculateRecommendation = () => {
    // Logic to calculate recommendation based on job data
    return (
      <div className="bg-blue-200 p-4 mb-4 rounded-lg">
        <h3 className="font-semibold text-3xl mb-2">Recommendation</h3> {/* Increased font size */}
        <p className="text-lg">Be the first one to apply. You have a very high chance of securing this student.</p> {/* Decreased font size */}
        <p className="text-lg mt-2">Above Recommendation is made automatically based on the following data:</p> {/* Decreased font size */}
        <ul className="list-disc list-inside">
          <li className="text-lg">0 teachers contacted the student.</li> {/* Decreased font size */}
          <li className="text-lg">0 teachers contacted by the student.</li> {/* Decreased font size */}
          <li className="text-lg">Price may decrease to 0 coins in 35 hours.</li> {/* Decreased font size */}
          <li className="text-lg">Price will increase as more teachers apply.</li> {/* Decreased font size */}
          <li className="text-lg">Student verified phone number and can be called. Therefore, no coins will be refunded even if student doesn't look at your message.</li> {/* Decreased font size */}
        </ul>
      </div>
    );
  };

  // Function to generate dynamic title including location
  const getTitle = (job) => {
    if (job.meetingOptions === "Travel to tutor" && job.location) {
      return `Home ${job.subjects} Trainer needed in ${job.location}`;
    }
    if (job.meetingOptions === "At my place" && job.location) {
      return `Home ${job.subjects} Trainer needed in ${job.location}`;
    }
    if (job.meetingOptions === "Online" && job.location) {
      return `Online ${job.subjects} Trainer needed in ${job.location}`;
    }
    return `${job.subjects} in ${job.location}`;
  };

  return (
    <div className="px-4 lg:flex lg:justify-center"> {/* Added padding and flex for responsiveness */}
      <div className="lg:w-1/2 bg-white rounded-lg shadow-md p-6 mb-8"> {/* Adjusted width to w-1/2 and added flex for responsiveness */}
        <h2 className="text-3xl font-semibold mb-2">{getTitle(job)}</h2> {/* Updated title to include location and type */}
        {calculateRecommendation()}
        <div className="flex flex-col mb-4 lg:flex-row lg:items-center"> {/* Added flex for responsiveness */}
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2 lg:mb-0 lg:mr-4">Message and View Phone Number ({job.coins} coins)</button> {/* Adjusted margin for responsiveness */}
          {job.viewPhoneNumber && (
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">View Phone Number ({job.coins} coins)</button>
          )}
        </div>
        <div className="flex flex-wrap mb-4">
          {job.subjects.map((subject, index) => (
            <span key={index} className="text-black bg-gray-300 px-2 py-1 rounded-full mr-2 mb-2 hover:bg-gray-400">{subject}</span>
          ))}
        </div>
        <div className="text-gray-600 mb-4">
          <p className="text-md">Posted At: &nbsp;&nbsp; {getFormattedDate(job.createdAt)}</p> {/* Decreased font size for mobile */}
          <p className="text-md">Level: &nbsp;&nbsp;{job.level}</p> {/* Decreased font size for mobile */}
          <p className="text-md">Rate: &nbsp;&nbsp;${job.budget}({job.frequency})</p> {/* Decreased font size for mobile */}
          <p className="text-md">Job Type: &nbsp;&nbsp;{job.jobType}</p> {/* Decreased font size for mobile */}
          <p className="text-md">Posted By: &nbsp;&nbsp;{job.userId}</p> {/* Decreased font size for mobile */}
          <p className="text-md">Number of Coins: &nbsp;&nbsp;{job.coins}</p> {/* Decreased font size for mobile */}
          <p className="text-md">Which Gender do you prefeer?: &nbsp;&nbsp;{job.genderPreference || "None"}</p> {/* Decreased font size for mobile */}
          <p className="text-md"> Language of Communication: &nbsp;&nbsp;{job.language}</p> {/* Decreased font size for mobile */}
        </div>
        <p className="text-lg text-gray-700">{job.jobRequirements}</p> {/* Decreased font size for mobile */}
      </div>
    </div>
  );
};// Function to get the formatted date
const getFormattedDate = (createdAt) => {
  const date = parseISO(createdAt); // Parse the createdAt string into a Date object
  const distance = formatDistanceToNow(date, { addSuffix: true }); // Get the relative time distance
  const formattedDate = format(date, "MMM dd"); // Format the date as "Nov 15"
  
  // If the job was created less than 24 hours ago, show "X time ago"
  const hoursDifference = (new Date() - date) / (1000 * 60 * 60); // Get the difference in hours
  if (hoursDifference < 24) {
    return distance; // Display the relative time (e.g., "1 hour ago")
  } else {
    return formattedDate; // Display the formatted date (e.g., "Nov 15")
  }
};

export default JobInformation;
