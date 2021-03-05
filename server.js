'use strict';
////////////////////////
// Importing Packages///
////////////////////////
const express = require('express');
const cors = require('cors');
const ejs = require('ejs');
const pg = require('pg');
const methodOverride = require('method-override')

//////////////////////////////////////////
// initialization and configuration//////
/////////////////////////////////////////
require('dotenv').config();
const app = express();
const superagent = require('superagent');
app.use(cors());
const client = new pg.Client(process.env.DATABASE_URL);
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"))
const PORT = process.env.PORT;

// set the view engine to ejs
app.set('view engine', 'ejs');
///////////////
//Routes///////
///////////////
/////Home Page//////
app.get('/', handelHomePage);
app.get('*', handel404);

///////////////////////////
// Functions//////////////
/////////////////////////

// Handler Functions
function handelHomePage(req, res) {
    try {
        getTopShowData(req, res);
        getNewsData(req, res);
    } catch (error) {
        res.status(500).send('Sorry, an error happened in Home Page' + error);
    }
}

function handel404(req, res) {
    res.status(404).send("The page that you are trying to access doesn't exist");
}

// Getting data from API
function getTopShowData(req, res) {
    console.log("hi");
}
function getNewsData(req, res) {
    // console.log(req);

    let newsQuery = {
        apiKey: process.env.apiKey,
        q: "anime",
        qInTitle: "anime",
        language: "en",
        sortBy: "popularity",
        pageSize: 3,
    }
    let newsUrl = 'https://newsapi.org/v2/everything';
    let newsArr= [];
    return superagent.get(newsUrl).query(newsQuery).then(data => {
        // console.log(data.body.articles);
        data.body.articles.map(element =>{
            newsArr.push(new News(element.author,element.title, element.url,element.urlToImage,element.content))
        })
        console.log(newsArr);
        res.status(200).send(newsArr);
    }).catch(error => {
            res.status(500).send('There was an error getting data from news API ' + error);
        });
}

// Constructors
function News(author,title,url,urlToImage,content){
    this.author=author;
    this.title=title;
    this.url=url;
    this.urlToImage=urlToImage;
    this.content=content
}

// Listeners 
app.listen(PORT, () => {
    console.log('the app is listening to port ' + PORT);
});
