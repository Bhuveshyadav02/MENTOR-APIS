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
const dir = 'public/internshipsCertificate';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}
var options = {
    root: path.join("./public/internshipsCertificate")
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
                    res.json(student.internships);
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
                    if (!student.internships) {
                        student.internships = [];
                    }
                    const internship = {
                        companyName: req.body.companyName,
                        from: req.body.from,
                        to: req.body.to,
                        domain: req.body.domain,
                        certificate: req.file.filename
                    };
                    student.internships.push(internship);
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
    router.route('/:internshipId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyStudent, (req, res, next) => {
   Student.findById(req.user._id)
   .then((student)=>{
            if(student!=null){
                var record=student.internships.id(req.params.internshipId)
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
        if (student != null) {
            const record = student.internships.id(req.params.internshipId);
            if (record != null) {
                const filePath = path.resolve('./public/internshipsCertificate/' + record.certificate);
                student.internships.pull(req.params.internshipId);
                student.save()
                .then((student) => {
                    fs.unlink(filePath, function (err) {
                        if (err) {
                            return next(err);
                        }
                        res.send({
                            status: "200",
                            responseType: "string",
                            response: "success"
                        });
                    });
                })
                .catch((err) => next(err));
            } else {
                const err = new Error('Internship record not found');
                err.status = 404;
                return next(err);
            }
        } else {
            const err = new Error('Student does not exist');
            err.status = 403;
            return next(err);
        }
    })
    .catch((err) => {
        console.log(err);
        next(err);
    });
})

.put(cors.corsWithOptions, authenticate.verifyStudent, (req, res, next) => {
    Student.findById(req.user._id)
    .then((student) => {
        if(student != null) {
            Object.assign(student.internships.id(req.params.intershipId),req.body)
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
