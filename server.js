'use strict';

// importing
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const override = require('method-override');

// installing - configration
const app = express();

require('dotenv').config();
app.use(override('_method'));

const client = new pg.Client(process.env.DATABASE_URL);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log('The app is listening on port: ', PORT);
});
