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

//render index page
app.get("/", async(req, res) => {
    const db = await dbPromise;
    res.render("index", { user: req.user });
});

//logout functionality
app.post("/", async(req, res) => {
    const db = await dbPromise;
    const token = req.cookies.authToken;
    await db.run("DELETE FROM authToken WHERE token=?", token)
    return res.render("index", { error: "user logged out" });
});

app.get("/login", (req, res) => {
    res.render("login");
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

//render pet profile
app.get("/petProfile", (req,res)=>{
    res.render("petProfile");
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