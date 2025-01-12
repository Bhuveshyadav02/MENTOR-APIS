const mongoose=require('mongoose')


const subjectSchema=mongoose.Schema({
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Courses",
        require:true
    },
    isTheory:{
        type:Boolean,
         default:false,
    },
    isPratical:{
        type:Boolean,
        default:false
    },
    mst1:{
        type:Number,
        default:-1,
    },
    mst2:{
         type:Number,
         default:-1,
    },
    endsSemT:{
        type:String,
        default:-1
    },
    endSemP:{
         type:String,
         default:-1
    },
    credits:{
        type:Number,
        required:true

    },
    attendenceT:{
        type:Number,
        default:-1,
    },
    attendenceP:{
        type:Number,
        default:-1
    },


})
const resultSchema=new mongoose.Schema({
    enroll:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Student',
        required:true
    },
    cgpa:{
        type:Number,
        default:-1,
        //required:true
    },
    sgpa:{
        type:Number,
        default:-1
    },
    sem:{
        type:Number,
        required:true,
        min:1,
        max:3
    },
    year:{
        type:Number,
        required:true,
    },
    creditsEarned:{
        type:Number,
        default:-1,
    },
    subjects:[subjectSchema]
},{
    timestamps:true



})

module.exports=mongoose.model('Result',resultSchema)

