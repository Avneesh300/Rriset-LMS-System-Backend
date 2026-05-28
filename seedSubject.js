require("dotenv").config();
const mongoose = require("mongoose");
const Subject = require("./models/Subject");

// MongoDB Connection
mongoose.connect( process.env.MONGO_URI);

const subjects = [
  { subject_name: "Mathematics" },
  { subject_name: "Science" },
  { subject_name: "English" },
  { subject_name: "Hindi" },
  { subject_name: "Social Science" },
  { subject_name: "Physics" },
  { subject_name: "Chemistry" },
  { subject_name: "Biology" },
  { subject_name: "Computer Science" },
  { subject_name: "Economics" },
  { subject_name: "Accountancy" },
  { subject_name: "Business Studies" },
  { subject_name: "Political Science" },
  { subject_name: "History" },
  { subject_name: "Geography" },
  { subject_name: "Physical Education" },
  { subject_name: "Art" },
  { subject_name: "Music" },
  { subject_name: "GK" },
  { subject_name: "Environmental Studies" },
];

const seedSubjects = async () => {
  try {

    await Subject.deleteMany();

    await Subject.insertMany(subjects);

    console.log("Subjects inserted successfully");

    process.exit();

  } catch (error) {

    console.log(error);

    process.exit(1);
  }
};

seedSubjects();