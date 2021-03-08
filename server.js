'use strict';

// import library

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const override = require('method-override');
const session = require('express-session');
let pg = require('pg');
const bcrypt = require('bcrypt');
var salt = 10; //any random value
// create app

let app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engin', 'ejs');
require('dotenv').config();
app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: true }));

const PORT = process.env.PORT;
var sess;

const client = new pg.Client(process.env.DATABASE_URL);

app.get('/news', handleNews);

// Get quotes by anime title
app.get('/quotes-title', handleQuotesTitle);

// Get quotes by anime character
app.get('/quotes-by-character', handleQuotesCharacter);

// Get quotes by anime character
app.get('/quotes-randomly', handleQuotesRandomly);

// Get anime info by anime name
app.get('/anime-search', handleSearch);

app.get('/signup-page', handleSignupPage);

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

// Get anime by category
// app.get('/anime-by-category', handleAnimeCategory);

function handleNews(req, res) {
  let api = '7e6689dfe5cb47e8a8a7f6f47bda4506';
  let url = 'http://newsapi.org/v2/everything';
  let query = {
    q: 'anime',
    from: '2021-02-14',
    sortBy: 'publishedAt',
    apiKey: api,
    limit: 50,
  };
  superagent
    .get(url)
    .query(query)
    .then((data) => {
      let news = data.body.articles;
      let newsArray = [];
      news.forEach((element) => {
        let author = element.author;
        let title = element.title;
        let description = element.description;
        let article_url = element.url;
        let image = element.urlToImage;
        let published = element.publishedAt.split('T');

        let newsObj = new News(
          author,
          title,
          description,
          article_url,
          image,
          published[0]
        );
        newsArray.push(newsObj);
      });

      sess = req.session;
      if (sess.email) {
        console.log('your email in session is ' + sess.email);

        res.render('news.ejs', {
          newsArray: newsArray,
          email_in_session: sess.email,
        });
      } else {
        console.log('your email is not in session is ');
        res.redirect('/login-page');
      }
    })
    .catch((error) => {
      res.status(500).send({
        status: 500,
        response: 'sorry cannot connect with api ' + error,
      });
    });
}

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

function handleSearch(req, res) {
  let url = 'https://api.jikan.moe/v3/search/anime';
  let query = {
    q: 'onePiece',
  };
  superagent
    .get(url)
    .query(query)
    .then((data) => {
      let result = JSON.parse(data.text).results;
      let animeArray = [];
      result.forEach((element) => {
        let title = element.title;
        let synopsis = element.synopsis;
        let type = element.type;
        let episodes = element.episodes;
        let score = element.score;
        let image_url = element.image_url;
        let start_date = element.start_date;
        let end_date = element.end_date;
        let rated = element.rated;

        let anime = new Search(
          title,
          synopsis,
          type,
          episodes,
          score,
          image_url,
          start_date,
          end_date,
          rated
        );
        animeArray.push(anime);
      });
      sess = req.session;
      if (sess.email) {
        console.log('your email in session is ' + sess.email);

        res.render('anime.ejs', {
          newsArray: animeArray,
          email_in_session: sess.email,
        });
      } else {
        console.log('your email is not in session is ');
        res.redirect('/login-page');
      }
    })
    .catch((error) => {
      res.status(500).send({
        status: 500,
        response: 'sorry cannot connect with api ' + error,
      });
    });
}

function handleSignupPage(req, res) {
  res.render('index.ejs');
}

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

function handleLoginPage(req, res) {
  sess = req.session;
  if (sess.email) {
    res.redirect('/news');
  } else {
    res.render('login.ejs');
  }
}

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

function handleLogout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect('/login-page');
  });
}

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
function handleCommitPage(req, res) {
  let sqlQuery = 'SELECT * from commits ORDER BY id DESC LIMIT 5';
  client.query(sqlQuery).then((data) => {
    res.render('commit.ejs', { commit: data.rows });
  });
}
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

// //error
// function handleAnimeCategory(req, res){
//     let url = 'https://kitsu.io/api/edge/anime';

//     let query = {
//         filter[categories] :'action'
//     }
//     superagent.get(url).query(query).then(data=>{
//         res.status(200).send(JSON.parse(data.text).data);
//     }).catch(error=>{
//         res.status(500).send({status: 500, response: 'sorry cannot connect with api '+ error});
//     });
// }

function News(author, title, description, article_url, image, published) {
  this.author = author;
  this.title = title;
  this.description = description;
  this.article_url = article_url;
  this.image = image;
  this.published = published;
}

function Quote(anime, character, quotes, type) {
  this.anime = anime;
  this.character = character;
  this.quotes = quotes;
  this.type = type;
}

function Search(
  title,
  synopsis,
  type,
  episodes,
  score,
  image_url,
  start_date,
  end_date,
  rated
) {
  this.title = title;
  this.synopsis = synopsis;
  this.type = type;
  this.episodes = episodes;
  this.score = score;
  this.image_url = image_url;
  this.start_date = start_date;
  this.end_date = end_date;
  this.rated = rated;
}
// const client = new pg.Client(process.env.DATABASE_URL);

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
// app.listen(PORT, () => {
//     console.log('the app is listening to ' + PORT);
// });
