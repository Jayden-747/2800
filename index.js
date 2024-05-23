// REQUIRES
require("./utils.js");
require("dotenv").config();
const mongodb = require("mongodb");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const app = express();
const multer = require("multer");
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
const gardensCollection = database.db(mongodb_database).collection("gardens");

const plantCollection = database
  .db(mongodb_database_plantepedia)
  .collection("plant");
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

// Express static paths
app.use("/img", express.static("./assets/img"));
app.use("/font", express.static("./assets/font"));
app.use("/components", express.static("./components"));
app.use("/views", express.static("./views"));
app.use("/modules", express.static("./modules"));
app.use("/video", express.static("./Video"));
// VIEWS
app.use("/landing", express.static("./views/landing"));
app.use("/home", express.static("./views/home"));
app.use("/community", express.static("./views/community"));
app.use("/newPost", express.static("./views/newPost"));
app.use("/settings", express.static("./views/settings"));
app.use("/signup", express.static("./views/signup"));
app.use("/login", express.static("./views/login"));
app.use("/plantepedia", express.static("./views/plantepedia"));
app.use("/plantepediaSummary", express.static("./views/plantepedia/summary"));
app.use(
  "/plantepediaDetail",
  express.static("./views/plantepedia/plantDetail")
);
app.use("/garden", express.static("./views/garden"));
app.use("/profile", express.static("./views/profile"));
app.use("/explore", express.static("./views/explore"));
app.use("/reservation", express.static("./views/reservation"));
app.use("/reservationForm", express.static("./views/reservation"));

//session
app.use(
  session({
    secret: node_session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true,
  })
);

// TODO: create middleware - makes sure user is logged in otherwise gets redirected to login page (implement for every route)

// Returns true if user is in a valid session, otherwise false
function isValidSession(req) {
  if (req.session.authenticated) {
    return true;
  }
  return false;
}

