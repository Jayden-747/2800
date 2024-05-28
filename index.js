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
const google_maps_api = process.env.GOOGLE_MAPS_API_KEY

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
const expireTime = 23 * 60 * 60 * 1000;

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
app.use("/reservedPlot", express.static("./views/reservedPlot"));
// ↓ Unknown code
app.use("/reservationForm", express.static("./views/reservation")); // ← Noodle code
// ↑ Pasta code

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
app.get("/", async (req, res) => {
  if (req.session.authenticated) {
    const username = req.session.username;
    const user = await userCollection.findOne({ username: username });
    const gardenName = await database
      .db(mongodb_database)
      .collection("gardens")
      .find()
      .toArray();

    // Ternary: checks if user has 'favorited' gardens or not
    const favGardens = user && user.favGardens ? user.favGardens : [];

    // Query the gardens collection for documents with gardenName in favGardens
    const gardenDocs = await database
      .db(mongodb_database)
      .collection("gardens")
      .find({
        gardenName: { $in: favGardens },
      })
      .toArray();

    //CHATGPT USED gives a function that maps gardenName to gardenRef
    const gardenMap = gardenDocs.reduce((acc, doc) => {
      acc[doc.gardenName] = doc;
      return acc;
    }, {});
    
    // Orders the gardenRefs based on the order of favGardens
    const gardenRef = favGardens.map((gardenName) => gardenMap[gardenName].gardenRef);
    var backImage = [];
    
    for(i=0; i < gardenRef.length; i++){
      // Find the document with the corresponding gardenRef
      const gardenDoc = gardenDocs.find(doc => doc.gardenRef === gardenRef[i]);
          //PARSES IMAGE DATA AND DISPLAYS IT
    const imageData = Buffer.from(gardenDoc.photo.buffer).toString("base64");
    backImage.push(imageData);
    }
    res.render("home/home", {
      username: username,
      favGardens: favGardens,
      gardens: gardenName,
      gardenRef: gardenRef,
      image: backImage
    });
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
    // console.log(validationResult.error);
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
  // console.log("user submitted" + result);
  req.session.authenticated = true;
  req.session.username = result[0].username;
  req.session.email = result[0].email;
  req.session.cookie.maxAge = expireTime;
  res.redirect("/");
  // console.log(username);
  // console.log(email);
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
    // console.log(validationResult.error);
    res.redirect("/login");
    return;
  }
  const result = await userCollection
    .find({ email: email })
    .project({ email: 1, password: 1, _id: 1, username: 1 })
    .toArray();

  if (result.length != 1) {
    res.redirect("/login");
    // console.log("no email");
    return;
  }

  if (await bcrypt.compare(password, result[0].password)) {
    req.session.authenticated = true;
    req.session.username = result[0].username;
    req.session.email = email;
    req.session.cookie.maxAge = expireTime;
    res.redirect("/");
    // console.log("logged in");
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

app.get("/profile", sessionValidation, async (req, res) => {
  var username = req.session.username;
  var name = req.session.name;
  var email = req.session.email;

  const result = await userCollection.findOne(
    { email: email },
    { projection: { username: 1, name: 1, email: 1 } }
  );

  const posts = await database
    .db(mongodb_database)
    .collection("posts")
    .find({ username: username })
    .toArray();
  const likeRef = "profile";
  const date = [];
  const likes = [];
  const id = [];
  const description = [];
  const image = [];
  for (i = 0; i < posts.length; i++) {
    //DESCRIPTION
    const descrip = posts[i].desc;
    description.push(descrip);
    //DATE OF POST
    const dat = posts[i].date;
    date.push(dat);
    //LIKES
    const likeArray = posts[i].likes;
    likes.push(likeArray);
    //ID
    const postID = posts[i]._id;
    id.push(postID);
    //IMAGES
    const imageData = Buffer.from(posts[i].data.buffer).toString("base64");
    image.push(imageData);
  }

  res.render("profile/profile", {
    user: result,
    posts: posts,
    image: image,
    date: date,
    likes: likes,
    postID: id,
    currentUser: username,
    desc: description,
    likeRef: likeRef,
  });
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
    // console.log("Photo saved perfectly");
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
        photo: 1,
      },
    }
  );
  
  const imageData = Buffer.from(result.photo.buffer).toString("base64");
  
  res.render("garden/garden", { pageName: "Explore", garden: result, image: imageData });
});

