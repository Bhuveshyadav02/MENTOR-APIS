const express = require('express');
const Student = require('../models/student');
const Result=require('../models/result')
const cors = require('./cors');
const authenticate = require('../authenticate');
const passport = require('passport');
const Mentoring=require('../models/mentoringRecord')
const StudentBatch=require('../models/studentBatch')

const router=express.Router()
router.route('/')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.corsWithOptions, authenticate.verifyTeacher, (req, res,next) => {
    Mentoring.find({mentor:req.user._id})
    .then((batches)=>{
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(batches);
    },(err)=>next(err))
    .catch((err)=>{
      next(err);
    })
  
  })
  .post(cors.corsWithOptions, authenticate.verifyTeacher, (req, res,next) => {
    req.body.mentor=req.user._id;
    Mentoring.create(req.body)
 
    .then((batch)=>{
        console.log("Batch",batch);
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(batch);
    },(err)=>next(err))
    .catch((err)=>{
      next(err);
    })
  
  });

  router.route('/:batchId')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.corsWithOptions, authenticate.verifyTeacher, (req, res) => {
    Mentoring.findById(req.params.batchId)
    .then((batch)=>{
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(batch);
    },(err)=>next(err))
    .catch((err)=>{
      next(err);
    })
})

.put(cors.corsWithOptions, authenticate.verifyTeacher, (req, res,next) => {
    Mentoring.findById(req.params.batchId)
    .then((batch)=>{
        if(batch!=null){

            if(!batch.mentor.equals(req.user._id)){
                var err=new Error("You are authorised to change this")
                err.status=422;
                next(err)
            }
            else{
                Mentoring.findByIdAndUpdate(req.params.batchId,{
                    $set:req.body
                },{
                  new:true
                })
                .then((batch)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-type', 'application/json');
                    res.json(batch);
                },(err)=>next(err))
                .catch((err)=>{
                    next(err);
                })
            }
            }
            else{
              var err=new Error("Batch does not exist")
              err.status=422;
              next(err)
        }
      
      
      
           
    },(err)=>next(err))
    .catch((err)=>{
      next(err);
    })
})
.delete(cors.corsWithOptions, authenticate.verifyTeacher, (req, res,next) => {
  Mentoring.findById(req.params.batchId)
  .then((batch)=>{
      if(batch!=null){
           
          if(!batch.mentor.equals(req.user._id)){
              var err=new Error("You are authorised to change this")
              err.status=422;
              next(err)
          }
          else{
            StudentBatch.deleteMany({batch:req.params.batchId})
            .then(()=>{
              Mentoring.findByIdAndDelete(req.params.batchId)
              .then((response)=>{
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(response);
              },(err)=>next(err))
            }).catch((err)=>{
              console.log(err)
              next(err)
            })
          }
          }
          else{
            var err=new Error("Batch does not exist")
            err.status=422;
            next(err)
      }
    
    
    
         
  },(err)=>next(err))
  .catch((err)=>{
    next(err);
  })
});
router.route('/:batchId/meetings')
.get(cors.corsWithOptions, authenticate.verifyTeacher, (req, res,next) => {
  Mentoring.findById(req.params.batchId)
  .then((batch)=>{
      if(batch!=null){
           
          if(!batch.mentor.equals(req.user._id)){
              var err=new Error("You are authorised to change this")
              err.status=422;
              next(err)
          }
          else{
          
            
              Mentoring.findById(req.params.batchId)
              .then((batch)=>{
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(batch.meetings);
              },(err)=>next(err))
            
          }
          }
          else{
            var err=new Error("Batch does not exist")
            err.status=422;
            next(err)
      }
    
    
    
         
  },(err)=>next(err))
  .catch((err)=>{
    next(err);
  })
})
.post(cors.corsWithOptions, authenticate.verifyTeacher, (req, res,next) => {
  Mentoring.findById(req.params.batchId)
  .then((batch)=>{
      if(batch!=null){
           
          if(!batch.mentor.equals(req.user._id)){
              var err=new Error("You are authorised to change this")
              err.status=422;
              next(err)
          }
          else{
          
            
              Mentoring.findById(req.params.batchId)
              .then((batch)=>{
                batch.meetings.push(req.body)
                batch.save()
                .then((batch)=>{
                  Mentoring.findById(req.params.batchId)
                  .then((batch)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-type', 'application/json');
                    res.json(batch.meetings);
                  })
               
                })
               
              },(err)=>next(err))
            
          }
          }
          else{
            var err=new Error("Batch does not exist")
            err.status=422;
            next(err)
      }
    
    
    
         
  },(err)=>next(err))
  .catch((err)=>{
    next(err);
  })
});
router.route('/:batchId/meetings/:meetingId')
.delete(cors.corsWithOptions, authenticate.verifyTeacher, (req, res,next) => {
  Mentoring.findById(req.params.batchId)
  .then((batch)=>{
      if(batch!=null){
           
          if(!batch.mentor.equals(req.user._id)){
              var err=new Error("You are authorised to change this")
              err.status=422;
              next(err)
          }
          else{
            batch.meetings.id(req.params.meetingId).deleteOne();
            batch.save()
            .then((batch)=>{
              res.statusCode = 200;
              res.setHeader('Content-type', 'application/json');
              res.json(batch.meetings);
            },(err)=>next(err))
             
            
          }
          }
          else{
            var err=new Error("Batch does not exist")
            err.status=422;
            next(err)
      }
    
    
    
         
  },(err)=>next(err))
  .catch((err)=>{
    next(err);
  })
})
//stundents in meetings
router.route('/:batchId/students')
.get(cors.corsWithOptions, authenticate.verifyTeacher, (req, res,next) => {
  StudentBatch.find({batch:req.params.batchId})
  .populate('mentee')
  .then((students)=>{
    res.statusCode = 200;
    res.setHeader('Content-type', 'application/json');
    console.log(students)
    res.json(students);
  },(err)=>{next(err)})

})
.post(cors.corsWithOptions, authenticate.verifyTeacher, (req, res, next) => {
  req.body.batch = req.params.batchId;
  Mentoring.findById(req.params.batchId)
  .then((batch) => {
      if(batch != null) {
          if(!batch.mentor.equals(req.user._id)) {
              var err = new Error('You are not authorised to update this batch');
              err.status= 403;
              return next(err);
          }
          else if(req.body.mentee != null) {
              Student.find({username: req.body.mentee})
              .then((students) => {
                  if(students.length > 0){
                      console.log(students);
                      console.log(students[0]);
                      req.body.mentee = students[0]._id;
                      StudentBatch.create(req.body)
                      .then((record) => {  
                              res.statusCode = 200;
                              res.setHeader('Content-Type', 'application/json');
                              res.json(record);
                      },(err) => next(err)); 
                  }
                  else {
                      var err = new Error('Student Not Exist');
                      err.status= 403;
                      return next(err);
                  }
              }, (err) => next(err))
              .catch((err) => next(err));        
          }
          else{
              var err = new Error('Parameters Missing');
              err.status= 403;
              return next(err);
          }
      }
      else {
          var err = new Error('Batch does not exist');
          err.status= 403;
          return next(err);
      }
  }, (err) => next(err))
  .catch((err) => next(err));
})


router.route('/:batchId/students/:batchId')
.delete(cors.corsWithOptions, authenticate.verifyTeacher, (req, res, next) => {
  StudentBatch.findOneAndDelete({mentee: req.params.studentId})
  .then((response) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json')
      res.json(response)
  }, (err) => next(err))
});









module.exports=router