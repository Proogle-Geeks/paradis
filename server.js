'use strict';


const express = require('express');
const cors = require('cors');
const ejs = require('ejs');




require('dotenv').config();
const app = express();
app.use(cors());
app.use('/public', express.static('./public'));


// const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const PORT = process.env.PORT;



app.set('view engine', 'ejs');
app.get('/',renderHome);
app.get('/sign-in',renderSignIn);
app.get('/contact-us',renderContactUs);
app.get('/about-us',renderAboutUs);


function renderHome(req,res) {
  res.render('index');
}

function renderSignIn(req,res) {
  res.render('sign-in');
}

function renderContactUs(req,res){
  res.render('contact-us');
}

function renderAboutUs(req,res){
  res.render('about-us')
}




app.listen(PORT, () => {
    console.log('the app is listening to port ' + PORT);
});

