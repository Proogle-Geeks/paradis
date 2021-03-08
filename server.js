'use strict';

// import library

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const override = require('method-override');
const session = require('express-session');
let pg = require('pg');
const bcrypt = require('bcrypt');
const { render } = require('ejs');
// create app

// installing - configuration
const app = express();
app.use(cors());
require('dotenv').config();
app.use(override('_method'));

const PORT = process.env.PORT;

// view-static
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: true }));

var salt = 10; // for password encryption which is any random number
var sess;

const client = new pg.Client(process.env.DATABASE_URL);

//==========
// handler functions
//==========

// get data from quotes API by title
function handleQuotesTitle(req, res) {
  let url = 'https://animechan.vercel.app/api/quotes/anime';
  let query = {
    title: 'naruto',
  };
  superagent
    .get(url)
    .query(query)
    .then((data) => {
      let quoteObj = JSON.parse(data.text);
      let quoteArray = [];
      quoteObj.forEach((element) => {
        let anime = element.anime;
        let character = element.character;
        let quotes = element.quote;
        let type = 'title';
        let quote = new Quote(anime, character, quotes, type);
        quoteArray.push(quote);
      });

      res.status(200).send(quoteArray);
    })
    .catch((error) => {
      res.status(500).send({
        status: 500,
        response: 'sorry cannot connect with api ' + error,
      });
    });
}
// handle quotes API by character
function handleQuotesCharacter(req, res) {
  let url = 'https://animechan.vercel.app/api/quotes/character';
  let query = {
    name: 'saitama',
  };
  superagent
    .get(url)
    .query(query)
    .then((data) => {
      let quoteObj = JSON.parse(data.text);
      let quoteArray = [];
      quoteObj.forEach((element) => {
        let anime = element.anime;
        let character = element.character;
        let quotes = element.quote;
        let quote = new Quote(anime, character, quotes);
        quoteArray.push(quote);
      });

      res.status(200).send(quoteArray);
    })
    .catch((erroe) => {
      res.status(500).send({
        status: 500,
        response: 'sorry cannot connect with api ' + error,
      });
    });
}
// handle quotes API randomly
function handleQuotesRandomly(req, res) {
  let url = 'https://animechan.vercel.app/api/quotes';

  superagent
    .get(url)
    .then((data) => {
      let quoteObj = JSON.parse(data.text);
      let quoteArray = [];
      quoteObj.forEach((element) => {
        let anime = element.anime;
        let character = element.character;
        let quotes = element.quote;
        let quote = new Quote(anime, character, quotes, 'randomly');
        quoteArray.push(quote);
      });

      // res.status(200).send(quoteArray);
      res.render('qoutes.ejs', { newsArray: quoteArray });
    })
    .catch((error) => {
      res.status(500).send({
        status: 500,
        response: 'sorry cannot connect with api ' + error,
      });
    });
}
// get the data from the sign-up form and inserting them to the DATABASE
function handleSignup(req, res) {
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let password = req.body.password;
  console.log([first_name, last_name, email, password]);
  bcrypt.hash(password, salt, (err, encrypted) => {
    password = encrypted;
    let sqlQuery = `insert into users(first_name, last_name, email,password) values ($1,$2,$3,$4)returning *`;
    let values = [first_name, last_name, email, password];
    client.query(sqlQuery, values).then((data) => {
      console.log(data.rows);
      res.redirect('/login-page');
    });
  });
}
// check if the user is loging in else redirect to log-in page
function handleLoginPage(req, res) {
  sess = req.session;
  if (sess.email) {
    res.redirect('/news');
  } else {
    res.render('login.ejs');
  }
}
// get data from log in form and check if user account exist or not
function handleLogin(req, res) {
  let email = req.body.email;
  let password = req.body.password;
  sess = req.session;
  console.log(email, password);

  if (sess.email) {
    res.redirect('/news');
  } else {
    let sqlQuery = `select id, email, password from users where email = '${email}';`;
    client.query(sqlQuery).then((data) => {
      let pass = data.rows[0].password;
      console.log(pass);
      bcrypt.compare(password, pass, function (err, result) {
        if (result === true) {
          // redirect to location
          sess.email = email;
          console.log({ result: result, email: email, password: password });
          res.redirect('/news');
        } else {
          res.send('Incorrect password');
          // redirect to login page
        }
      });
    });
  }
}
// log-out and redirect to the main page
function handleLogout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect('/login-page');
  });
}
// display update form
function handleUpdate(req, res) {
  let email = req.params.email;
  let sqlQuery = `SELECT * FROM users where email = '${email}'`;
  client
    .query(sqlQuery)
    .then((data) => {
      res.render('update.ejs', { users: data.rows });
    })
    .catch((error) => {
      res.send('Incorrect password' + error);
    });
}
// update user data in the DATABASE
function handleUpdateInfo(req, res) {
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  sess = req.session;
  console.log('email from session ' + sess.email);
  let sqlQuery = `UPDATE users SET first_name='${first_name}', last_name='${last_name}', email='${email}' where email = '${sess.email}'`;

  client.query(sqlQuery).then((data) => {
    sess.email = email;
    console.log('the data from sql ' + data);
    res.redirect('/news');
  });
}
// add anime selected to the user list
function handleAnime(req, res) {
  let title = req.body.title;
  let synopsis = req.body.synopsis;
  let type = req.body.type;
  let episodes = req.body.episodes;
  let score = req.body.score;
  let image_url = req.body.image_url;
  let start_date = req.body.start_date;
  let end_date = req.body.end_date;
  let rated = req.body.rated;

  let sqlQuery = `insert into anime(title, synopsis, type, episodes, score, image_url, start_date,end_date,reated) 
  values ('${title}','${synopsis}','${type}','${episodes}','${score}','${image_url}','${start_date}','${end_date}','${rated}')`;
  client.query(sqlQuery).then((data) => {
    console.log('anime data inserted' + data);
    let sql = `SELECT * FROM users where email = '${sess.email}'`;
    var user_id;
    client.query(sql).then((data) => {
      user_id = data.rows[0].id;
      let anime_id;
      let sqlAnime = 'SELECT id FROM anime ORDER BY id DESC LIMIT 1';
      client.query(sqlAnime).then((data) => {
        anime_id = data.rows[0].id;
        let list = `INSERT INTO user_list(user_id, anime_id) values ($1, $2)`;
        let listValues = [user_id, anime_id];
        client.query(list, listValues).then((data) => {
          console.log('data added');
          res.redirect('/anime-search');
        });
      });
    });
  });
}
// get the user list and display it to him/her
function handleMyList(req, res) {
  sess = req.session;
  if (sess.email) {
    let sql = `select * from users where email ='${sess.email}'`;
    client.query(sql).then((data) => {
      let user_id = data.rows[0].id;
      let sql = `SELECT a.title, a.image_url FROM user_list ul, users u, anime a where ul.user_id= '${user_id}' and ul.anime_id= a.id`;
      client.query(sql).then((data) => {
        console.log(data.rows);
        res.render('list.ejs', { mylist: data.rows });
      });
    });
  } else {
    res.redirect('/news');
  }
}
// handle comment section get the data from the DATABASE and render the last 5 comments
function handleCommitPage(req, res) {
  let sqlQuery = 'SELECT * from commits ORDER BY id DESC LIMIT 5';
  client.query(sqlQuery).then((data) => {
    res.render('commit.ejs', { commit: data.rows });
  });
}
// get the data from the form and store it in the DB
function handleCommit(req, res) {
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let subject = req.body.subject;
  let message = req.body.message;
  let status = 'unread';

  let sql = `insert into commits(first_name, last_name, email, subject,message, status) values ('${first_name}','${last_name}','${email}','${subject}','${message}','${status}') `;
  client.query(sql).then((data) => {
    console.log('data added');
    let sqlQuery = 'SELECT * from commits ORDER BY id DESC LIMIT 5';
    client.query(sqlQuery).then((data) => {
      res.render('commit.ejs', { commit: data.rows });
    });
  });
}
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
  // console.log(anime);
};
// handle the details for anime

