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
app.use(
  session({ secret: 'ssshhhhh', saveUninitialized: false, resave: false })
);

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
    .catch((error) => {
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

// tested and it is work correct
// get the data from the sign-up form and inserting them to the DATABASE
function handleSignup(req, res) {
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let password = req.body.password;
  // console.log([first_name, last_name, email, password]);
  bcrypt.hash(password, salt, (err, encrypted) => {
    password = encrypted;
    let sqlQuery = `insert into users(first_name, last_name, email,password) values ($1,$2,$3,$4)returning *`;
    let values = [first_name, last_name, email, password];
    client.query(sqlQuery, values).then((data) => {
      res.redirect('/login-page');
    });
  });
}
// check if the user is loging in else redirect to log-in page
function handleLoginPage(req, res) {
  sess = req.session;
  if (sess.email) {
    res.redirect('/');
  } else {
    res.render("sign-in", { logout: check(req) });
  }
}
// get data from log in form and check if user account exist or not
function handleLogin(req, res) {
  let email = req.body.email;
  let password = req.body.password;
  sess = req.session;
  // console.log(email, password);

  if (sess.email) {
    res.redirect('/');
  } else {
    let sqlQuery = `select id, email, password from users where email = '${email}';`;
    client
      .query(sqlQuery)
      .then((data) => {
        let pass = data.rows[0].password;
        // console.log(pass);
        bcrypt.compare(password, pass, function (err, result) {
          if (result === true) {
            // redirect to location
            sess.email = email;
            // console.log({ result: result, email: email, password: password });
            res.redirect('/');
          } else {
            res.redirect('/login-page', { errorMessage: 'Incorrect password' });
            // redirect to login page
          }
        });
      })
      .catch((error) => {
        res.redirect('/login-page', {
          errorMessage: 'Account Does not Exists Please create new one',
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
    res.redirect('/');
  });
}






// tested and it work
// add anime selected to the user list
function handleAnime(req, res) {
 
  let anime = req.body.title;
  let type = req.body.type;
  let score = req.body.score;
  let video = req.body.video;
  let image = req.body.image;
  let start_date = req.body.start_date;
  let end_date = req.body.end_date;
  let description = req.body.description;
  let animeData = {
    anime: anime,
    type: type,
    score: score,
    image: image,
    start_date: start_date,
    end_date: end_date,
    description: description,
  };
     
  sess = req.session;

  if (sess.email) {
    let sqlQuery = `insert into anime(title, type, score, video,image, start_date,end_date,description) 
    values ('${anime}','${type}','${score}','${video}','${image}','${start_date}','${end_date}','${description}')`;
    client.query(sqlQuery).then((data) => {
  
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
            res.redirect('/mylist');
          });
        });
      });
    });
  } else {
    res.render('searches/detail', {
      videoId: video,
      animeObject: animeData,
      bol: false,
      message: 'Please Login before added',
      logout: check(req)
    });
  }
}
// tested and work correctly
// get the user list and display it to him/her
function handleMyList(req, res) {
  sess = req.session;
  if (sess.email) {
    let sql = `select * from users where email ='${sess.email}'`;
    client.query(sql).then((data) => {
      let user_id = data.rows[0].id;
      let sql = `SELECT ul.id ,a.title as anime, a.image , a.video FROM user_list ul, users u, anime a where ul.user_id= '${user_id}' and ul.anime_id= a.id`;
      client.query(sql).then((data) => {
    
        res.render('searches/list', { mylist: data.rows, logout: check(req) });
      });
    });
  } else {
    res.redirect('/');
  }
}
// render index.ejs in the home page
const renderHome = (req, res) => {
  getTopAnimes().then((data) => {
    getNewsData().then((animeNews) => {
      // console.log(data);
      res.render("index", { anime: data, news: animeNews, logout: check(req) });
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
  sess = req.session;

  getAnimeTrailer(animeData['anime']).then((data) => {
    res.render("searches/detail", {
      videoId: data,
      animeObject: animeData,
      bol: false,
      message: "",
      commit: [],
      logout: check(req),
    });
  });
};

// tested and it work correctly
// delete elemet from user list
function handelDeleteList(req, res) {
  let id = req.params.id;
  let sql = `DELETE from user_list where id ='${id}'`;
  client.query(sql).then((data) => {
    console.log(data.rows);
    res.redirect('/myList');
  });
}

// tested and it work correctly
function handleDetailsMyList(req, res) {
  sess = req.session;
  let anime_id = req.params.id;
  if (sess.email) {
    let sql = `select * from users where email ='${sess.email}'`;
    client.query(sql).then((data) => {
      let user_id = data.rows[0].id;
      let sql = `SELECT ul.id, a.title as anime,a.type,a.score ,a.image , a.video, a.start_date, a.end_date, a.description  FROM user_list ul, users u, anime a where ul.user_id= '${user_id}' and ul.anime_id= a.id and ul.id=${anime_id}`;
      client.query(sql).then((data) => {
        let animeObject = data.rows[0];
        let video = data.rows[0].video;
        let animeSql = `select * from anime where video='${video}'`;
        client.query(animeSql).then((data) => {
          let anime_id = data.rows[0].id;
          let commitSql = `select * from commits where anime_id = '${anime_id}'`;
          client.query(commitSql).then((data) => {
            res.render("searches/detail", {
              animeObject: animeObject,
              videoId: video,
              bol: true,
              message: "",
              commit: data.rows,
              logout: check(req),
            });
          });
        });
      });
    });
  } else {
    res.redirect('/');
  }
}

// handle comment section get the data from the DATABASE and render the last 5 comments
function handleCommitPage(req, res) {
  let anime = req.body.title_commit;
  let type = req.body.type_commit;
  let score = req.body.score_commit;
  let video = req.body.video_commit;
  let image = req.body.image_commit;
  let start_date = req.body.start_date_commit;
  let end_date = req.body.end_date_commit;
  let description = req.body.description_commit;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let message = req.body.message;
  sess = req.session;
  if (sess.email) {
    console.log('in commit data', sess.email);
    let sql = `select count(video) from anime where video ='${video}'`;
    client.query(sql).then((data) => {
      console.log("data im commit ", data.rows[0].count);
      if (data.rows[0].count === 0) {
        let sqlQuery = `insert into anime(title, type, score, video,image, start_date,end_date,description) 
          values ('${anime}','${type}','${score}','${video}','${image}','${start_date}','${end_date}','${description}')`;
        client.query(sqlQuery).then((data) => {
          let getSql = `select * from anime order by id desc limit 1`;
          client.query(getSql).then((data) => {
            let dataAnime = data.rows[0];

            let anime_id = data.rows[0].id;

            let commitSql = `insert into commits(first_name,last_name,email,message,anime_id) values ('${first_name}','${last_name}','${email}','${message}','${anime_id}')`;
            client.query(commitSql).then((data) => {
              let sqlQuery = `SELECT * from commits ORDER BY id DESC LIMIT 5 where anime_id = '${anime_id}'`;
              client.query(sqlQuery).then((data) => {
                res.render("searches/detail", {
                  videoId: dataAnime.video,
                  animeObject: dataAnime,
                  bol: false,
                  message: "",
                  commit: data.rows,
                  logout: check(req),
                });
              });
            });
          });
        });
      } else {
        let sql = `select * from anime where video ='${video}'`;
        client.query(sql).then((data) => {
          let dataAnime = data.rows[0];
          let anime_id = data.rows[0].id;
          let commitSql = `insert into commits(first_name,last_name,email,message,anime_id) values ('${first_name}','${last_name}','${email}','${message}','${anime_id}')`;
          client.query(commitSql).then((data) => {
            let sqlQuery = `SELECT * FROM commits WHERE anime_id='${anime_id}' ORDER BY id DESC LIMIT 5;`;
            client.query(sqlQuery).then((data) => {
              res.render("searches/detail", {
                videoId: dataAnime.video,
                animeObject: dataAnime,
                bol: false,
                message: "",
                commit: data.rows,
                logout: check(req),
              });
            });
          });
        });
      }
    });
  } else {
    res.redirect('/search/details');
  }
}

// get the data from the form and store it in the DB
function handleCommit(req, res) {
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let message = req.body.message;
  let sql = `insert into commits(first_name, last_name, email,message) values ('${first_name}','${last_name}','${email}','${message}') `;
  client.query(sql).then((data) => {
    console.log('data added');
    let sqlQuery = 'SELECT * FROM commits ORDER BY id DESC LIMIT 5;';
    client.query(sqlQuery).then((data) => {
      res.redirect('/search/details');
    });
  });
}




// tested and work correctly 
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
    res.redirect('/');
  });
}
// tested and work correctly
// display user info to the profile page
function handleUserInfo(req, res){
  sess = req.session;
  let sql =`SELECT * FROM users WHERE email = '${sess.email}'`;
  client.query(sql).then(data=>{
    let id = data.rows[0].id;
    let userData = data.rows[0];
    let countSql = `SELECT count(ul.id) FROM user_list ul, users u WHERE ul.user_id = '${id}'`;
    client.query(countSql).then(data=>{
         res.render("user-info", {
           user: userData,
           count: data.rows[0].count,
           logout: check(req),
         });
    })
  })

 
}

function handleDeleteUser(req,res){
    req.session.destroy((err) => {
      if (err) {
        return console.log(err);
      }
        let email = req.params.email;
        let sql = `DELETE FROM users WHERE email='${email}'`;
      res.redirect("/");
    });
 
}
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

app.get('/myList', handleMyList);

app.get('/', renderHome);

app.get('/search', handleSearch);

app.get('/search/details', handleDetails);

app.get('/about-us', (req, res) => {
  res.render("about-us", { logout: check(req) });
});
app.get('/contact-us', (req, res) => {
  res.render("contact-us", { logout: check(req) });
});

app.post('/anime', handleAnime);

app.delete('/myList/:id', handelDeleteList);

app.post('/search/details/:id', handleDetailsMyList);

app.post('/update-info', handleUpdateInfo);

app.post('/commit', handleCommitPage);

app.post('/commitData', handleCommit);

app.delete('/delete-user/:email', handleDeleteUser);
// paths-routs

// app.get('/sign-in', (req, res) => {
//   res.render('sign-in');
// });
// app.get('/list', (req, res) => {
//   res.render('searches/list');
// });

app.get('/user-info', handleUserInfo);


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


function check(req){
  sess = req.session;
  if(sess.email){
    return true;
  }
  return false;
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
