//create constants
const express = require("express");
exphbs = require("express-handlebars");
const sqlite = require('sqlite');
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
const uuidv4 = require("uuid/v4");

const saltRounds = 10;
const app = express();

//call database
const dbPromise = sqlite.open("./data.sqlite");

//setup handlebars and packages
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(express.urlencoded());
app.use(cookieParser());

//Create middleware to view users
const authorize = async(req, res, next) => {
    const db = await dbPromise;
    const token = req.cookies.authToken;
    console.log("token from authorize: ", token)
    if (!token) {
        return next();
    }

    const authToken = await db.get("SELECT * FROM authToken WHERE token=?", token)
    console.log("authToken from authorize ", authToken)
    if (!authToken) {
        return next();
    }

    const user = await db.get("SELECT * FROM users WHERE id=?", authToken.userId)
    console.log("user from authorize ", user);
    req.user = user;
    next();
};

app.use(authorize);

// images
app.use(express.static('logos'));
app.use(express.static('style.css'));

//render index page
app.get("/", async(req, res) => {
    res.render("index", { user: req.user });
});

//logout functionality
app.get("/logout", async(req, res) => {
    const db = await dbPromise;
    const token = req.cookies.authToken;
    await db.run("DELETE FROM authToken WHERE token=?", token)
    res.redirect("/login?from=logout")
});

app.get("/login", (req, res) => {
    const from = req.query.from;
    let error = null;
    if (from === 'logout') {
        error = 'user logged out'
    }else if(from === 'profile'){
        error = 'please login to view page'
    }else if(from === 'petProfile'){
        error = 'please login to view page'
    }else if(from === 'matching'){
        error === 'please login to view page'
    }
    res.render("login", { error });
});

app.post("/login", async(req, res) => {
    const db = await dbPromise;
    const { email, password } = req.body;
    const user = await db.get("SELECT * FROM users WHERE email=?", email);
    if (!user) {
        return res.render("login", { error: "user not found" });
    }
    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
        return res.render("login", { error: "password is incorrect" })
    }
    const token = uuidv4();
    await db.run("INSERT INTO authToken (token, userID) VALUES (?,?)", token, user.id);
    res.cookie("authToken", token);
    res.redirect("/");
});

app.post("/profile", async(req, res) => {
    console.log("trying to update profile")
    const db = await dbPromise;
    const {email, name, location, bio} = req.body;
    let error = null;
    /*if (!email) {
        error = "email field is required";
    }
    if (!name) {
        error = "name field is required";
    }*/
    if (!location) {
        error = "location field is required";
    }
    if (!bio) {
        error = "bio field is required";
    }
    if (error) {
        return res.render("ownerForm", { error: error });
    }
    await db.run(
        "UPDATE users SET email = ?, name=?, location=?, bio=?;",
        email,
        name,
        location,
        bio
      );
    res.redirect("/profile");
});

//render owner page
app.get("/profile", async(req, res) => {
    res.render("profile", { user: req.user });
});

//render register page
app.get("/register", (req, res) => {
    res.render("register");
})

//check register information
app.post("/register", async(req, res) => {
    const db = await dbPromise;
    const { name, email, password } = req.body;
    let error = null;
    if (!name) {
        error = "name field is required"
    }
    if (!email) {
        error = "email field is required"
    }
    if (!password) {
        error = "password field is required"
    }
    if (error) {
        return res.render("register", { error: error })
    }
    const existingUser = await db.get(
        "SELECT email FROM users WHERE email=?",
        email
    );
    if (existingUser) {
        return res.render("register", { error: "user already exists" });
    }
    const pwHash = await bcrypt.hash(password, saltRounds);
    await db.run(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?);",
        name,
        email,
        pwHash
    );
    const user = await db.get("SELECT name,id FROM users WHERE email=?", email);
    const token = uuidv4();
    await db.run("INSERT INTO authToken (token, userID) VALUES (?,?)", token, user.id);
    res.cookie("authToken", token);
    res.redirect("/");
});

app.get("/profile", async(req,res)=>{
    const token = req.cookies.authToken;
    if(!token)
    {
        res.redirect("/login?from=profile")
    } else{
        res.render("profile");
    }
});

app.get("/ownerForm", async(req,res)=>{
    res.render("ownerForm");
});

//render pet profile
app.get("/petProfile", (req,res)=>{
    const token = req.cookies.authToken;
    if(!token)
    {
        res.redirect("/login?from=petProfile")
    } else{
        res.render("petProfile");
    }
});

app.get("/matching", (req,res)=>{
    const token = req.cookies.authToken;
    if(!token)
    {
        res.redirect("/login?from=matching")
    } else{
        res.render("matching");
    }
});

//Setups database what port is being listened on
const setup = async() => {
    const db = await dbPromise;

    //Resets database after every run, comment out to save data in database
    db.migrate({ force: "last" });
    app.listen(8080, () => console.log("listening on http://localhost:8080"));
};

//run setup
setup();