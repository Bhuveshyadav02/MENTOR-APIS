const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const internshipSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  from: {
    type: Date,
    required: true,
  },
  to: {
    type: Date,
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
  certificate: {
    type: String,
    required: true,
  },
});

const onlineCourseSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
  },
  from: {
    type: Date,
    required: true,
  },
  to: {
    type: Date,
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
  certificate: {
    type: String,
    required: true,
  },
});

const majorAbsenceSchema = new mongoose.Schema({
  reason: {
    type: String,
    required: true,
  },
  from: {
    type: Date,
    required: true,
  },
  to: {
    type: Date,
    required: true,
  },
});

const disciplinarySchema = new mongoose.Schema({
  activity: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  punishment: {
    type: String,
    default: "",
  },
  remark: {
    type: String,
    default: "",
  },
});

const studentSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    degree: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    admissionDate: {
      type: Date,
      required: true,
    },
    isTeacher: {
      type: Boolean,
      default:false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    undertakingUrl: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    internships: [internshipSchema],
    onlineCourses: [onlineCourseSchema],
    majorAbsence: [majorAbsenceSchema],
    disciplinary: [disciplinarySchema],
  },
  {
    timestamps: true,
  }
);

studentSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Student", studentSchema);
