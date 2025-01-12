const express = require('express');
const router = express.Router();
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Student = require('../models/student');
const fs = require('fs');

// Ensure the directory exists
const dir = 'public/CourseCertificate';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}
var options = {
    root: path.join("./public/CourseCertificate")
};
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, req.user.username + "Course" + Date.now() + ".pdf");
    }
});

const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(pdf)$/)) {
        return cb(new Error('You can upload only PDFs!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.use(bodyParser.json());

router.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyStudent, (req, res, next) => {
        Student.findById(req.user._id)
            .then((student) => {
                if (student != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(student.onlineCourses);
                } else {
                    const err = new Error('Student does not exist');
                    err.statusCode = 403;
                    next(err);
                }
            })
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyStudent, upload.single('certificate'), (req, res, next) => {
        console.log(req.file);
        console.log(req.body);
        if (!req.file) {
            const err = new Error('No file uploaded');
            err.status = 400;
            return next(err);
        }

        // Ensure the request body is properly parsed
        req.body = JSON.parse(JSON.stringify(req.body));

        Student.findById(req.user._id)
            .then((student) => {
                if (student != null) {
                    if (!student.Courses) {
                        student.Courses = [];
                    }
                    const course = {
                        platform: req.body.platform,
                        from: req.body.from,
                        to: req.body.to,
                        domain: req.body.domain,
                        certificate: req.file.filename
                    };
                    student.onlineCourses.push(course);
                    student.save()
                        .then((student) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json({ success: true, status: 'Certificate uploaded successfully', student });
                        })
                        .catch((err) => next(err));
                } else {
                    const err = new Error('Student does not exist');
                    err.statusCode = 403;
                    next(err);
                }
            })
            .catch((err) => next(err));
    });
    router.route('/:courseId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyStudent, (req, res, next) => {
   Student.findById(req.user._id)
   .then((student)=>{
            if(student!=null){
                var record=student.onlineCourses.id(req.params.courseId)
                if(record!=null){
                    var filename=record.certificate
                    res.sendFile(filename,options,(err)=>{
                        if(err){
                            next(err)
                        }
                        else{
                            console.log("Sent:", options.root , "\\" , filename);
                        }
                    })
                }
            }
   },(err) => next(err))
   .catch((err) => {
       console.log(err);
       next(err)
    })
})
.delete(cors.corsWithOptions, authenticate.verifyStudent, (req, res, next) => {
    Student.findById(req.user._id)
    .then((student) => {
        if(student != null){
            console.log(req.params)
            console.log(student.onlineCourses)
            var record = student.onlineCourses.id(req.params.courseId);
            console.log(record)
            console.log("Deleted: ", path.resolve('./public/CourseCertificate' + record.certificate));    
            student.onlineCourses.id(req.params.courseId).remove()
            student.save()
            .then((student) => {
                fs.unlink(path.resolve('./public/CourseCertificate/' + record.certificate), function() {
                    res.send ({
                        status: "200",
                        responseType: "string",
                        response: "success"
                    });     
                });
            })
        }
        else {

        }
    }, (err) => next(err))
    .catch((err) => {
        console.log(err);
        next(err);
    })
})
.put(cors.corsWithOptions, authenticate.verifyStudent, (req, res, next) => {
    Student.findById(req.user._id)
    .then((student) => {
        if(student != null) {
            Object.assign(student.onlineCourses.id(req.params.courseId),req.body)
            student.save()
            .then((student) => {
                Student.findById(req.user._id)
                .then((student) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(student);
                })
            }, (err) => next(err))
        }
        else {
            var err =  new Error("No Student exist with this Student Id");
            err.statusCode = 403;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => {
        next(err);
    })
})
module.exports = router;
