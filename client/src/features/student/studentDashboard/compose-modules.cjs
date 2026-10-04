const fs = require("fs");
const path = require("path");
const dir = __dirname;

function dedent2(txt) {
  return txt
    .split("\n")
    .map((l) => (l.startsWith("  ") ? l.slice(2) : l))
    .join("\n");
}

const updateRaw = fs.readFileSync(path.join(dir, "_UpdateModal.txt"), "utf8");
const updateBody = dedent2(updateRaw).replace(
  /^const UpdateJobModal = /,
  "export const UpdateJobModal = "
);
const updateHeader = `import React, { useState } from 'react';
import {
  FaEdit,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaBriefcase,
  FaBook,
  FaHandshake,
  FaGraduationCap,
  FaMoneyBillWave,
  FaClock,
  FaUsers,
  FaLanguage,
  FaEye,
  FaMapMarkerAlt,
  FaPhone,
  FaFileAlt,
  FaImage,
  FaSave,
} from 'react-icons/fa';

`;
fs.writeFileSync(path.join(dir, "UpdateJobModal.jsx"), updateHeader + updateBody + "\n");

const jobRaw = fs.readFileSync(path.join(dir, "_Job Card.txt"), "utf8");
let jobBody = dedent2(jobRaw);
jobBody = jobBody.replace(/^\/\/ Enhanced Job Card.*\n/, "");
jobBody = jobBody.replace(/^const JobCard = \(\{ job \}\) => \(/, "export function StudentDashboardJobCard({\n  job,\n  expandedDescriptions,\n  onToggleDescription,\n  onUpdateClick,\n  onCloseClick,\n  onViewMessages,\n  formatJobPostedDate,\n  truncateJobDescription,\n}) {\n  return (");
jobBody = jobBody.replace(/\n  \);$/, "\n  );\n}");
const jobHeader = `import React from 'react';
import {
  FaBriefcase,
  FaCheckCircle,
  FaCalendarAlt,
  FaHandshake,
  FaEdit,
  FaTimes,
  FaBook,
  FaClock,
  FaGraduationCap,
  FaMoneyBillWave,
  FaLanguage,
  FaMapMarkerAlt,
  FaChevronDown,
  FaChevronUp,
  FaEye,
} from 'react-icons/fa';

`;
jobBody = jobBody
  .replace(/formatDate\(/g, "formatJobPostedDate(")
  .replace(/truncateDescription\(/g, "truncateJobDescription(")
  .replace(/toggleDescription\(/g, "onToggleDescription(")
  .replace(/handleUpdateClick\(/g, "onUpdateClick(")
  .replace(/handleCloseClick\(/g, "onCloseClick(")
  .replace(/handleViewMessages\(/g, "onViewMessages(");
fs.writeFileSync(path.join(dir, "StudentDashboardJobCard.jsx"), jobHeader + jobBody + "\n");

console.log("composed student dashboard modules");
