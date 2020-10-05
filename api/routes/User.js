// ? All Order Related Routes
const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

const tokenList = {};
router.get("/test", (req, res, next) => {
  return res.status(200).json({
    message: "Test",
  });
});
//Sign Up
router.post("/signup", (req, res, next) => {
  /** Steps
   * 1. First Find Whether Email Already Exists
   * 2. If User Exists Send a Message that Email already Exists
   * 3. Else Create a New User with Email and Hashed PWD
   */

  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Email Already Exists",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
            });
            user
              .save()
              .then((result) => {
                console.log("USER", result);
                res.status(201).json({
                  message: "User Created",
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    });
});

router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth Failed",
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          console.log(err);
          return res.send(401).json({
            message: "Auth Failed",
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userID: user[0]._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h",
            }
          );
          const refreshToken = jwt.sign(
            {
              email: user[0].email,
              userID: user[0]._id,
            },
            process.env.JWT_REFRESH,
            {
              expiresIn: "2h",
            }
          );
          tokenList[refreshToken] = res;
          return res.status(200).json({
            message: "Auth Sucessfull",
            token: token,
            refreshToken: refreshToken,
          });
        }
        return res.status(401).json({
          message: "Auth Failed",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/token", (req, res) => {
  // refresh the damn token
  const postData = req.body;
  // if refresh token exists
  if (postData.refreshToken && postData.refreshToken in tokenList) {
    const user = {
      email: postData.email,
      password: postData.password,
    };
    const token = jwt.sign(user, process.env.JWT_KEY, { expiresIn: "1h" });
    const response = {
      token: token,
    };
    // update the token in the list
    tokenList[postData.refreshToken].token = token;
    res.status(200).json(response);
  } else {
    res.status(404).send("Invalid request");
  }
});

router.get("/secure", checkAuth, (req, res) => {
  // all secured routes goes here
  res.status(200).json({ message: "Secured Route" });
});

module.exports = router;
