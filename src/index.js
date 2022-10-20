const express = require('express')
const app = express()
const multer = require('multer')
const mongoose = require('mongoose')
const route = require('./routes/route')



app.use(express.json())
app.use(multer().any())

mongoose.connect('mongodb+srv://Shreyad:ULCn2m1OMNHF7ME0@cluster0.ufn2trt.mongodb.net/project-5',
{useNewUrlParser: true})

.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )


app.use('/', route)

//===================== It will Handle error When You input Wrong Route =====================//
app.use(function (req, res) {
    var err = new Error("Not Found.")
    err.status = 404
    return res.status(404).send({ status: false, msg: "Path not Found end point is incorrect." })
})

app.listen(process.env.PORT || 3000,function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
