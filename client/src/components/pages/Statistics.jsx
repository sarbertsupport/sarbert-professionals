import React from 'react';

const Statistics = () => {
  return (
    <div className="max-w-screen-lg mx-auto p-4 md:p-8 mt-8"> {/* Added margin from the top */}
      {/* Statistics Sections */}
      <div className="flex flex-col md:flex-row md:space-x-8 mb-8"> {/* Increased space between sections */}
        {/* Subjects Section */}
        <div className="flex-1 md:flex-auto flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2">5000+</h2> {/* Moved numbers to the top */}
          <p className="text-lg">Subjects</p> {/* Added description below the numbers */}
        </div>
        {/* Skills Section */}
        <div className="flex-1 md:flex-auto flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2">1000+</h2> {/* Moved numbers to the top */}
          <p className="text-lg">Skills</p> {/* Added description below the numbers */}
        </div>
        {/* Languages Section */}
        <div className="flex-1 md:flex-auto flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2">500+</h2> {/* Moved numbers to the top */}
          <p className="text-lg">Languages</p> {/* Added description below the numbers */}
        </div>
      </div>
      {/* What we do Section */}
      <div className="bg-gray-100 p-8 rounded-xl"> {/* Gray background and padding for "What we do" section */}
        <h2 className="text-lg font-semibold mb-4 text-center">About Us</h2>
        <p className="text-lg mb-4">Tutorspt is a free website that connects students and teachers around the world.It has Teachers from over 100 countries.</p> {/* Added space between paragraphs */}
        <p className="text-lg">Trusted by thousands, Tutorspt offers tutoring, coaching, and academic assistance in over 5500 subjects, including help with assignments, projects, and dissertations.</p>
      </div>
    </div>
  );
};

export default Statistics;
