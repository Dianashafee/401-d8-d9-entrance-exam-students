'use strict'
// -------------------------
// Application Dependencies
// -------------------------
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');

// -------------------------
// Environment variables
// -------------------------
require('dotenv').config();
const HP_API_URL = process.env.HP_API_URL;

// -------------------------
// Application Setup
// -------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));

// Application Middleware override
app.use(methodOverride('_method'));

// Specify a directory for static resources
app.use(express.static('./public'));
app.use(express.static('./img'));

// Database Setup

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

// Set the view engine for server-side templating

app.set('view engine', 'ejs');


// ----------------------
// ------- Routes -------
// ----------------------
app.get('/home', handleHome);
app.post('/savedChar', handlFact);
app.get('/savedChar', handleSave);
app.get('/savedChar/:id', handledDetails);
app.put('/savedChar/:id', handledUpdate);
app.delete('/savedChar/:id', handledDelete);


// --------------------------------
// ---- Pages Routes functions ----
// --------------------------------

function handleHome(req,res){
let arr = [];
let url = 'http://hp-api.herokuapp.com/api/characters';
superagent.get(url).then(data =>{
data.body.forEach(element => {
    arr.push(new Potter(element));
});
res.render('home',{result: arr});
});
}

function Potter(data){
    this.image = data.image;
    this.name = data.name;
    this.house = data.house;
    this.patronus = data.patronus;
    this.alive = data.alive;
}


function handlFact(req, res){
    let statment = 'INSERT INTO api (name,house,patronus,alive) VALUES ($1,$2,$3,$4);';
    let val = [ req.body.name, req.body.house, req.body.patronus, req.body.alive];
    client.query(statment, val).then(()=>{
    res.redirect('/savedChar');
    });
}

function handleSave(req,res){
    let statment = 'SELECT * FROM api;';
    client.query(statment).then(data =>{
        res.render('saved',{result : data.rows});
    });
}


function handledDetails (req,res){
let statment = 'SELECT * FROM api WHERE id=$1;';
let value = [req.params.id];
client.query(statment,value).then(data=>{
    res.render('details', {result: data.rows[0]});
});
}
// -----------------------------------
// --- CRUD Pages Routes functions ---
// -----------------------------------

function handledUpdate (req,res){
    let statment = 'UPDATE api SET name=$1 ,patronus=$2, alive=$3 WHERE id=$4;';
    let val = [req.body.name, req.body.patronus, req.body.alive, req.params.id];
    client.query(statment, val).then(()=>{
        res.redirect('/savedChar');
    });
}

function handledDelete(req, res){
    let statment = 'DELETE FROM api WHERE id=$1;';
    let val = [req.params.id];
    client.query(statment,val).then(()=>{
        res.redirect('/savedChar');
    })
}

// Express Runtime
client.connect().then(() => {
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
}).catch(error => console.log(`Could not connect to database\n${error}`));
