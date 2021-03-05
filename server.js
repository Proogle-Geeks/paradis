'use strict'



const express = require('express');
const cors = require('cors');



const app = express();
require('dotenv').config();
const PORT = process.env.PORT;
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));



app.get('/', (req,res)=>{
    console.log('requsted ...');
    res.render('');
});



app.listen(PORT, () => {
    console.log(`Server is here ...  ${PORT}`);
});


