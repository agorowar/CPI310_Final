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

<<<<<<< HEAD
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

    //Set file size limit
    limits:{fileSize: 1000000},

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

    //Set file size limit
    limits:{fileSize: 1000000},

    //Check what files should be uploaded
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }

    //.single uploads one image at a time, use array for multiple image uploading
}).array('myImage',3);

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

=======
>>>>>>> 85f82c59688910f0c317b04cb4b7f48ee7c8270f
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

//Replace filepath in directory with defined filepath with dirname
app.get('/profileimages/*', async (req, res) => {

    //Replace filepath with new filepath
    let filePath = req.path.replace("/profileimages/", "")
    console.log("fp", filePath)
    res.sendFile(__dirname + "/public/profileUploads/" + filePath)
})

//Replace filepath in directory with defined filepath with dirname
app.get('/petimages/*', async (req, res) => {

    //Replace filepath with new filepath
    let filePath = req.path.replace("/petimages/", "")
    console.log("fp", filePath)
    res.sendFile(__dirname + "/public/petUploads/" + filePath)
})

app.get("/profile", async(req, res) => {
    const db = await dbPromise;
    const token = req.cookies.authToken;
    const images = await db.all("SELECT * FROM profileImages");
    if (!token) {
        res.redirect("/login?from=profile")
    } else {
        res.render("profile", {user: req.user, images});
    }
});

<<<<<<< HEAD
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
    //Check for errors with image upload
    profileUpload(req,res, async(err)=>{
        if(err){
            return res.render('ownerForm', {error:err})
        }
        if(req.file == undefined){
            return res.render('ownerForm', { error: 'Error: No File Selected!'});
                
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
        }
    });
    const token = req.cookies.authToken;
    const authToken = await db.get("SELECT * FROM authToken WHERE token=?", token)
    const user = await db.get("SELECT * FROM users WHERE id=?", authToken.userId)
    const userId = await db.get("SELECT * FROM users");
    await db.run(
        "INSERT INTO users (location,bio) VALUES (?,?) WHERE id=?",
        location,
        bio,
        userId.id
      );
    res.redirect("/profile");
});

=======
>>>>>>> 85f82c59688910f0c317b04cb4b7f48ee7c8270f
//render pet profile
app.get("/petProfile", async(req, res) => {
    const db = await dbPromise;
    const token = req.cookies.authToken;
    const pets = await db.all("SELECT * FROM pets WHERE petOwner=?", users.email);
    if (!token) {
        res.redirect("/login?from=petProfile")
    } else {
        res.render("petProfile", {pets: req.pets, images});
    }
});

app.get("/matching", (req, res) => {
    const token = req.cookies.authToken;
    if (!token) {
        res.redirect("/login?from=matching")
    } else {
        res.render("matching");
    }
});

app.post("/new-pet", async(req, res) => {
    const db = await dbPromise;
    //const user = db.get();
    const { petname, species, gender, age, petbio, otherpetinfo  } = req.body;
<<<<<<< HEAD
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
    if (!otherpetinfo) {
        error = "otehr pet info field is required";
    }
    if (error) {
        return res.render("new-pet", { error: error });
    }
    await db.run(
        "INSERT INTO pets (petname, species, gender, age, petbio, otherpetinfo, petOwner) VALUES (?, ?, ?, ?, ?, ?,?)",
=======
    await db.run(
        "INSERT INTO pets (petname, species, gender, age, petbio, otherpetinfo) VALUES (?, ?, ?, ?, ?, ?)",
>>>>>>> 85f82c59688910f0c317b04cb4b7f48ee7c8270f
        petname, 
        species, 
        gender,
        age, 
        petbio, 
        otherpetinfo,
<<<<<<< HEAD
        petOwner.email
    )
    //Check for errors with image upload
    petUpload(req,res, async(err)=>{
        if(err){
            return res.render('new-pet', {error:err})
        }
        if(req.file == undefined){
            return res.render('new-pet', { error: 'Error: No File Selected!'});
                        
        //else if there are no errors
        } else{
            //save filepath
            const fileName = req.files.filename;
            console.log("read fileName: " + fileName);
            
            const petId = await db.get("SELECT * FROM pets");

            //Delete Last File
            //Omit delete function to have multiple images displayed instead of one
            await db.run("DELETE FROM petImages WHERE petId = ?",petId.id);
        
            //insert filepath into database
            await db.run("INSERT INTO petImages (fileName,petId) VALUES (?,?)",fileName,petId.id);
        }
    res.redirect("/petProfile");
=======
    )
    res.redirect("/profile");
>>>>>>> 85f82c59688910f0c317b04cb4b7f48ee7c8270f
});
});

app.get("/new-pet"), (req,res)=>{
    res.render("new-pet");
}


//Setups database what port is being listened on
const setup = async() => {
    const db = await dbPromise;

    //Resets database after every run, comment out to save data in database
    db.migrate({ force: "last" });
    app.listen(8080, () => console.log("listening on http://localhost:8080"));
};

//run setup
setup();