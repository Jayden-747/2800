// REQUIRES
require("./utils.js");
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const app = express();
const multer = require("multer")
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use(express.json());
app.set("view engine", "ejs");

const fs = require("fs");

// DECLARATIONS
const port = process.env.PORT || 4000;

// SERVER

//env variables
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_database_plantepedia = process.env.MONGODB_DATABASE_PLANTEPEDIA;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

//mongodb database
var { database } = require("./databaseConnection");

const userCollection = database.db(mongodb_database).collection("users");

const plantSummaryCollection = database
  .db(mongodb_database_plantepedia)
  .collection("plantSummary");
const plantDetailsCollection = database
  .db(mongodb_database_plantepedia)
  .collection("plantDetails");

app.use(express.urlencoded({ extended: false }));

//mongo store
var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
  crypto: {
    secret: mongodb_session_secret,
  },
});

//salt rounds for hashing
const saltRounds = 12;

//Expiration for cookie
const expireTime = 1 * 60 * 60 * 1000;

//session
app.use(
  session({
    secret: node_session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true,
  })
);

// Express static paths
app.use("/img", express.static("./assets/img"));
app.use("/font", express.static("./assets/font"));
app.use("/components", express.static("./components"));
app.use("/views", express.static("./views"));
app.use("/modules", express.static("./modules"));
app.use("/landing", express.static("./views/landing"));
app.use("/home", express.static("./views/home"));
app.use("/community", express.static("./views/community"));
app.use("/settings", express.static("./views/settings"));
app.use("/signup", express.static("./views/signup"));
app.use("/login", express.static("./views/login"));
app.use("/plantepedia", express.static("./views/plantepedia"));
app.use("/plantepediaSummary", express.static("./views/plantepedia/summary"));
app.use("/profile", express.static("./views/profile"));

// TODO: create middleware - makes sure user is logged in otherwise gets redirected to login page (implement for every route)

// Returns true if user is in a valid session, otherwise false
function isValidSession(req) {
  return req.session.authenticated;
}

// Middleware for validating a session
function sessionValidation(req, res, next) {
  if (isValidSession(req)) {
    next();
  }
  else {
    res.redirect('/login');
  }
}

// LANDING PAGE
app.get("/", (req, res) => {
  if (req.session.authenticated) {
    res.render("home/home");
  } else {
    res.render("landing/landing");
  }
});

// SIGNUP PAGE
app.get("/signup", async (req, res) => {
  res.render("signup/signup");
});

// USER SUBMISSION
app.post("/signup/submitUser", async (req, res) => {
  var name = req.body.name;
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;

  const schema = Joi.object({
    name: Joi.string().max(40).required(),
    username: Joi.string().alphanum().max(20).required(),
    email: Joi.string().email().max(255).required(),
    password: Joi.string().max(20).required(),
  });

  const validationResult = schema.validate({ name, username, password, email });
  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.redirect("/signup");
    return;
  }

  var hashedPassword = await bcrypt.hash(password, saltRounds);

  await userCollection.insertOne({
    name: name,
    username: username,
    email: email,
    password: hashedPassword,
  });

  const result = await userCollection
    .find({ email: email })
    .project({ email: 1, password: 1, _id: 1, username: 1, name: 1 })
    .toArray();
  console.log("user submitted" + result);
  req.session.authenticated = true;
  req.session.username = result[0].username;
  req.session.email = result[0].email;
  req.session.cookie.maxAge = expireTime;
  res.redirect("/");
});

//LOGIN PAGE
app.get("/login", async (req, res) => {
  res.render("login/login");
});

// LOGIN AUTHENTICATION
app.post("/login/logging", async (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  const schema = Joi.object({
    email: Joi.string().email().max(255).required(),
    password: Joi.string().max(20).required(),
  });

  const validationResult = schema.validate({ email, password });

  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.redirect("/login");
    return;
  }
  const result = await userCollection
    .find({ email: email })
    .project({ email: 1, password: 1, _id: 1, username: 1 })
    .toArray();

  if (result.length != 1) {
    res.redirect("/login");
    console.log("no email");
    return;
  }

  if (await bcrypt.compare(password, result[0].password)) {
    req.session.authenticated = true;
    req.session.username = result[0].username;
    req.session.email = email;
    req.session.cookie.maxAge = expireTime;
    res.redirect("/");
    console.log("logged in");
    return;
  } else {
    res.redirect("/login");
    return;
  }
});

// PASSWORD RESET
app.get("/login/resetPassword", async (req, res) => {
  res.render("login/resetPassword");
});

app.post("/login/reset", async (req, res) => {
  var email = req.body.email;
  var newPassword = req.body.newPassword;

  var newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

  const result = await userCollection
    .find({ email: email })
    .project({ email: 1, password: 1, _id: 1, username: 1 })
    .toArray();

  for (let i = 0; i < result.length; i++) {
    if (result[i].email == email) {
      await userCollection.updateOne(
        { email: email },
        { $set: { password: newHashedPassword } }
      );
    }
  }

  res.redirect("/login");
});

// SETTINGS PAGE
app.get("/settings", (req, res) => {
  res.render("settings/settings");
});

// PROFILE PAGE
app.use("/profile", sessionValidation);
app.get("/profile", async (req, res) => {

  var username = req.session.username;
  var name = req.session.name;
  var email = req.session.email;

  const result = await userCollection.findOne({ email: email }, {projection : {username: 1, name: 1, email: 1} });

  res.render("profile/profile", {user: result});

});

// PROFILE PAGE
app.use("/profile", sessionValidation);
app.get("/profile", async (req, res) => {

  var username = req.session.username;
  var name = req.session.name;
  var email = req.session.email;

  const result = await userCollection.findOne({ email: email }, {projection : {username: 1, name: 1, email: 1} });

  res.render("profile/profile", {user: result});

});

// PLANTEPEDIA SUMMARY PAGE
app.get("/plantepediaSummary", async (req, res) => {
  // TODO Need to Image column later
  const result = await plantSummaryCollection
    .find()
    .project({
      plant_name: 1,
      summary: 1,
      type: 1,
      season: 1,
      difficulty: 1,
      nutrition: 1,
    })
    .toArray();
  res.render("plantepedia/summary/plantepedia", { summaries: result });
});

// TODO Need to add plantepediaDetail page
// PLANTEPEDIA Plant's Detail PAGE
app.get("/plantepediaDetail", async (req, res) => {
  res.render("plantpedia/plantDetail/",)
});

// COMUNITY PAGE
app.get("/community", (req, res) => {
  res.render("community/community", { pageName: "Community" });
});


//Adding a post to community page
app.post("/community/posts", upload.single("photo"), async (req, res) => {
var key = req.body.keyword;
const photoData = {
  name: req.file.originalname,
  filename: key,
  data: req.file.buffer
}

await database.db(mongodb_database).collection('posts').insertOne(photoData);

res.send("photo uploaded successfully")
  
})

app.get("/photos", async (req, res) => {
  const result = await database.db(mongodb_database).collection('posts').find({filename: "DisneyNight"}).project({filename: 1, data: 1}).toArray();

  //imageData from chatgpt
  const imageData = Buffer.from(result[0].data.buffer).toString('base64');
  
  const html = `
  <h2>hellooooo</h2>
  <h3>${result[0].filename}</h3>
  <img src="data:image/jpeg;base64,${imageData}" height="300" width="300" alt="my Image"">
  `;
  
  
  
  res.send(html);

})






// LOGOUT ROUTE
// Destroys session in database
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// PORT
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