// PLOT PAGE (Displaying plots for certain gardens)
app.get("/gardenPlots/:plots", sessionValidation, async (req, res) => {
  // :plots is the gardenName
  var plotsInGarden = req.params.plots;
  const result = await gardensCollection
    .find({ gardenName: plotsInGarden })
    .project({ plots: 1 })
    .toArray();
  res.render("reservation/plots", {
    garden: plotsInGarden,
    creatingPlots: result[0].plots,
  });
});

// RESERVATION FORM (reserving a plot)
app.get("/reservationForm/:garden/:plotName", async (req, res) => {
  const gardenname = req.params.garden;
  var user = req.session.username;
  var plotname = req.params.plotName;

  // querying user's info
  const userResult = await userCollection.findOne(
    { username: user },
    { projection: { username: 1, name: 1, email: 1 } }
  );

  // querying garden's info
  const gardenResult = await gardensCollection.findOne(
    { gardenName: gardenname },
    { projection: { gardenName: 1 } }
  );

  res.render("reservation/reserveForm", {
    pageName: "Reserving a Plot",
    nameOfGarden: gardenResult.gardenName,
    plotName: plotname,
    user: userResult,
  });
});

// Submitting the reservation form
app.post("/reservationForm/submitReservation", async (req, res) => {
  const { reservationStartDate, reservationEndDate, reservationName, reservationEmail, gardenName, plotName } = req.body;
  const startDate = new Date(reservationStartDate);
  const endDate = new Date(reservationEndDate);

  /**
  * I got an idea of using 'toISOString()' by performing serach on ChatGPT 4.O
  * 
  * @author https://chatgpt.com/?model=gpt-4o&oai-dm=1
  */
  const reformatStartDate = startDate.toISOString().split('T')[0];
  const reformatEndDate = endDate.toISOString().split('T')[0];

  // console.log(reformatStartDate);
  // console.log(reservationEmail);

  const updateAvailability = await gardensCollection.findOneAndUpdate(
    {
      gardenName: gardenName,
      "plots.plotName": plotName
      // "plots.$.plotName": plotName
    }, 
      { 
        $set: {
          "plots.$.availability": "Unavailable", 
          "plots.$.startingDate": reformatStartDate, 
          "plots.$.endingData": reformatEndDate, 
          "plots.$.reserveeName": reservationName, 
          "plots.$.email": reservationEmail
          // email: reservationEmail
        }
      },
        { 
          returnOriginal: false
          // returnNewDocument: true   
  });
  // console.log(gardenName);
  // console.log(updateAvailability);
  res.render("reservation/afterSubmit", { garden: gardenName, startDate: reformatStartDate, endDate: reformatEndDate, reserveeName: reservationName, plotName: plotName });

  // I'm so sorry for being unavailble to help you brother me dumb me no logic I sincerly apolosise to you for everything
  // nono im sorry i keep breaking the codeLMAOOOO ALL GOOD BRUDA

  // * Update the number of available plots ('plotsAvailable') in garden collection
  const garden = req.body.gardenName;
  // console.log("garden name: " + garden);

  // Queries a list of plots of the specified garden
  const allPlots = await gardensCollection
    .find({ gardenName: garden })
    .project({ plots: 1 })
    .toArray();
  // console.log("array of ALL plots in garden " + garden + ": " + allPlots[0].plots);

  // Filters the plots by availabilty
  const availPlotsOnly = allPlots[0].plots.filter(plot => plot.availability === "Available");
  // console.log("array of avail plots: " + availPlotsOnly);
  // console.log("length of available plots: " + availPlotsOnly.length);

  // Set this garden's plotsAvailable fieldset to updated list of available plots (availPlotsOnly array)
  const updatePlotsAvail = await gardensCollection
    .findOneAndUpdate({ gardenName: garden},
      {$set: {plotsAvailable: availPlotsOnly.length}}
    );
});

// After submission for reserving plot PAGE
app.get("/afterSubmit", sessionValidation, async (req, res) => {
  
  // console.log("Reservee Info: " + reserveeInfo);
  res.render("reservation/afterSubmit");
});

