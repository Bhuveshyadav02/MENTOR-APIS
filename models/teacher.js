const { kStringMaxLength } = require('buffer')
const mongoose=require('mongoose')
const { type } = require('os')
var passportlocalmoongse=require('passport-local-mongoose')

const TeacherSchema=new mongoose.Schema({
    name:{
        type:String,
        require :true,
    },
    email:{
        type:String,
        require:true,
        unique:true,
    },
    joiningDate:{
        type:Date,
        require:true
    },
    isTeacher:{
        type:Boolean,
        require:true
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    isActive:{
        type:Boolean,
        default:true,
    }




},{
    timestamps:{
        require:true
    }
})

TeacherSchema.plugin(passportlocalmoongse)

module.exports=mongoose.model('Teacher',TeacherSchema)