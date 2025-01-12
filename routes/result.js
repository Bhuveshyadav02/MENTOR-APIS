const express = require('express');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Result = require('../models/result');
const Course = require('../models/course');
const router = express.Router();

// Express Router
router.route("/")
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyStudent, async (req, res, next) => {
    try {
        const result = await Result.find({ enroll: req.user._id }).populate('subjects.course');
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
})
.post(cors.corsWithOptions, authenticate.verifyStudent, async (req, res, next) => {
    try {
        req.body.enroll = req.user._id;
        const result = await Result.create(req.body);
        console.log("Result Created", result);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

router.route("/:resultId")
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyStudent, async (req, res, next) => {
    try {
        const result = await Result.findOne({ enroll: req.user._id, _id: req.params.resultId }).populate('subjects.course');
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
.put(cors.corsWithOptions, authenticate.verifyStudent, async (req, res, next) => {
    try {
        const result = await Result.findOneAndUpdate({ enroll: req.user._id, _id: req.params.resultId }, { $set: req.body }, { new: true });
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
.delete(cors.corsWithOptions, authenticate.verifyStudent, async (req, res, next) => {
    try {
        const response = await Result.findOneAndDelete({ enroll: req.user._id, _id: req.params.resultId });
        if (!response) {
            const err = new Error(`Result ${req.params.resultId} not found`);
            err.status = 404;
            return next(err);
        }
        res.status(200).json(response);
    } catch (err) {
        next(err);
    }
});

router.route("/:resultId/subjects")
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyStudent, async (req, res, next) => {
    try {
        const result = await Result.findOne({ enroll: req.user._id, _id: req.params.resultId }).populate('subjects.course');
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
.post(cors.corsWithOptions, authenticate.verifyStudent, async (req, res, next) => {
    try {
        const result = await Result.findOne({ enroll: req.user._id, _id: req.params.resultId });
        if (!result) {
            const err = new Error(`Result ${req.params.resultId} not found`);
            err.status = 404;
            return next(err);
        }
        const course = await Course.findOne({ courseCode: req.body.course });
        if (!course) {
            const err = new Error(`Course ${req.body.course} not found`);
            err.status = 404;
            return next(err);
        }
        req.body.course = course._id;
        result.subjects.push(req.body);
        await result.save();
        const updatedResult = await Result.findById(req.params.resultId).populate('subjects.course');
        res.status(200).json(updatedResult);
    } catch (err) {
        next(err);
    }
});
router.route('/:resultId/subjects/:subjectId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyStudent,  (req, res, next) => {
    Result.find({enroll: req.user._id, _id: req.params.resultId})
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
.put(cors.corsWithOptions, authenticate.verifyStudent, (req, res, next) => {
  Result.findOne({ enroll: req.user._id, _id: req.params.resultId })
  .then(result => {
      if (!result) {
          const err = new Error("No result exists with this Result Id");
          err.statusCode = 403;
          return next(err);
      }

      const subject = result.subjects.id(req.params.subjectId);
      if (!subject) {
          const err = new Error("Subject not found");
          err.statusCode = 404;
          return next(err);
      }

      Object.assign(subject, req.body);
      return result.save();
  })
  .then(updatedResult => {
      return Result.findById(req.params.resultId).populate('subjects.course');
  })
  .then(updatedResult => {
      res.status(200).json(updatedResult);
  })
  .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyStudent, (req, res, next) => {
    Result.findOne({ enroll: req.user._id, _id: req.params.resultId })
    .then(result => {
        if (!result) {
            const err = new Error("No result exists with this Result Id");
            err.status = 403;
            return next(err);
        }

        const subject = result.subjects.id(req.params.subjectId);
        if (!subject) {
            const err = new Error("Subject not found");
            err.status = 404;
            return next(err);
        }

        // Remove the subject from the subjects array
        result.subjects.id(req.params.subjectId).deleteOne();
        return result.save();
    })
    .then(updatedResult => {
        // Send back the updated result with populated subjects
        return Result.findById(req.params.resultId).populate('subjects.course');
    })
    .then(updatedResult => {
        res.status(200).json(updatedResult);
    })
    .catch(err => next(err));
});

module.exports = router;
