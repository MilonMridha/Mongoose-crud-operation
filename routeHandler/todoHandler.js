const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const todoSchema = require('../schemas/todoSchema');
const Todo = new mongoose.model('Todo', todoSchema);
const checkLogin = require('../middleware/checkLogin')


// Get todos----->
router.get('/', checkLogin, async(req, res)=>{
    console.log(req.email)
    console.log(req.userId)
 await Todo.find({status: 'active'}).select({
    _id: 0,
    _v: 0,
    date: 0
 }).limit(2).exec((err, data)=>{
    if(err){
        res.status(500).json({
            error: 'There was a server side error'
        });
    } else{
        res.status(200).json({
            result: data,
            "message": 'successful'
        });
    }
 })
});

//Get a todo-------->
router.get('/:id', async(req, res)=>{
 await Todo.find({_id: req.params.id}, (err, data)=>{
    if(err){
        res.status(500).json({
            error: 'There was a server side error'
        });
    } else{
        res.status(200).json({
            result: data,
            "message": 'successful'
        });
    }
 })
});
 
//Post a todo---------->
router.post('/', async(req, res)=>{
    const newTodo = new Todo(req.body);
    await newTodo.save((err)=>{
        if(err){
            res.status(500).json({
                error: 'There was a server side error'
            });
        } else{
            res.status(200).json({
                "message": 'Todo was inserted successful'
            });
        }
    })

});

//Post Multi todos------->
router.post('/all', async(req, res)=>{
 await Todo.insertMany(req.body, (err)=>{
    if(err){
        res.status(500).json({
            error: 'There was a server side error'
        });
    }else{
        res.status(200).json({
            message: 'Todos were inserted successful'
        });
    }
 });
});
// Put a todo
router.put('/:id', async(req, res)=>{
    await Todo.findbyIAndUpdate({_id: req.params.id}, {
        $set: {
            status: 'active'
        }
    },{ new: true, useFindAndModify: false},
     (err)=>{
        if(err){
            res.status(500).json({
                error: 'There was a server side error'
            });
        }else{
            res.status(200).json({
                message: 'Todo was updated successfully'
            });
        }
    })
    


});
//Delete a todo------->
router.delete('/:id', async(req, res)=>{
    await Todo.deleteOne({_id: req.params.id}, (err)=>{
        if(err){
            res.status(500).json({
                error: 'There was a server side error'
            });
        } else{
            res.status(200).json({
                
                message: 'Todo Deleted successfully'
            });
        }
     })

});

module.exports = router;