// REQUIRES
const express = require("express");
const app = express();
app.use(express.json());

const fs = require("fs");

// DECLARATIONS
const port = process.env.PORT || 4000;

// SERVER

// EXPRESS STATIC PATHS
app.use(express.json());
app.set("view engine", "ejs");

app.use("/img", express.static("./assets/img"));
app.use("/font", express.static("./assets/font"));
app.use("/components", express.static("./components"));
app.use("/views", express.static("./views"));
app.use("/modules", express.static("./modules"));
app.use("/landing", express.static("./views/landing"));
app.use("/settings", express.static("./views/settings"));

// LANDING PAGE
app.get("/", (req, res) => {
  res.render("landing/landing");
});

// SETTINGS PAGE
app.get("/settings", (req, res) => {
  res.render("settings/settings");
});

//COMUNITY PAGE

app.get("/community", (req, res) => {
  res.render("community/community");
});


// LOGOUT ROUTE that destroys session document in database
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// PORT
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
