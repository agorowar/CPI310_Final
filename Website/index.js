//create constants
const express = require("express");
exphbs = require("express-handlebars");
const sqlite = require('sqlite');
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
const uuidv4 = require("uuid/v4");
const multer = require('multer');
const path = require('path');

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

    const user = await db.get("SELECT * FROM users WHERE id=?", authToken.userId);
    console.log("user from authorize ", user);
    req.user = user;
    next();
};

//Storage system with Multer
const profileStorage = multer.diskStorage({

    //Set where uploaded images are stored
    destination: 'public/profileUploads/',

    //Callback file name into storage
    filename: function(req, file, cb){
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

//Storage system with Multer
const petStorage = multer.diskStorage({

    //Set where uploaded images are stored
    destination: 'public/petUploads/',

    //Callback file name into storage
    filename: function(req, file, cb){
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

//inital upload
const profileUpload = multer({

    //Set storage to storage engine
    storage: profileStorage,

    //Check what files should be uploaded
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }

    //.single uploads one image at a time, use array for multiple image uploading
}).single('myImage');

//inital upload
const petUpload = multer({

    //Set storage to storage engine
    storage: petStorage,

    //Check what files should be uploaded
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }

    //.single uploads one image at a time, use array for multiple image uploading
}).single('myImage');

//check for filetypes
function checkFileType(file, cb){

    //Allowed extentions
    const filetypes = /jpeg|jpg|png|gif/;

    //Check extentions of file
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    //Check mime
    //Mimetype is a standard that indicates the nature and format of a document, file, or assortment of bytes.
    //Browsers use the MIME type, not the file extension, to determine how to process a URL, so it's important that web servers send the correct MIME type in the response's 
    //Content-Type header. If this is not correctly configured, browsers are likely to misinterpret the contents of files and sites will not work correctly, 
    //and downloaded files may be mishandled.
    const mimetype = filetypes.test(file.mimetype);

    //If the mimetype test is positive and the extname is the same as the set allowed filetypes
    //Return callback true
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
}

//Replace filepath in directory with defined filepath with dirname
app.get('/profileimages/*', async (req, res) => {

    //Replace filepath with new filepath
    let filePathtest = req.path;
    console.log("fptest",filePathtest)
    let filePath = req.path.replace("/profileimages/", "")
    console.log("fp", filePath)
    res.sendFile(__dirname + "/public/profileUploads/" + filePath)
})

//Replace filepath in directory with defined filepath with dirname
app.get('/petimages/*', async (req, res) => {

    //Replace filepath with new filepath
    let filePathtest = req.path;
    console.log("fptest",filePathtest)
    let filePath = req.path.replace("/petimages/", "")
    console.log("fp", filePath)
    res.sendFile(__dirname + "/public/petUploads/" + filePath)
})

app.use(authorize);

// images
app.use(express.static(__dirname + '/logos/'));

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
    } else if (from === 'profile') {
        error = 'please login to view page'
    } else if (from === 'petProfile') {
        error = 'please login to view page'
    } else if (from === 'matching') {
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


app.get("/profile", async(req, res) => {
    const db = await dbPromise;
    const token = req.cookies.authToken
    const images = await db.all("SELECT * FROM profileImages");
    if (!token) {
        res.redirect("/login?from=profile")
    } else {
        res.render("profile", {user: req.user, images});
    }
});

app.get("/ownerForm", async(req,res)=>{
    res.render("ownerForm");
})

app.post("/ownerForm", async(req, res) => {
    const db = await dbPromise;
    const {location, bio} = req.body;
    let error = null;
    if (!location) {
        error = "location field is required";
    }
    if (!bio) {
        error = "bio field is required";
    }
    if (error) {
        return res.render("ownerForm", { error: error });
    }
    const userId = await db.get("SELECT * FROM users");
    await db.run("UPDATE users SET location=?, bio=? WHERE id=?",location,bio,req.user.id);
    res.redirect("profile");
});

app.get("/ownerImage", (req,res)=>{
    res.render("ownerImage");
});

app.post("/ownerImage", async(req,res)=>{
    const db = await dbPromise;
    //Check for errors with image upload
    profileUpload(req,res, async(err)=>{
        if(err){
            return res.render('ownerImage', {error:err})
        }
        if(req.file == undefined){
            return res.render('ownerImage', { error: 'Error: No File Selected!'});
                    
        //else if there are no errors
        } else{
             //save filepath
            const fileName = req.file.filename;
            console.log("read fileName: " + fileName);
    
            const userId = await db.get("SELECT * FROM users");
    
            //Delete Last File
            //Omit delete function to have multiple images displayed instead of one
            await db.run("DELETE FROM profileImages WHERE userId = ?",userId.id);
    
            //insert filepath into database
            await db.run("INSERT INTO profileImages (fileName,userId) VALUES (?,?)",fileName,userId.id);
            res.redirect("profile");
        }
    });
})

//render pet profile
app.get("/petProfile", async(req, res) => {
    const db = await dbPromise;
    const token = req.cookies.authToken;
    const pet = await db.all("SELECT * FROM pets");
    const images = await db.all("SELECT * FROM petImages");
    if (!token) {
        res.redirect("/login?from=petProfile")
    } else {
        res.render("petProfile", {pets: pet, images});
    }
});

app.get("/new-pet", (req, res) => {
    const token = req.cookies.authToken;
    if (!token) {
        res.redirect("/login?from=new-pet")
    } else {
        res.render("new-pet");
    }
});

app.post("/new-pet", async(req, res) => {
    const db = await dbPromise;
    const { petname, species, gender, age, petbio, otherpetinfo  } = req.body;
    let error = null;
    if (!petname) {
        error = "pet name field is required";
    }
    if (!species) {
        error = "species field is required";
    }
    if (!gender) {
        error = "gender field is required";
    }
    if (!age) {
        error = "age field is required";
    }
    if (!petbio) {
        error = "pet bio field is required";
    }
    if (error) {
        return res.render("new-pet", { error: error });
    }
    //const petOwner = db.get("SELECT * FROM users WHERE id=?", user.id);
    await db.run(
        "INSERT INTO pets (petname, species, gender, age, petbio, otherpetinfo, petOwner) VALUES (?, ?, ?, ?, ?, ?,?)",
        petname, 
        species, 
        gender,
        age, 
        petbio, 
        otherpetinfo,
        req.user.email
    );
    res.redirect("petProfile");
});

app.get("/petImage",(req,res)=>{
    res.render("petImage");
});

app.post("/petImage", async(req,res)=>{
    const db = await dbPromise;
    //Check for errors with image upload
    petUpload(req,res, async(err)=>{
        if(err){
            return res.render('petImage', {error:err})
        }
        if(req.file == undefined){
            return res.render('petImage', { error: 'Error: No File Selected!'});
                        
        //else if there are no errors
        } else{
            //save filepath
            const fileName = req.file.filename;
            console.log("read fileNames: " + fileName);
            
            const petId = await db.get("SELECT * FROM pets WHERE petOwner=?",req.user.email);

            //Delete Last File
            //Omit delete function to have multiple images displayed instead of one
            await db.run("DELETE FROM petImages WHERE petId = ?",petId.id);
        
            //insert filepath into database
            await db.run("INSERT INTO petImages (fileName,petId) VALUES (?,?)",fileName,petId.id);
            res.redirect("petProfile");
        }   
    });
})

app.get("/matching", async(req, res) => {
    const db = await dbPromise;
    const token = req.cookies.authToken;
    const user = await db.all("SELECT * FROM users WHERE id!=?",req.user.id);
    // const pet = await db.all("SELECT * FROM pets");
    if (!token) {
        res.redirect("/login?from=matching")
    } else {
        res.render("matching", {user: user});
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