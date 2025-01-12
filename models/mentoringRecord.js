const mongoose=require('mongoose')
const { type } = require('os')

const meetingSchema=new mongoose.Schema({
    attendence:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        required:true,
    },
    advice:{
        type:String,
        required:true
    }
})
const mentoringSchema = new mongoose.Schema({
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    from: {
        type: Date,
        required: true
    },
    To: {
        type: Date
    },
    branch: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    meetings: [meetingSchema]
});

module.exports=mongoose.model("Mentoring",mentoringSchema)