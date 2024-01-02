require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const bodyParser = require('body-parser');
const dns = require('dns');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

//Mongoose schema and model
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
})

const UrlModel = mongoose.model("Url", urlSchema);

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.post('/api/shorturl', async (req, res) => {
    try{
      const url = req.body.url;
      const { host } = new URL(url);
  dns.lookup(host, async (err) => {
    if(err) {
      res.json({error: 'Invalid URL'})
    }else{  
    
  const urlCode = await UrlModel.countDocuments({});
  //new object to mongoDb
  let urlObject = {
    original_url: url,
    short_url: urlCode
  };
  const instance = new UrlModel(urlObject);
  await instance.save();
  
  //console.log(urlCode);
  res.json({
    //"success": "post request processed",
    "original_url": url,
    "short_url": urlCode
    });
      }
      });
}     catch(error){
      console.error("Error", error);
      res.status(500).json({error: "Internal server       error"});
    }
});

app.get('/api/shorturl/:short_url', async (req, res) => {
  const short_url = req.params.short_url;
  const url = await UrlModel.findOne({short_url})
  res.redirect(url.original_url);
  
})



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
