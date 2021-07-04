var express = require('express');
var cors = require('cors');
var fs = require('fs');
require('dotenv').config()

//create express api
var app = express();

//Simple express middleware for uploading files.
const fileUpload = require('express-fileupload');

app.use(cors());
app.use(fileUpload());
app.use('/public', express.static(process.cwd() + '/public'));


//connect DB
const mongoose = require('mongoose');
const { Schema } = mongoose;
const mySecret = process.env['DB_FILE']
mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });
const fileDB = new Schema({
  name: String,
  size: Number, 
  type: String,
  data: Buffer,
   date: Date,
})
let FileDB = mongoose.model('FileDB', fileDB);


app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});


//set up parser for request body and get data from the form 
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/api/fileanalyse', urlencodedParser, function(req, res){
  //console.log('req.body', req.body)
  //console.log('req.files', req.files)
  let {name, size, data} =  req.files.upfile
  FileDB.findOne({ name }, function(err, user) {
    if (err) {
      return res.json({
        error: "No search results"
      });
    }
    if (user) {
      return res.json(
        "The document already exists"
      )
    } else {
      console.log('Added new file to DB')
      res.json(
        {name, type: req.files.upfile.mimetype, size}
      )
      let isFile =  new FileDB({
        name: req.files.upfile.name, 
        size: req.files.upfile.size,
        type: req.files.upfile.mimetype,
        data: req.files.upfile.data,
        date: new Date(),
      })

      isFile.save(function(err, data) {
      if (err) return (err);
      console.log('Added new file:', data)
    });
    }
})
})


const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
//https://attacomsian.com/blog/uploading-files-nodejs-express
//https://grokonez.com/node-js/nodejs-use-mongoose-to-save-files-images-to-mongodb
