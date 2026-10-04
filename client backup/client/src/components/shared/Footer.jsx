import React from 'react';

const Footer = () => {
  const itemsColumn1 = [
    "About Us", "Contact Us", "Terms of Service", "Privacy Policy"
  ];

  const itemsColumn2 = [
    "Subjects", "Skills", "Teachers", "Teaching Jobs"
  ];

  const itemsColumn3 = [
    "Blog", "FAQ", "Testimonials", "Resources"
  ];

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-screen-lg mx-auto flex flex-wrap justify-between">
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-4 mb-4">
          <h3 className="text-xl md:text-3xl font-semibold mb-4 border-b-4 border-green-500 pb-2">About Us</h3>
          <ul className="list-none p-0 flex flex-wrap">
            {itemsColumn1.map((item, index) => (
              <li key={index} className="mb-2 w-full md:w-auto md:mr-6">
                <a href="#" className="hover:underline">{item}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-4 mb-4">
          <h3 className="text-xl md:text-3xl font-semibold mb-4 border-b-4 border-green-500 pb-2">Explore More</h3>
          <ul className="list-none p-0 flex flex-wrap">
            {itemsColumn2.map((item, index) => (
              <li key={index} className="mb-2 w-full md:w-auto md:mr-6">
                <a href="#" className="hover:underline">{item}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-4 mb-4">
          <h3 className="text-xl md:text-3xl font-semibold mb-4 border-b-4 border-green-500 pb-2">Connect with Us</h3>
          <ul className="list-none p-0 flex flex-wrap">
            {itemsColumn3.map((item, index) => (
              <li key={index} className="mb-2 w-full md:w-auto md:mr-6">
                <a href="#" className="hover:underline">{item}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
