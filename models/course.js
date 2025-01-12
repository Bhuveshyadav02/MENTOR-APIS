const moongoose=require('mongoose')
const { type } = require('os')


const courseSchema= new moongoose.Schema({
    name:{
        type:String,
        require:true,

    },
    courseCode:{
        type:String,
        require:true,
        unique:true
    }
})
module.exports=moongoose.model("Courses",courseSchema)