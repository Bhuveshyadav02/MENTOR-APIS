const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Teacher = require('./models/teacher');
const Student = require('./models/student');
const StudentBatch = require("./models/studentBatch");
const Mentoring = require("./models/mentoringRecord");
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
require('dotenv').config();
const jwt = require('jsonwebtoken');

// Local Strategies
exports.localTeacher = passport.use('teacherLocal', new LocalStrategy(Teacher.authenticate()));
exports.localStudent = passport.use('studentLocal', new LocalStrategy(Student.authenticate()));

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Teacher.findById(id).then((user) => {
    if (user) {
      done(null, user);
    } else {
      Student.findById(id).then((user) => {
        done(null, user);
      }).catch(err => done(err));
    }
  }).catch(err => done(err));
});

// Generate JWT Token
exports.getToken = function(user) {
  return jwt.sign(user, process.env.SECRET_KEY, { expiresIn: 2678400 });
};

// JWT Options
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY;

// JWT Strategies
exports.teacherJWT = passport.use('teacherJWT', new JwtStrategy(opts, (jwt_payload, done) => {
  Teacher.findById(jwt_payload._id).then((user) => {
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  }).catch(err => done(err, false));
}));

exports.studentJWT = passport.use('studentJWT', new JwtStrategy(opts, (jwt_payload, done) => {
  Student.findById(jwt_payload._id).then((user) => {
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  }).catch(err => done(err, false));
}));

// Verify JWT
exports.verifyStudent = passport.authenticate('studentJWT', { session: false });
exports.verifyTeacher = passport.authenticate('teacherJWT', { session: false });

// Verify Admin Middleware
exports.verifyAdmin = function(req, res, next) {
  if (!req.user.isAdmin) {
    const err = new Error('You are not authorized');
    err.status = 403;
    return next(err);
  } else {
    next();
  }
};

// Verify Mentor Middleware
exports.verifyMentor = function(req, res, next) {
  Student.findById(req.params.studentId)
    .then((student) => {
      if (student != null) {
        StudentBatch.find({ mentee: student._id })
          .then((record) => {
            if (record.length > 0) {
              Mentoring.findById(record[0].batch)
                .then((batch) => {
                  if (batch != null) {
                    if (!batch.mentor.equals(req.user._id)) {
                      const err = new Error("You are not authorized to change this");
                      err.status = 403;
                      return next(err);
                    } else {
                      next();
                    }
                  } else {
                    const err = new Error('Mentor does not exist');
                    err.status = 403;
                    return next(err);
                  }
                });
            } else {
              const err = new Error('No Mentor Record for this Student');
              err.status = 403;
              return next(err);
            }
          });
      } else {
        const err = new Error('Student does not exist');
        err.status = 403;
        return next(err);
      }
    }).catch((err) => {
      next(err);
    });
};
