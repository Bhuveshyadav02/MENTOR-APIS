const express=require('express')
const Courses =require('../models/course')
//const { authenticate } = require('passport')
const router=express.Router()
const authenticate =require('../authenticate')
const cors =require('./cors')

router.route("/")
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.corsWithOptions,authenticate.verifyTeacher,(req,res,next)=>{
    Courses.findOne({})
     .then((courses)=>{
        res.statusCode=200
        res.setHeader('Content-type','application/json')
        res.json(courses)

    })


})
.post(cors.corsWithOptions,authenticate.verifyTeacher,authenticate.verifyAdmin,(req,res,next)=>{
          console.log(req.body)
          Courses.create(req.body)
          .then((course)=>{
            console.log("Course Created"+course)
            res.statusCode=200
            res.setHeader('Content-type','application/json')
            res.json(course)
    
        }, (err) => next(err))
        .catch((err) => {
            next(err);
        })

})
router.route("/:courseId")
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.corsWithOptions,authenticate.verifyTeacher,authenticate.verifyAdmin,(req,res,next)=>{
    console.log(req.params)
    Courses.findById(req.params.courseId)
     .then((courses)=>{
        res.statusCode=200
        res.setHeader('Content-type','application/json')
        res.json(courses)

    },(err) => next(err))
    .catch((err) => {
        next(err);
    })






})
.put(cors.corsWithOptions,authenticate.verifyTeacher,authenticate.verifyAdmin,(req,res,next)=>{
    Courses.findByIdAndUpdate(req.params.courseId,{
        $set:req.body
    },{
        new:true
    })
     .then((course)=>{
        res.statusCode=200
        res.setHeader('Content-type','application/json')
        res.json(course)

    },(err) => next(err))
    .catch((err) => {
        next(err);
    })

})

.delete(cors.corsWithOptions,authenticate.verifyTeacher,authenticate.verifyAdmin,(req,res,next)=>{
    Courses.findByIdAndDelete(req.params.courseId)
     .then(()=>{
        res.statusCode=200
        res.setHeader('Content-type','application/json')
        res.json({Status:"Deleted Successfully"})

    },(err) => next(err))
    .catch((err) => {
        next(err);
    })

})
module.exports=router
