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

// render index.ejs in the home page
const renderHome = (req, res) => {
  getTopAnimes().then((data) => {
    res.render('index', { anime: data });
  });
};

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

// paths-routs
app.get('/', renderHome);
app.get('/search', handleSearch);
app.get('/search/details', handleDetails);

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
const getTopAnimes = () => {
  const url = 'https://api.jikan.moe/v3/top/anime/1';
  return superagent.get(url).then((data) => {
    return data.body.top.map((element) => new Anime(element));
  });
};

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

function Anime(anime) {
  this.title = anime.title;
  this.img_url = anime.image_url;
  this.type = anime.type;
  this.score = anime.score;
  this.start_date = anime.start_date;
  this.end_date = anime.end_date;
  this.rated = anime.rated;
}

app.listen(PORT, () => {
  console.log('The app is listening on port: ', PORT);
});
