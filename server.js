'use strict';

// importing
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
// const pg = require('pg');
const override = require('method-override');
const { render } = require('ejs');

// installing - configration
const app = express();
app.use(cors());
require('dotenv').config();
app.use(override('_method'));

// const client = new pg.Client(process.env.DATABASE_URL);

const PORT = process.env.PORT;

// view-static
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

// handler funcitons

// render index.ejs in the home page
const renderHome = (req, res) => {
  getTopAnimes().then((data) => {
    getNewsData().then((animeNews) => {
      // console.log(data);
      res.render('index', { anime: data, news: animeNews });
    });
  });
};

// show result of search in the search page
const handleSearch = (req, res) => {
  let anime = req.query.anime;
  getAnimeData(anime).then((data) => {
    // console.log(data);
    res.render('searches/show', { anime: data });
  });
};

// handle the details for anime

const handleDetails = (req, res) => {
  let query = req.query;
  let animeData = {};
  for (const [key, value] of Object.entries(query)) {
    animeData[key] = value;
  }
  // console.log(animeData);
  getAnimeTrailer(animeData['anime']).then((data) => {
    res.render('searches/detail', { videoId: data, animeObject: animeData });
  });
};

// paths-routs
app.get('/', renderHome);
app.get('/search', handleSearch);
app.get('/search/details', handleDetails);
app.get('/search/list', handleList);

function handleList(req,res) {
  res.render('searches/list')
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
function getNewsData() {
  let newsQuery = {
    apiKey: process.env.apiKey,
    q: 'anime',
    qInTitle: 'anime',
    language: 'en',
    sortBy: 'popularity',
    pageSize: 3,
  };
  let newsUrl = 'https://newsapi.org/v2/everything';
  return superagent
    .get(newsUrl)
    .query(newsQuery)
    .then((data) => {
      let articles = data.body.articles;
      return articles.map(
        (article) =>
          new News(
            article.author,
            article.title,
            article.url,
            article.urlToImage,
            article.content,
            article.publishedAt
          )
      );
    })
    .catch((error) =>
      console.log('error in getting news from News API: ', error)
    );
}
// get only the date from string
function dateFormat(date) {
  return date ? date.split('T')[0] : date;
}

// Constructors

function Anime(anime) {
  this.title = anime.title;
  this.img_url = anime.image_url;
  this.type = anime.type;
  this.score = anime.score;
  this.description = anime.synopsis;
  this.start_date = dateFormat(anime.start_date);
  this.end_date = dateFormat(anime.end_date) || 'Until Now';
  this.rank = anime.rank;
}

function News(author, title, url, urlToImage, content, publishedAt) {
  this.author = author || 'Author Unknown';
  this.title = title || 'No title available';
  this.url = url || 'Not available';
  this.urlToImage = urlToImage || 'No image available';
  this.content = content || 'No content available';
  this.publishedAt = dateFormat(publishedAt) || 'Publish Date unknown';
}
app.listen(PORT, () => {
  console.log('The app is listening on port: ', PORT);
});
