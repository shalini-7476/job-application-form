const mongoose = require("mongoose");

const requiredString = {
  type: String,
  required: true,
  trim: true
};

const applicationSchema = new mongoose.Schema({
  fullname: requiredString,
  dob: requiredString,
  phone: requiredString,
  email: requiredString,
  address: requiredString,
  photo: requiredString,

  applicationDate: requiredString,
  position: requiredString,
  employmentType: requiredString,
  aadhar: requiredString,

  degree: requiredString,
  institute: requiredString,
  year: requiredString,
  grade: requiredString,
  city: requiredString,

  company: requiredString,
  positionHistory: requiredString,
  yearHistory: requiredString,
  reason: requiredString,

  achievement: requiredString,
  level: requiredString,
  yearSkill: requiredString,
  skillInstitute: requiredString,

  familyName: requiredString,
  familyRelation: requiredString,
  familyOccupation: requiredString,

  emergencyName: requiredString,
  emergencyRelation: requiredString,
  emergencyOccupation: requiredString,
  emergencyQualification: requiredString,
  emergencyCity: requiredString
});

module.exports = mongoose.model("Application", applicationSchema);


