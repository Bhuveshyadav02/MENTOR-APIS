const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors'); // Import cors package
const logger = require('morgan');
require('dotenv').config();

const app = express();

// CORS setup
const whitelist = ['http://localhost:3000', 'http://localhost:5173', 'http://Abhay-pc:3001','http://127.0.0.1:5173'];
const corsOptionsDelegate = (req, callback) => {
  const corsOptions = whitelist.indexOf(req.header('Origin')) !== -1
    ? { origin: true }
    : { origin: false };
  callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate)); // Apply CORS middleware

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));

// Initialize session management
app.use(session({
  secret: process.env.SECRET_KEY, // Your secret key
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport and use Passport session middleware
app.use(passport.initialize());
app.use(passport.session());

// Set Pug as the view engine and set the directory where your Pug files are located
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Import your routers
const indexRouter = require('./routes/index');
const teacherRouter = require('./routes/teacher');
const coursesRouter = require('./routes/courses');
const studentRouter = require('./routes/Student');
const resultRouter = require('./routes/result');
const mentoringRouter = require('./routes/mentoring');

// Use the routers
app.use('/', indexRouter);
app.use('/teachers', teacherRouter);
app.use('/courses', coursesRouter);
app.use('/students', studentRouter);
app.use('/result', resultRouter);
app.use('/mentoring', mentoringRouter);

async function startServer() {
  try {
    const url = process.env.MONGO_URL;
    console.log(url);

    await mongoose.connect(url);

    console.log("Database connected successfully");

    // Start the server
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  } catch (err) {
    console.error("Error connecting to the database", err);
  }
}

startServer();

module.exports = app;
