//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const session =  require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

const port = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.use(express.json())
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret: 'oursecretSecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }));

app.use(passport.initialize());
app.use(passport.session());

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

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.get("/secrets",(req,res)=>{
    if (req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.post("/register",(req,res)=>{
       User.register({username:req.body.username},req.body.password,(err,user)=>{
           if(err){
               console.log(err);
               res.redirect("/register");
           }else{
               passport.authenticate("local")(req,res,()=>{
                   res.redirect("/secrets");
               });
           }
       });
});

app.post("/login",(req,res)=>{
    const user = new User({
        username:req.body.username,
        password:req.body.password
    });

    req.login(user,(err)=>{
        if (err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res, ()=>{
                res.redirect("/secrets");
            });
        }
    });
});


app.listen(port, ()=>{
    console.log("Server started at port ",port);
});