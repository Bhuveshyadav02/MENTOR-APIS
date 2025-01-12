const mongoose=require('mongoose')


const studentBatchSchema=new mongoose.Schema({
    batch:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Mentoring',
    },
    mentee:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Student',
        unique:true
    }
})

module.exports=mongoose.model('studentBatch',studentBatchSchema)