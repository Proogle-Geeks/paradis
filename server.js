'use strict';

// importing
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const override = require('method-override');

// installing - configration
const app = express();
app.use(cors());
require('dotenv').config();
app.use(override('_method'));

const client = new pg.Client(process.env.DATABASE_URL);

const PORT = process.env.PORT;

// view-static
app.set('view engine', 'ejs');
app.use('/public', express.static('./public'));
app.use(express.urlencoded({ extended: true }));

// handler funcitons
const renderHome = (req, res) => {
  res.render('index');
};

// paths-routs
app.get('/', renderHome);

app.listen(PORT, () => {
  console.log('The app is listening on port: ', PORT);
});
