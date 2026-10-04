import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaRegClock, FaCoins, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
const JobDisplay = () => {
  // State for job data, loading, error, pagination
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);  // Track current page
  const [totalPages, setTotalPages] = useState(1);    // Track total pages
  const [pageSize] = useState(10);                    // Set page size

  // Fetch jobs from the API with pagination
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/v1/jobs?page=${currentPage}&size=${pageSize}`);
        setJobs(response.data.body.data.jobs);
        setTotalPages(response.data.body.data.totalPages); // Set total pages
        setLoading(false);
      } catch (err) {
        setError('Error fetching job postings');
        setLoading(false);
      }
    };

    fetchJobs();
  }, [currentPage, pageSize]);  // Re-fetch jobs whenever currentPage or pageSize changes

  // If loading, show a loading message
  if (loading) {
    return <div>Loading...</div>;
  }

  // If there is an error, show an error message
  if (error) {
    return <div>{error}</div>;
  }

  // Function to handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);  // Update current page
    }
  };
 // Function to handle clicking on the job title
//  const handleTitleClick = (jobId) => {
//   navigate(`/jobinfo/${jobId}`); // Navigate to JobInformation with jobId as a parameter
// };
  return (
    <div className="flex justify-center">
      <div className="w-3/5">
        {jobs.map((job, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-3xl font-semibold mb-2">
              <Link to={`/jobinfo/${job.jobId}`} className="text-blue-600 hover:text-black">
                
                {getTitle(job)}
              </Link>
            </h2>
            <div className="flex flex-wrap mb-4">
              <span className="text-black bg-gray-300 px-2 py-1 rounded-full mr-2 mb-2 hover:bg-gray-400">{job.subjects}</span>
            </div>
            <p className="text-gray-700 mb-4">{job.jobRequirements}</p>
            <div className="flex items-center text-gray-600 mb-4">
              <FaRegClock className="mr-1" />
              <p>{getFormattedDate(job.createdAt)}</p>
            </div>
            <div className="flex items-center text-gray-600 mb-4">
              <FaMapMarkerAlt className="mr-1" />
              <p>{job.location}</p>
            </div>
            <div className="flex items-center text-gray-600 mb-4">
              <p>Budget: </p>
              <p className="ml-1">{job.budget}$  {job.frequency}</p>
            </div>
            <div className="flex items-center text-gray-600 relative">
              <FaCoins className="mr-1" />
              <p>{job.coins} coins</p>
              <span className="absolute left-0 bottom-full bg-gray-700 text-white px-2 py-1 rounded-md opacity-0 hover:opacity-100 transition-opacity duration-300">
                {job.coins} coins to Apply for this job
              </span>
            </div>
          </div>
        ))}

        {/* Pagination controls */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded-l-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <FaArrowLeft />
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

// Function to get the formatted date
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

// Function to get the modified title based on meetingOptions and location
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

export default JobDisplay;