const handleDetails = (req, res) => {
  let query = req.query;
  let animeData = {};
  for (const [key, value] of Object.entries(query)) {
    animeData[key] = value;
  }
  getAnimeTrailer(animeData['anime']).then((data) => {
    res.render('searches/detail', { videoId: data, animeObject: animeData });
  });
};

//===========
// routes-path
//==========

// Get quotes by anime title
app.get('/quotes-title', handleQuotesTitle);

// Get quotes by anime character
app.get('/quotes-by-character', handleQuotesCharacter);

// Get quotes by anime character
app.get('/quotes-randomly', handleQuotesRandomly);

// Get anime info by anime name
// app.get('/anime-search', handleSearch);

// app.get('/signup-page', handleSignupPage);

app.post('/signup', handleSignup);

app.get('/login-page', handleLoginPage);

app.post('/login', handleLogin);

app.get('/logout', handleLogout);

app.get('/update/:email', handleUpdate);

app.post('/update-info', handleUpdateInfo);

app.post('/anime', handleAnime);

app.get('/myList', handleMyList);

app.get('/commit', handleCommitPage);

app.post('/commitData', handleCommit);
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
app.get('/list', (req, res) => {
  res.render('searches/list');
});

//================
// functions
// ===============

function checkSearchQuery(searchEntry, res) {
  var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  // I got the regex from stack overflow
  if (regex.test(searchEntry)) {
    console.log('you searched for an image');
    getImageSearchData(searchEntry, res).then((data) => {
      // console.log(data);
      res.render('showImage', { anime: data });
    });
  } else {
    console.log('you searched for an name');
    getAnimeData(searchEntry).then((data) => {
      res.render('searches/show', { anime: data });
    });
  }
}

// get anime data that the user search for
function getImageSearchData(anime, res) {
  const imageSearchQuery = { url: anime };
  const imageSearchURl = 'https://trace.moe/api/search';
  return superagent
    .get(imageSearchURl)
    .query(imageSearchQuery)
    .then((data) => {
      let similarResults = [];
      data.body.docs.map((element) => {
        similarResults.push(new AnimeImageSearch(element));
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
  var hours = hour > 0 ? hour + (hour === 1 ? ' hour, ' : ' hours, ') : '';
  var minutes = min > 0 ? min + (min === 1 ? ' min, ' : ' min, ') : '';
  var seconds = sec > 0 ? sec + (sec === 1 ? ' sec' : ' sec') : '';
  return hours + minutes + seconds;
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

function AnimeImageSearch(animeImage) {
  this.similarity = percentFormat(animeImage.similarity);
  this.filename = animeImage.filename || 'Unknown';
  this.at = timeFormat(animeImage.at) || 'Unknown';
  this.season = animeImage.season || 'Unknown';
  this.episode = animeImage.episode || 'Unknown';
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

function Quote(anime, character, quotes, type) {
  this.anime = anime;
  this.character = character;
  this.quotes = quotes;
  this.type = type;
}

client
  .connect()
  .then((data) => {
    app.listen(PORT, () => {
      console.log('the app is listening to ' + PORT);
    });
  })
  .catch((error) => {
    console.log('error in connect to database ' + error);
  });
