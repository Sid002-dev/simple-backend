require("dotenv").config(); // Configure dotenv to load in the .env file
const express = require("express");
const app = express();
const cors = require("cors");
const Post = require("./models/Post");
const mongoose = require("mongoose");

const port = 5000;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connected");
  });
// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to a basic express App");
});

app.get("/all", (req, res, next) => {
  Post.find()
    .select()
    .exec()
    .then((result) => {
      const response = {
        ...result,
      };
      console.log("Erro");
      res.status(200).json(response);
    })
    .catch((err) => console.log(err));
});


// Listen on port 5000
app.listen(port, () => {
  console.log(`Server is booming on port 5000
  Visit http://localhost:5000`);
});
