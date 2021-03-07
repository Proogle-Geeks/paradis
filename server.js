'use strict';


const express = require('express');
const cors = require('cors');
const ejs = require('ejs');





require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.static('./public'));


// const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const PORT = process.env.PORT;
app.set('view engine', 'ejs');
app.get('/',renderHome);




function renderHome(req,res) {
  res.render('searches/detail');
}







app.listen(PORT, () => {
    console.log('the app is listening to port ' + PORT);
});

