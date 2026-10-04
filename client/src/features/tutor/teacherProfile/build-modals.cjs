const fs = require("fs");
const path = require("path");
const dir = __dirname;

function dedent(txt) {
  return txt.split("\n").map((l) => l.replace(/^  /, "")).join("\n");
}

let edu = fs.readFileSync(path.join(dir, "_EducationEditModal.txt"), "utf8");
edu = edu.replace(/^  const EducationEditModal/m, "export const EducationEditModal");
edu = edu.replace(
  /\n    logger\.debug\('EducationEditModal - received education:[\s\S]*?const formatDateForInput = \([\s\S]*?\n    \};\n\n/,
  "\n"
);
edu = dedent(edu);
edu =
  "import React, { useState } from 'react';\nimport { formatDateForInput } from './formatDateForInput';\nimport logger from '../../../utils/logger';\n\n" +
  edu;
fs.writeFileSync(path.join(dir, "EducationEditModal.jsx"), edu);

let exp = fs.readFileSync(path.join(dir, "_ExperienceEditModal.txt"), "utf8");
exp = exp.replace(/^  const ExperienceEditModal/m, "export const ExperienceEditModal");
exp = exp.replace(
  /\n    \/\/ Format date for HTML date input[\s\S]*?const formatDateForInput = \([\s\S]*?\n    \};\n\n/,
  "\n"
);
exp = dedent(exp);
exp =
  "import React, { useState } from 'react';\nimport { formatDateForInput } from './formatDateForInput';\n\n" +
  exp;
fs.writeFileSync(path.join(dir, "ExperienceEditModal.jsx"), exp);

let teach = fs.readFileSync(path.join(dir, "_TeachingDetailsEditModal.txt"), "utf8");
teach = teach.replace(/^  const TeachingDetailsEditModal/m, "export const TeachingDetailsEditModal");
teach = dedent(teach);
teach = "import React, { useState } from 'react';\n\n" + teach;
fs.writeFileSync(path.join(dir, "TeachingDetailsEditModal.jsx"), teach);

console.log("built modals");