//! Add sessionValidation lata
app.get("/reservation", async (req,res) => {
  const userEmail = req.session.email;
  const emailArray = [];

  const result = await gardensCollection.find({ gardenName: "Elmo's Garden", "plots.email": userEmail }).project().toArray();
  console.log("What is your output?", result[0]);
  // if(plots.email === userEamil) {
  //   console.log("ya grabbing?");
  // }
  result.forEach(singleGarden => {
    singleGarden.plots.forEach(singlePlot => {
      if (singlePlot.email === userEmail) {
        emailArray.push({ gardenName: singleGarden.gardenName, ...singlePlot });
      }
    });
    console.log(emailArray);
    res.render("reservedPlot/cancelReso");
  });
});

// COMUNITY PAGE that shows all posts
app.get("/community", sessionValidation, async (req, res) => {
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
  //Loop that pushes all the posts variables into an array that lets us display on the page
  var posts = [];
  var descss = [];
  var user = [];
  var date = [];
  var likes = [];
  var id = [];
  var commentsUser = [];
  var comments = [];
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
    //commentsUser
    const comUser = result[i].commentsUser
    commentsUser.push(comUser);
    //comments
    const comm = result[i].comments
    comments.push(comm);
    //IMAGE OF POST
    const imageData = Buffer.from(result[i].data.buffer).toString("base64");
    posts.push(imageData);

  }

  
  
  res.render("community/community", {
    pageName: "Community",
    result: result, // arrays
    posts: posts, //gives the image
    desc: descss, //gives the caption
    username: user, //gives the username of the post
    gardens: gardenName,
    gardenP: gardenHeader, //for the page name
    date: date,
    userLikes: likes, // gives array of likes with usernames
    currentUser: currentUser, //provides ejs with the current user
    postID: id, //gives the unique id of the post as a string
    postLikeRef: gardenHeader, //used for liking a post and redirecting to the correct page
    commentsUser: commentsUser,
    comments: comments,
  });
});

//Route to a specific community garden that filters posts based on the "name" field; similar to community route
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
  var commentsUser = [];
  var comments = [];
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
    //commentsUser
    const comUser = result[i].commentsUser
    commentsUser.push(comUser);
    //comments
    const comm = result[i].comments
    comments.push(comm);
    //PARSES IMAGE DATA AND DISPLAYS IT
    const imageData = Buffer.from(result[i].data.buffer).toString("base64");
    posts.push(imageData);
  }
  res.render("community/community", {
    pageName: "Community",
    result: result, //array
    posts: posts, //picture
    desc: descss, //caption
    username: user, //username of the poster
    date: date, // date of the post
    gardens: gardenName, //provides a garden array
    gardenP: gardenHeader.gardenName, //for the page name
    userLikes: likes, //give like array of usernames
    currentUser: currentUser, //provides ejs with the current user
    postID: id, //gives the unique id of the post as a string
    postLikeRef: garden, //used for liking a post and redirecting to the correct page
    commentsUser: commentsUser,//gives array of usernames that have commented on the post
    comments: comments,// gives an array of users' comments on a post
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
  if (garden !== "all gardens") {
    res.redirect("/community/" + garden);
  } else {
    res.redirect("/community");
  }
});
//handles when users wants to unlike a post
app.post("/community/unfavPost", async (req, res) => {
  var username = req.session.username;
  var postID = req.body.postID;
  var garden = req.body.garden;

  await database
    .db(mongodb_database)
    .collection("posts")
    .updateOne(
      { _id: new mongodb.ObjectId(postID) },
      { $pull: { likes: username } }
    );
  //redirect to which page according to what page the user was on
  if (garden !== "all gardens") {
    res.redirect("/community/" + garden);
  } else {
    res.redirect("/community");
  }
});

// post route when user comments on a post
// sorts through the database for the post id and enters the user's username and
// comment into arrays
app.post("/community/submitComment", async (req, res) => {
  var comment = req.body.comment;
  var username = req.session.username;
  var postID = new mongodb.ObjectId(req.body.postID);
  var garden = req.body.garden;
  await database
    .db(mongodb_database)
    .collection("posts")
    .updateOne(
      { _id: postID },
      { $push: { comments: comment } }
    );
  await database
    .db(mongodb_database)
    .collection("posts")
    .updateOne(
      { _id: postID },
      { $push: { commentsUser: username } }
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
    commentsUser: []
  };
  
  await database.db(mongodb_database).collection("gardens").updateOne({gardenName: "Elizabeth Garden"}, {$set: {photo: req.file.buffer}});
  res.redirect("/community");
});

// LOGOUT ROUTE
// Destroys session in database
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

//Catches routes that don't exist 404
app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

// PORT
app.listen(port, () => {
  // console.log(`app listening on port ${port}`);
});
