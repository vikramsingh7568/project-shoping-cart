const express = require('express')
const mongoose = require('mongoose')
const route = require('./route/route')
const app = express()


app.use(express.json())

mongoose.connect('mongodb+srv://Shreyad:ULCn2m1OMNHF7ME0@cluster0.ufn2trt.mongodb.net/project-5',
{useNewUrlParser: true})

.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )


app.use('/', route)


app.listen(process.env.PORT || 3000,function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
