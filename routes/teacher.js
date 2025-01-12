var express=require('express')
const Teacher=require('../models/teacher')
const cors=require('./cors')
const authenticate=require('../authenticate')
const passport=require('passport')
const router=express.Router()


router.route("/profile")
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.corsWithOptions,authenticate.verifyTeacher,async(req,res)=>{
    Teacher.findById(req.user._id)
    .then((teacher)=>{
        res.statusCode=200;
        res.setHeader('Content-type','application/json')
        res.json(teacher)
    })
})
/*      router.route("/profile")
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.corsWithOptions,authenticate.verifyTeacher,(req,res,next)=>{
})    */

    router.route("/")
    .options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
    .get(cors.corsWithOptions,authenticate.verifyTeacher,(req,res,next)=>{
    Teacher.find({})
    .then((teachers)=>{
        res.statusCode=200
        res.setHeader('Content-type','application/json')
        res.json(teachers)

    })
})

router.route("/signup")
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.post(cors.corsWithOptions,(req,res,next)=>{
          console.log(req.body)
    newTeacher=new Teacher({
        username:req.body.username,
        name:req.body.name,
        joiningDate:new Date(),
        email:req.body.email
        });
        Teacher.register(newTeacher,req.body.password,(err,teacher)=>{
            if(err){
                res.statusCode=500;
                res.setHeader('Content-type','application/json')
                res.json({err})
                
            }
            else{
                console.log(teacher)
                res.statusCode=200;
                res.setHeader('Content-type','application/json')
                res.json({success:true,status:'Teacher Register Successfully'})
                
            }
        })
        


}) 


router.route("/signup/admin")
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.post(cors.corsWithOptions,authenticate.verifyTeacher,authenticate.verifyAdmin,(req,res,next)=>{

    newTeacher=new Teacher({
        username:req.body.username,
        name:req.body.name,
        joiningDate:req.body.joiningDate,
        email:req.body.email,
        isAdmin:true
        });
        Teacher.register(newTeacher,req.body.password,(err,teacher)=>{
            if(err){
                res.statusCode=500;
                res.setHeader('Content-type','application/json')
                res.json({err})
                
            }
            else{
                console.log(teacher)
                res.statusCode=200;
                res.setHeader('Content-type','application/json')
                res.json({success:true,status:'Teacher Register Successfully'})
                
            }
        })
        


}) 


router.route("/login")
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.post(cors.corsWithOptions,passport.authenticate('teacherLocal'),(req,res)=>{
    console.log(req)
var token=authenticate.getToken({_id:req.user._id})
res.statusCode=200;
res.setHeader('Content-type','application/json')
res.json({success:true,token:token,status:'Teacher Login Successfully'})
})
module.exports=router