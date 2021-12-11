//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const md5 = require("md5");

const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.use(express.json())
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true})
.then(()=>{console.log("Database Connected");})
.catch(err=>{console.log(err);});

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:true
    },
    password:String
});

const User = new mongoose.model("User", userSchema);

app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register",(req,res)=>{
    const newUser = new User({
        username:req.body.username,
        password:md5(req.body.password)
    });

    newUser.save()
    .then(()=>{res.render("login")})
    .catch((err)=>{console.log("User already exist plz login.")})
});

app.post("/login",(req,res)=>{
    const username = req.body.username;
    const password = md5(req.body.password);

    User.findOne({username:username})
    .then((doc)=>{
        if ((doc.username === username) && (doc.password=== password)){
            res.render("secrets");
        }else{
            console.log("Please enter correct password");
        }
    })
    .catch((err)=>{console.log("User doesn't exist plz register.")})
});


app.listen(port, ()=>{
    console.log("Server started at port ",port);
});