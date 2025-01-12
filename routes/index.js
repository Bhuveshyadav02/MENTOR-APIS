var express=require('express')
var Router=express.Router()

Router.get('/',function(req,res,next){
    res.render('index',{title:'express'})
})

module.exports=Router