// Middleware for validating a session
function sessionValidation(req, res, next) {
  if (isValidSession(req)) {
    next();
  } else {
    res.redirect("/login");
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
  console.log(username);
  console.log(email);
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
app.get("/login/resetPassword", sessionValidation, async (req, res) => {
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
app.get("/settings", sessionValidation, (req, res) => {
  res.render("settings/settings");
});

// PROFILE PAGE
app.use("/profile", sessionValidation);
app.get("/profile", sessionValidation, async (req, res) => {
  var username = req.session.username;
  var name = req.session.name;
  var email = req.session.email;

  const result = await userCollection.findOne(
    { email: email },
    { projection: { username: 1, name: 1, email: 1 } }
  );

  res.render("profile/profile", { user: result });
});

// PLANTEPEDIA SUMMARY PAGE
app.get("/plantepediaSummary", sessionValidation, async (req, res) => {
  var postsArray = [];
  const result = await plantCollection
    .find()
    .project({
      plant_name: 1,
      summary: 1,
      image: 1,
      type: 1,
      season: 1,
      difficulty: 1,
      nutrition: 1,
    })
    .toArray();

  // This code block brings plant images from the database and stores them in the array called "postsArray" before posting images on the page
  for (var i = 0; i < result.length; i++) {
    const imageData = Buffer.from(result[i].image.buffer).toString("base64");
    postsArray.push(imageData);
  }

  res.render("plantepedia/summary/plantepediaAllPlants", {
    summaries: result,
    imageD: postsArray,
  });
});

// This is for uploading cover picture in plantepedia
//* Form with input and button has deleted in plantepediaAllPlants.ejs
//* If need to update the cover photo for each fruits, please make form with input and button
app.post(
  "/plantepediaSummary/setPlantPic",
  upload.single("image"),
  async (req, res) => {
    //* If need to change the photo of specific plant, please change the name of plant
    //* in '{ plant_name: "Place here the name of plant that you want!" }'
    await database
      .db(mongodb_database_plantepedia)
      .collection("plant")
      .updateOne(
        { plant_name: "Cherry Tomato" },
        { $set: { image: resizingImage } }
      );
    console.log("Photo saved perfectly");
    res.redirect("/plantepediaSummary");
  }
);

// PLANTEPEDIA Plant's Detail PAGE
app.get("/plantepediaDetail/:plant", sessionValidation, async (req, res) => {
  var plantName = req.params.plant;
  const result = await plantCollection
    .find({ plant_name: plantName })
    .project({
      image: 1,
      about: 1,
      prepare: 1,
      how: 1,
      tips: 1,
    })
    .toArray();

  // This code block brings a single plant image from the database
  const imageData = Buffer.from(result[0].image.buffer).toString("base64");

  res.render("plantepedia/plantDetail/plantInfo", {
    plantImage: imageData,
    plantAbout: result[0].about,
    plantPrepare: result[0].prepare,
    plantHow: result[0].how,
    plantTips: result[0].tips,
  });
});

// EXPLORE PAGE
app.get("/explore", sessionValidation, async (req, res) => {
  const username = req.session.username;
  const user = await userCollection.findOne({ username: username });
  // Ternary: checks if user has 'favorited' gardens or not
  const favGardens = user && user.favGardens ? user.favGardens : [];
  // TODO: may not need to send all those fields (since only garden name is used)
  const result = await gardensCollection
    .find()
    .project({
      gardenName: 1,
      address: 1,
      city: 1,
      plotsAvailable: 1,
      crops: 1,
      posts: 1,
    })
    .toArray();
  res.render("explore/explore", {
    pageName: "Explore",
    gardens: result,
    favGardens: favGardens,
  });
});

// 'Favoriting' a garden
app.post("/favGarden", async (req, res) => {
  var username = req.session.username;
  var favouritedGarden = req.body.garden;

  await userCollection.updateOne(
    { username: username },
    // $addToSet avoid duplicates
    { $addToSet: { favGardens: favouritedGarden } }
  );

  res.redirect("/explore");
});

// 'Unfavoriting a garden
app.post("/unfavGarden", async (req, res) => {
  var username = req.session.username;
  var unfavouritedGarden = req.body.garden;

  await userCollection.updateOne(
    { username: username },
    { $pull: { favGardens: unfavouritedGarden } }
  );

  res.redirect("/explore");
});

// GARDEN PAGE (coming from explore page)
app.get("/garden/:garden", sessionValidation, async (req, res) => {
  var gardenname = req.params.garden;
  const result = await gardensCollection.findOne(
    { gardenName: gardenname },
    {
      projection: {
        gardenName: 1,
        address: 1,
        city: 1,
        plotsAvailable: 1,
        crops: 1,
      },
    }
  );
  res.render("garden/garden", { pageName: "Explore", garden: result });
});

app.get("/gardenPlots/:plots", sessionValidation, async (req, res) => {
  // :plots is the gardenName
  var plotsInGarden = req.params.plots;
  const result = await gardensCollection.find({ gardenName: plotsInGarden }).project({ plots: 1 }).toArray();
  res.render("reservation/plots", { garden: plotsInGarden, creatingPlots: result[0].plots });
});

// RESERVATION FORM (reserving a plot)
 app.get("/reservationForm/:garden/:plotName", async (req, res) => {
    const gardenname = req.params.garden;
    const plotName = req.params.plotName;

    console.log("Garden name: " + gardenname);
    console.log("Plot name: " + plotName);

    const result = await gardensCollection.findOne(
        { gardenName: gardenname },
        { projection: { gardenName: 1 } }
      );

    console.log(result);
    res.render("reservation/reserveForm", {pageName: "Reserving a Plot", nameOfGarden: result.gardenName, plotName:plotName
    });
  });

// Submitting the reservation form
app.post('/submitReservation', async (req, res) => {
  var user = req.session.username;
  // I'm so sorry for being unavailble to help you brother me dumb me no logic I sincerly apolosise to you for everything
  // nono im sorry i keep breaking the codeLMAOOOO ALL GOOD BRUDA
});

// COMUNITY PAGE
app.get("/community", async (req, res) => {
  const currentUser = req.session.username;
  const result = await database
    .db(mongodb_database)
    .collection("posts")
    .find()
    .toArray();
  const gardenName = await database
    .db(mongodb_database)
    .collection("gardens")
    .find()
    .toArray();
  var gardenHeader = "all gardens";
  var posts = [];
  var descss = [];
  var user = [];
  var date = [];
  var likes = [];
  var id = [];
  for (let i = 0; i < result.length; i++) {
    //DESCRIPTION
    const descrip = result[i].desc;
    descss.push(descrip);
    //USERNAME OF POST
    const usern = result[i].username;
    user.push(usern);
    //DATE OF POST
    const dat = result[i].date;
    date.push(dat);
    //LIKES
    const likeArray = result[i].likes;
    likes.push(likeArray);
    //ID
    const postID = result[i]._id;
    id.push(postID);
    //IMAGE OF POST
    const imageData = Buffer.from(result[i].data.buffer).toString("base64");
    posts.push(imageData);
  }
  res.render("community/community", {
    pageName: "Community",
    result: result,// arrays
    posts: posts, //gives the image
    desc: descss, //gives the caption
    username: user, //gives the username of the post
    gardens: gardenName,
    gardenP: gardenHeader, //for the page name
    date: date,
    userLikes: likes, // gives array of likes with usernames
    currentUser: currentUser, //provides ejs with the current user
    postID: id, //gives the unique id of the post as a string
    postLikeRef: gardenHeader //used for liking a post and redirecting to the correct page
  });
});

//Route to a specific community garden that filters posts based on the "name" field
app.get("/community/:garden", async (req, res) => {
  const currentUser = req.session.username;
  //utilize req body param
  const garden = req.params.garden;
  //Finds all posts that have the garden's specific reference
  const result = await database
    .db(mongodb_database)
    .collection("posts")
    .find({ garden: garden })
    .toArray();

  //grabs all the garden names in the garden collection
  //CHANGE WITH THE USERS FAVORITE GARDEN ARRAY
  const gardenName = await database
    .db(mongodb_database)
    .collection("gardens")
    .find()
    .toArray();

  //Finds the garden name for the page we are currently on
  const gardenHeader = await database
    .db(mongodb_database)
    .collection("gardens")
    .findOne({ gardenRef: garden });

  //Loop that pushes all the posts variables into an array that lets us display on the page
  var posts = [];
  var descss = [];
  var user = [];
  var date = [];
  var likes = [];
  var id = [];
  for (let i = 0; i < result.length; i++) {
    //DESCRIPTION
    const descrip = result[i].desc;
    descss.push(descrip);
    //USERNAME OF POST
    const usern = result[i].username;
    user.push(usern);
    //DATE
    const dat = result[i].date;
    date.push(dat);
    //LIKES
    const likeArray = result[i].likes;
    likes.push(likeArray);
    //ID
    const postID = result[i]._id;
    id.push(postID);
    //PARSES IMAGE DATA AND DISPLAYS IT
    const imageData = Buffer.from(result[i].data.buffer).toString("base64");
    posts.push(imageData);
  }
  res.render("community/community", {
    pageName: "Community",
    result: result,//array
    posts: posts,//picture
    desc: descss,//caption
    username: user,
    date: date,
    gardens: gardenName, //provides a garden array
    gardenP: gardenHeader.gardenName, //for the page name
    userLikes: likes, //give like array of usernames
    currentUser: currentUser, //provides ejs with the current user
    postID: id, //gives the unique id of the post as a string
    postLikeRef: garden //used for liking a post and redirecting to the correct page
  });
});

//When user want to like a post
app.post("/community/favPost", async (req, res) => {
  var username = req.session.username;
  var postID = req.body.postID;
  var garden = req.body.garden;

  await database
    .db(mongodb_database)
    .collection("posts")
    .updateOne(
      { _id: new mongodb.ObjectId(postID) },
      { $addToSet: { likes: username } }
    );
  //redirect to which page according to what page the user was on
  if (garden !== 'all gardens') {
    res.redirect("/community/" + garden);
  } else {
    res.redirect("/community");
  }
});
//handles when users wants to unlike a post
app.post("/unfavPost", async (req, res) => {
  var username = req.session.username;
  var postID = req.body.postID;
  var garden = req.body.garden;

  await database.db(mongodb_database).collection("posts").updateOne(
    { _id: new mongodb.ObjectId(postID) },
    { $pull: { likes: username } }
  );
  //redirect to which page according to what page the user was on
  if (garden !== 'all gardens') {
    res.redirect("/community/" + garden);
  } else {
    res.redirect("/community");
  }
});

//routes to the new post page
app.get("/newPost", sessionValidation, async (req, res) => {
  const garden = await database
    .db(mongodb_database)
    .collection("gardens")
    .find()
    .project({ gardenName: 1 })
    .toArray();
  var gar = [];
  for (let i = 0; i < garden.length; i++) {
    gar.push(garden[i].gardenName);
  }

  res.render("newPost/newPost", {
    pageName: "Create a Post",
    garden: gar,
  });
});
//Adding a document to the post collection
app.post("/newPost/posts", upload.single("photo"), async (req, res) => {
  var key = req.body.keyword;
  var desc = req.body.description;
  var garden = req.body.garden;
  var username = req.session.username;
  var currentDate = new Date();
  var dateOnly = currentDate.toISOString().split("T")[0];
  const photoData = {
    name: req.file.originalname,
    username: username,
    desc: desc,
    garden: garden,
    filename: key,
    data: req.file.buffer,
    comments: [],
    likes: [],
    date: dateOnly,
  };
  await database.db(mongodb_database).collection("posts").insertOne(photoData);
  res.redirect("/community");
});

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
