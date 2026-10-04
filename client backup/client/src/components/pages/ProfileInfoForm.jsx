import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FiCheck } from "react-icons/fi";
import "./ProfileInfoForm.css";
import {saveProfileDetails,} from "../services/profileService";
import Validation from "../services/Validation";
const ProfileInfoForm = ({ nextStep, prevStep }) => {
  const [formData, setFormData] = useState({
    userId: 150,
    companyName: "",
    role: "",
    displayName: "",
    gender: "",
    birthdate: "",
    location: "",
    postalCode: "",
    phoneNumber: "",
    profileDescription: "",
    imagePath: "",
    isCompany: "individual",
  });
  const [message, setMessage] = useState(null);
  const [errors, setErrors]  = useState({});
  const handleChange = (e) => {
    const { name, value } = e.target;
  
    // Clear the specific error when the user changes the input field
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: undefined,
    }));
  
    let updatedFormData;
  
    // Handle specific field updates
    if (name === "isCompany") {
      // Directly set the string value for isCompany
      updatedFormData = { ...formData, [name]: value };
    } else if (name === "birthdate") {
      // Format the date value
      const formattedDate = value
        .split("-")
        .map((part, index) => {
          return index === 1 || index === 2 ? part.padStart(2, "0") : part;
        })
        .join("-");
      updatedFormData = { ...formData, [name]: formattedDate };
      console.log("date", formattedDate);
    } else {
      // Update other fields
      updatedFormData = { ...formData, [name]: value };
    }
  
    // Update the form data state
    setFormData(updatedFormData);
  
    // Save the updated form data to localStorage
    localStorage.setItem("profileInfo", JSON.stringify(updatedFormData));
  };
  
   // Added function to validate required fields before proceeding to the next step
   const validateAndContinue = (e) => {
    e.preventDefault();
    const validationErrors = Validation(formData);
    setErrors(validationErrors);
    // If no validation errors, proceed to the next step
    if (Object.keys(validationErrors).length === 0) {
      nextStep();
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = Validation(formData);
    setErrors(validationErrors);
    console.log("formdata",formData);
    // Check if there are any errors before proceeding
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await saveProfileDetails(formData);
        console.log("resp",response);
        if (response.success) {
          setMessage({
            type: "success",
            text: "Profile details saved successfully",
          });
        } else {
          setMessage({
            type: "error",
            text: response.error || "Failed to save profile details",
          });
        }
      } catch (error) {
        console.error("Error saving profile details:", error);
        setMessage({
          type: "error",
          text: "An error occurred while saving profile details",
        });
      }
    } else {
      console.log("err", validationErrors);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mt-10 px-5">
      <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
      {/* Message display */}
      {message && (
        <div
          className={`text-lg ${
            message.type === "error" ? "text-red-600" : "text-green-600"
          } mb-4`}
        >
          {message.text}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-1">
          <div className="mb-4">
            <label
              htmlFor="isCompany"
              className="block text-lg font-medium text-gray-700"
            >
              Joining as
            </label>
            <select
              id="isCompany"
              name="isCompany"
              value={formData.isCompany}
              onChange={handleChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
            >
              <option value="individual">Individual Teacher</option>
              <option value="company">Company</option>
            </select>
          </div>
          {formData.isCompany === "company" && (
       <>
        <div className="mb-4">
            <label
                htmlFor="companyName"
                className="block text-lg font-medium text-gray-700"
            >
                Company Name
            </label>
            <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                autoComplete="companyName"
                className="mt-1 mr-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md"
                style={{ padding: "10px", height: "35px" }}
            />
        </div>
        <div className="mb-4">
            <label
                htmlFor="role"
                className="block text-lg font-medium text-gray-700"
            >
                Role
            </label>
            <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                autoComplete="role"
                className="mt-1 mr-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md"
                style={{ padding: "10px", height: "35px" }}
            />
        </div>
        </>
      )}
          <div className="mb-4">
            <label
              htmlFor="displayName"
              className="block text-lg font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              autoComplete="given-name"
              className={`mt-1 mr-2 border ${
                errors.displayName ? "border-red-500" : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
              style={{ padding: "10px", height: "35px" }}
              
            />
            {errors.displayName && (
                <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>
              )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="gender"
              className="block text-lg font-medium text-gray-700"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 mr-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md"
            >
              <option value="male">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="mb-4">
  <label
    htmlFor="phoneNumber"
    className="block text-lg font-medium text-gray-700"
  >
    Phone Number
  </label>
  <PhoneInput
    country={"us"} // Default country
    value={formData.phoneNumber}
    onChange={(phone) => {
      // Clear the error for the Phone Number field
      setErrors((prevErrors) => ({
        ...prevErrors,
        phoneNumber: undefined, // Remove the error for phoneNumber
      }));

      // Update the phone number in the form data
      setFormData({ ...formData, phoneNumber: phone });
    }}
    inputProps={{
      name: "phoneNumber",
      id: "phoneNumber",
      autoComplete: "phoneNumber",
    }}
    inputclassName={`mt-1 mr-2 border ${
      errors.phoneNumber ? "border-red-500" : "border-gray-300"
    } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
    containerStyle={{ width: "100%" }}
  />
  {errors.phoneNumber && (
    <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
  )}
</div>
 </div>
        <div className="col-span-1">
          <div className="mb-4">
            <label
              htmlFor="birthdate"
              className="block text-lg font-medium text-gray-700"
            >
              Birthdate
            </label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              autoComplete="birthdate"
              className={`mt-1 mr-2 border ${
                errors.birthdate ? "border-red-500" : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
              style={{ padding: "10px", height: "35px" }}
            />
            {errors.birthdate && (
                <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>
              )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="location"
              className="block text-lg font-medium text-gray-700"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              autoComplete="location"
              className={`mt-1 mr-2 border ${
                errors.location ? "border-red-500" : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
              style={{ padding: "10px", height: "35px" }}
            />
            {errors.birthdate && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="postalCode"
              className="block text-lg font-medium text-gray-700"
            >
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              autoComplete="postalCode"
              className={`mt-1 mr-2 border ${
                errors.postalCode ? "border-red-500" : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
              style={{ padding: "10px", height: "35px" }}
            />
            {errors.postalCode && (
                <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
              )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="profileDescription"
              className="block text-lg font-medium text-gray-700"
            >
              Profile Description
            </label>
            <textarea
              id="profileDescription"
              name="profileDescription"
              value={formData.profileDescription}
              onChange={handleChange}
              autoComplete="profileDescription"
              className={`mt-1 mr-2 border ${
                errors.profileDescription ? "border-red-500" : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
              style={{ padding: "10px", height: "150px" }}
            />
            {errors.profileDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.profileDescription}</p>
              )}
          </div>
        </div>
      </div>
      <div className="mb-4">
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={validateAndContinue}>
          Save and Continue <FiCheck className="mt-1 ml-3" size={24} />
        </button >
      </div>
    </form>
  );
};

export default ProfileInfoForm;