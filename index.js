require("dotenv").config(); // Configure dotenv to load in the .env file
const express = require("express");
const app = express();
const cors = require("cors");
const Post = require("./api/models/Post");
const morgan = require("morgan");
const userRoutes = require("./api/routes/User");
const productRoutes = require("./api/routes/products");
const postRoutes = require("./api/routes/Posts");

const bodyParser = require("body-parser");

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
app.use("/upload", express.static("upload"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));
app.use("/user", userRoutes);
app.use("/posts", postRoutes);
app.use("/products", productRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to a basic express App");
});

// Listen on port 5000
app.listen(port, () => {
  console.log(`Server is booming on port 5000
  Visit http://localhost:5000`);
});
