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

// Handler Functions


// show result of search in the search page
const handleSearch = (req, res) => {
  let anime = req.query.anime;
  getAnimeData(anime).then((data) => {
    res.render('searches/show', { anime: data });
  });
};

// handle the details for anime

const handleDetails = (req, res) => {
  let anime = req.query.anime;
  getAnimeTrailer(anime).then((data) => {
    res.render('searches/detail', { anime: data });
  });
};

function handelHomePage(req, res) {
    try {
//         getTopShowData(req, res);
        getTopAnimes(res)
        getNewsData(req, res);
    } catch (error) {
        res.status(500).send('Sorry, an error happened in Home Page' + error);
    }
}


///////////////
//Routes///////
///////////////
/////Home Page//////
app.get('/', handelHomePage);
app.get('/search', handleSearch);
app.get('/search/details', handleDetails);
app.get('*', handel404);


///////////////////////////
// Functions//////////////
/////////////////////////

function handel404(req, res) {
    res.status(404).send("The page that you are trying to access doesn't exist");
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


// functions
// get anime data that the user search for
const getAnimeData = (anime) => {
  const query = { q: anime };
  const url = 'https://api.jikan.moe/v3/search/anime';
  return superagent
    .get(url)
    .query(query)
    .then((data) => {
      return data.body.results.map((element) => new Anime(element));
    })
    .catch((error) => {
      console.log('Error in getting data from Jikan API: ', error);
    });
};
// get top rated anime
const getTopAnimes = (res) => {
  const url = 'https://api.jikan.moe/v3/top/anime/1';
  superagent.get(url).then((data) => {
    let animeArr = data.body.top.map((element) => new Anime(element));
    res.render('index', { anime: animeArr });
  });
};
  
// functions
// get Anime trailer for youtube
const getAnimeTrailer = (anime) => {
  const url = 'https://youtube.googleapis.com/youtube/v3/search';
  const query = {
    part: 'snippet',
    q: `${anime} trailer`,
    key: process.env.YOUTUBE_KEY,
  };
  return superagent
    .get(url)
    .query(query)
    .then((data) => {
      return data.body.items[0].id.videoId;
    })
    .catch((error) => {
      console.log('error from getting data from youtube API', error);
    });
};
  
// Constructors
function News(author,title,url,urlToImage,content){
    this.author=author;
    this.title=title;
    this.url=url;
    this.urlToImage=urlToImage;
    this.content=content
}
// anime consturctor
function Anime(anime) {
  this.title = anime.title;
  this.img_url = anime.image_url;
  this.type = anime.type;
  this.score = anime.score;
  this.start_date = anime.start_date;
  this.end_date = anime.end_date;
  this.rated = anime.rated;
}
// Listeners 
app.listen(PORT, () => {
    console.log('the app is listening to port ' + PORT);
});

