const express = require('express');
const Student = require('../models/student');
const Result=require('../models/result')
const cors = require('./cors');
const authenticate = require('../authenticate');
const passport = require('passport');
const course=require('./uploadCourseCertificate')
const internship=require('./uploadInterships')
const router = express.Router();
router.use('/courses',course)
router.use('/internships',internship)
var path=require('path')


var options1 = {
  root: path.join("./public/internshipsCertificate"),
  
};
var options2 = {
  //root1: path.join("./public/internshipsCertificate"),
  root: path.join("./public/CourseCertificate")
};
router.route('/profile')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.corsWithOptions, authenticate.verifyStudent, (req, res) => {
    Student.findById(req.user._id)
    .then((student)=>{
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(student);
    },(err)=>next(err))
    .catch((err)=>{
      next(err);
    })
  
  });
  router.route('/:studentId')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.corsWithOptions, authenticate.verifyTeacher, (req, res) => {
    Student.findById(req.params.studentId)
    .then((student)=>{
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(student);
    },(err)=>next(err))
    .catch((err)=>{
      next(err);
    })
  
  })
  .put(cors.corsWithOptions, authenticate.verifyTeacher,authenticate.verifyMentor, (req, res) => {
    Student.findByIdAndUpdate(req.params.studentId,{
      $set:req.body
    })
    .then((student)=>{
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(student);
    },(err)=>next(err))
    .catch((err)=>{
      next(err);
    })
  
  });

  router.route("/:studentId/results")
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.corsWithOptions, authenticate.verifyTeacher, async (req, res, next) => {
      try {
          const result = await Result.findOne({ enroll: req.params.studentId}).populate('subjects.course');
          if (!result) {
              const err = new Error(`Result ${req.params.resultId} not found`);
              err.status = 404;
              return next(err);
          }
          res.status(200).json(result);
      } catch (err) {
          next(err);
      }
  });

  router.route("/:studentId/result/:resultId")
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.corsWithOptions, authenticate.verifyTeacher, async (req, res, next) => {
      try {
          const result = await Result.findOne({ enroll: req.params.studentId,_id:req.params.resultId}).populate('subjects.course');
          if (!result) {
              const err = new Error(`Result ${req.params.resultId} not found`);
              err.status = 404;
              return next(err);
          }
          res.status(200).json(result);
      } catch (err) {
          next(err);
      }
  });
   

  router.route("/:studentId/result/:resultId/subjects")
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyTeacher, async (req, res, next) => {
    try {
        const result = await Result.findOne({ enroll: req.params.studentId, _id: req.params.resultId }).populate('subjects.course');
        if (!result) {
            const err = new Error(`Result ${req.params.resultId} not found`);
            err.status = 404;
            return next(err);
        }
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
})


router.route("/:studentId/result/:resultId/subjects/:subjectId")
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyTeacher,  (req, res, next) => {
    Result.find({enroll: req.params.studentId, _id: req.params.resultId})
    .populate('subjects.course')
    .then((result) => {
        if(result.length > 0) {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(result[0].subjects.id(req.params.subjectId));
        }
        else {
            var err =  new Error("No result exist with this Result Id");
            err.statusCode = 403;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => {
        next(err);
    })
})
router.route('/:studentId/internships/:internshipId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyTeacher,  (req, res, next) => {
    Student.findById(req.params.studentId)
   
    .then((student) => {

      if(student!==null){
        var record=student.internships.id(req.params.internshipId)
        if(record!==null){
          var filename =record.certificate
          res.sendFile(filename,  options1,  (err) => {
            if(err){
                next(err);
            }
            else {
                console.log("Sent:", options1.root , "\\" , filename);
            }
        })
        }
        else {
          var err = new Error("No Internship Record");
          err.statusCode = 403;
          return next(err);
      }
      }else {
        var err = new Error("No student Exist");
        err.statusCode = 403;
        return next(err);
    }
       
    }, (err) => next(err))
    .catch((err) => {
        next(err);
    })
});
router.route('/:studentId/onlinecourses/:coursesId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyTeacher,  (req, res, next) => {
    Student.findById(req.params.studentId)
   
    .then((student) => {

      if(student!==null){
        var record=student.onlineCourses.id(req.params.coursesId)
        if(record!==null){
          var filename =record.certificate;
          res.sendFile(filename,  options2,  (err) => {
            if(err){
                next(err);
            }
            else {
                console.log("Sent:", options2.root , "\\" , filename);
            }
        })
        }
        else {
          var err = new Error("No Internship Record");
          err.statusCode = 403;
          return next(err);
      }
      }else {
        var err = new Error("No student Exist");
        err.statusCode = 403;
        return next(err);
    }
       
    }, (err) => next(err))
    .catch((err) => {
        next(err);
    })
})
router.route('/:studentId/absence')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyTeacher ,authenticate.verifyMentor, (req, res, next) => {
    Student.findById(req.params.studentId)
    .then((student) => {
        if(student != null){
          student.majorAbsence.push(req.body)
          student.save()
          .then((student) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(student);
          }, (err) => next(err))
        }
    })
});
router.route('/:studentId/absence/:absenceId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.delete(cors.corsWithOptions, authenticate.verifyTeacher ,authenticate.verifyMentor, (req, res, next) => {
    Student.findById(req.params.studentId)
    .then((student) => {
        if(student != null){
          student.majorAbsence.id(req.params.absenceId).remove()
          student.save()
          .then((student) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(student);
          }, (err) => next(err))
        }
    })
});

router.route('/:studentId/activity')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyTeacher ,authenticate.verifyMentor, (req, res, next) => {
    Student.findById(req.params.studentId)
    .then((student) => {
        if(student != null){
          student.disciplinary.push(req.body)
          student.save()
          .then((student) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(student);
          }, (err) => next(err))
        }
    })
});

router.route('/:studentId/activity/:activityId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.delete(cors.corsWithOptions, authenticate.verifyTeacher ,authenticate.verifyMentor, (req, res, next) => {
    Student.findById(req.params.studentId)
    .then((student) => {
        if(student != null){
          student.disciplinary.id(req.params.activityId).remove()
          student.save()
          .then((student) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(student);
          }, (err) => next(err))
        }
    })
});

router.route('/signup')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .post(cors.corsWithOptions, (req, res, next) => {
    console.log(req.body)
    const newStudent = new Student({
      username: req.body.username,
      name: req.body.name,
      degree: req.body.degree, // Corrected to use req.body.degree
      branch: req.body.branch,
      admissionDate: req.body.admissionDate,
      email: req.body.email,
     // emial:req.body.email,
      phoneNumber: req.body.phoneNumber,
    });

    Student.register(newStudent, req.body.password, (err, student) => {
      if (err) {
        console.log(err);
        res.statusCode = 500;
        res.setHeader('Content-type', 'application/json');
        res.json({ err });
        
      } else {
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-type', 'application/json');
          res.json({ success: true, status: 'Student Registered Successfully' });
        });
      }
    });
  });


  

router.route('/login')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .post(cors.corsWithOptions, passport.authenticate('studentLocal'), (req, res) => {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-type', 'application/json');
    res.json({ success: true, token: token, status: 'Student Login Successfully' });
  });

module.exports = router;
