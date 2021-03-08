# Database Creattion
- install 
    - npm install pg 
- call pg
    - let pg = require('pg')
- call client 
    - const client = new pg.client(process.env.DATABASE_API)
- connect the client
    - client.connect().then(data=>{
        app.listen(PORT, ()=>{

        })
    }).catch(){});

- pgstart
- psql
- create database
- out from psql \q
- create tables from schema psql -f data/schema.sql -d paradis

# check the database
- psql
- \c database name
- \d display all tables
- select from spicific table 
    - select * from table name



    



