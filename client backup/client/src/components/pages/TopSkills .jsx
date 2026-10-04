import React from 'react';

const TopSkills = () => {
  const skills = [
    "Academic Writing", "Accountancy", "Adobe Photoshop", "Algorithm & Data Structures",
    "Analog Electronics", "Art and Craft", "AutoCAD", "Basic Electronics",
    "BioChemistry", "Biology", "Biotechnology", "Business Management",
    "C/C++", "C#", "Chemistry", "Civil Engineering",
    "Commerce", "Communication Skills", "Company Law", "Computer networking",
    "Computer Science", "Control Systems", "DBMS", "Digital Electronics",
    ".net", "Economics", "Electrical Engineering", "Engineering Mechanics",
    "English", "Environmental Science", "Financial Management", "Fluid Mechanics",
    "French", "Geography", "German", "History",
    "HTML", "IELTS", "Income Tax", "JAVA",
    "Jquery and JavaScript", "Law", "Maths", "Mechanical",
    "Microbiology", "Music", "PHP", "Physics",
    "Political Science", "Programming", "Psychology", "Python",
    "Science", "Selenium Webdriver", "Sociology", "Statistics",
    "Strength of Materials", "Thermodynamics", "Zoology"
  ];

  const columns = [];
  for (let i = 0; i < skills.length; i++) {
    columns.push(
      <div key={i} className="w-full md:w-1/4 mb-4 md:mb-0 px-2">
        <a href="#" className="text-blue-600 text-lg block hover:underline">{skills[i]}</a> {/* Adjusted font size to text-xl */}
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto p-4 md:p-8 pb-12"> {/* Increased padding bottom to pb-12 */}
      <h2 className="text-lg font-semibold mb-4 text-center">Top Subjects and Skills</h2>
      <div className="flex flex-wrap justify-center">
        {columns}
      </div>
    </div>
  );
};

export default TopSkills;
