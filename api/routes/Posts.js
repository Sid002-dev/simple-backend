// ? All Order Related Routes
const express = require("express");
const Post = require("../models/Post");
const mongoose = require("mongoose");
const checkAuth = require("../middleware/check-auth");
const router = express.Router();

router.get("/all", (req, res, next) => {
  Post.find()
    .select()
    .exec()
    .then((result) => {
      const response = [...result];
      res.status(200).json(response);
    })
    .catch((err) => console.log(err));
});

router.post("/newpost", checkAuth, (req, res) => {
  const newPost = new Post({
    _id: new mongoose.Types.ObjectId(),
    title: req.body.title,
    content: req.body.content,
  });
  newPost
    .save()
    .then((result) => {
      if (result) {
        res.status(201).json({
          message: "Post Created Sucessfully",
          postInfo: {
            title: result.title,
            content: result.content,
            dateCreated: result.dateCreated,
          },
        });
      } else {
        res.status(404).json({
          message: "No Valid Entry Found",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
