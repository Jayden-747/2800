// REQUIRES
const express = require("express");
const app = express();
app.use(express.json());

const fs = require("fs");

// DECLARATIONS
const port = 4000;

// SERVER

// EXPRESS STATIC PATHS
app.use("/img", express.static("./assets/img"));
app.use("/font", express.static("./assets/font"));
app.use("/components", express.static("./components"));
app.use("/pages", express.static("./pages"));
app.use("/modules", express.static("./modules"));
app.use("/landing", express.static("./pages/landing"));
app.use("/settings", express.static("./pages/settings"));

// LANDING PAGE
app.get("/", (req, res) => {
  res.send(fs.readFileSync("./pages/landing/landing.html", "utf8"));
});

// SETTINGS PAGE
app.get("/settings", (req, res) => {
  res.send(fs.readFileSync("./pages/settings/settings.html", "utf8"));
});

// PORT
app.listen(port, () => {
  console.log("app listening on port 4000");
});
