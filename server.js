'use strict';

// importing
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
// const pg = require('pg');
const override = require('method-override');

// installing - configuration
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

// handler functions

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
  checkSearchQuery(anime, res);
  console.log(anime);
};

function checkSearchQuery(searchEntry, res) {
  var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  // I got the regex from stack overflow
  if (regex.test(searchEntry)) {
    console.log('you searched for an image');
    getImageSearchData(searchEntry, res).then((data) => {
      console.log(data);
      res.render('showImage', { anime: data });
    });
  } else {
    console.log('you searched for an name');
    getAnimeData(searchEntry).then((data) => {
      res.render('searches/show', { anime: data });
    });
  }
}
// handle the details for anime

const handleDetails = (req, res) => {
  let query = req.query;
  let animeData = {};
  for (const [key, value] of Object.entries(query)) {
    animeData[key] = value;
  }
  console.log(animeData);
  getAnimeTrailer(animeData['anime']).then((data) => {
    res.render('searches/detail', { videoId: data, animeObject: animeData });
  });
};

// paths-routs
app.get('/', renderHome);
app.get('/search', handleSearch);
app.get('/search/details', handleDetails);
app.get('/about-us', (req, res) => {
  res.render('about-us');
});
app.get('/contact-us', (req, res) => {
  res.render('contact-us');
});
app.get('/sign-in', (req, res) => {
  res.render('sign-in');
});

// functions
// get anime data that the user search for
function getImageSearchData(anime, res) {
  const imageSearchQuery = { url: anime };
  const imageSearchURl = 'https://trace.moe/api/search';
  return superagent
    .get(imageSearchURl)
    .query(imageSearchQuery)
    .then((data) => {
      // console.log(data.body.docs)
      let similarResults = [];
      data.body.docs.map((element) => {
        similarResults.push(new AnimeImageSearch(element));
        console.log(similarResults);
      });
      return similarResults.slice(0, 3);
    })
    .catch((error) => {
      console.log('Error in getting data from trace.moe API: ', error);
    });
}

const getAnimeData = (anime) => {
  // check if search entry is a url or an anime name
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
      // console.log(data.body.articles);
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
// functions for getting the right format
function dateFormat(date) {
  return date ? date.split('T')[0] : date;
}
function percentFormat(num) {
  return Math.round(num * 100) + '%';
}
function timeFormat(time) {
  time = Number(time);
  var hour = Math.floor(time / 3600);
  var min = Math.floor((time % 3600) / 60);
  var sec = Math.floor((time % 3600) % 60);
  // organize how the format is displayed
  var hours = hour > 0 ? hour + (hour == 1 ? ' hour, ' : ' hours, ') : '';
  var minutes = min > 0 ? min + (min == 1 ? ' min, ' : ' min, ') : '';
  var seconds = sec > 0 ? sec + (sec == 1 ? ' sec' : ' sec') : '';
  return hours + minutes + seconds;
}
// function secure(url) {
//   if (url[5] != 's') {
//       var i = url.split("")
//       i.splice(4, 0, 's');
//   }
//   return i.join("");
// }

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

function AnimeImageSearch(animeImage) {
  this.similarity = percentFormat(animeImage.similarity);
  this.filename = animeImage.filename || 'Unknown';
  this.at = timeFormat(animeImage.at) || 'Unknown';
  (this.season = animeImage.season || 'Unknown'),
    (this.episode = animeImage.episode || 'Unknown');
  this.title_native = animeImage.title_native || 'Unavailable';
  this.title_english = animeImage.title_english || 'Unavailable';
  this.from = timeFormat(animeImage.from) || 'Unknown';
  this.to = timeFormat(animeImage.to) || 'Unknown';
  this.video = `https://media.trace.moe/video/${
    animeImage.anilist_id
  }/${encodeURIComponent(animeImage.filename)}?t=${animeImage.at}&token=${
    animeImage.tokenthumb
  }`;
}

function News(author, title, url, urlToImage, content, publishedAt) {
  this.author = author || 'Author Unknown';
  this.title = title || 'No title available';
  this.url = url || 'Not available';
  this.urlToImage = urlToImage || 'No image available';
  this.content = content.split('…') || 'No content available';
  this.publishedAt = dateFormat(publishedAt) || 'Publish Date unknown';
}
app.listen(PORT, () => {
  console.log('The app is listening on port: ', PORT);
});
