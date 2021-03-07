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

// const client = new pg.Client(process.env.DATABASE_URL);

const PORT = process.env.PORT;

// view-static
app.set('view engine', 'ejs');
app.use('/public', express.static('./public'));
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
  checkSearchQuery (anime,res); 
  console.log(anime);
 
};


function checkSearchQuery(searchEntry, res){
  var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  // I got the regex from stack overflow
  if(regex.test(searchEntry)) {
    console.log("you searched for an image");
    getImageSearchData(searchEntry, res)
  } else {
    console.log("you searched for an name");
    getAnimeData(searchEntry).then((data) => {
      res.render('show', { anime: data });
    });
  }
}
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
function getImageSearchData(anime, res) {
  const imageSearchQuery = {  url: anime  }
  const imageSearchURl = 'https://trace.moe/api/search';
  superagent.get(imageSearchURl).query(imageSearchQuery).then(data => {
    // console.log(data.body.docs)
    let similarResults = [];
    return data.body.docs.map(element=> {
     similarResults.push(new AnimeImageSearch(element))
     console.log(similarResults);
    });
  }).catch((error) => {
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
            article.description,
            article.publishedAt
          )
      );
    })
    .catch((error) =>
      console.log('error in getting news from News API: ', error)
    );
}

function dateFormat(date) {
  return date.split('T')[0];
}

// Constructors

function Anime(anime) {
  this.title = anime.title;
  this.img_url = anime.image_url;
  this.type = anime.type;
  this.score = anime.score;
  this.start_date = anime.start_date;
  this.end_date = anime.end_date || 'Until Now';
  this.rank = anime.rank;
}

function AnimeImageSearch(animeImage){
  this.similarity= animeImage.similarity;
  this.filename= animeImage.filename;
  this.at = animeImage.at;
  this.season = animeImage.season,
  this.episode= animeImage.episode;
  this.title_native =  animeImage.title_native
  this.title_english = animeImage.title_english

}

function News(author, title, url, urlToImage, description, publishedAt) {
  this.author = author || 'Author Unknown';
  this.title = title || 'No title available';
  this.url = url || 'Not available';
  this.urlToImage = urlToImage || 'No image available';
  this.description = description || 'No description available';
  this.publishedAt = dateFormat(publishedAt) || 'Publish Date unknown';
}
app.listen(PORT, () => {
  console.log('The app is listening on port: ', PORT);
});
