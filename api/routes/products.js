require("dotenv").config(); // Configure dotenv to load in the .env file

/*//? Handle Product Related Routes */
const express = require("express");
const router = express.Router();
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");
const fs = require("fs");

const ProductsController = require("../controllers/products");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdir(`./${process.env.FOLDER}/`, (err) => {
      cb(null, `./${process.env.FOLDER}/`);
    });
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  //rejecr a file
  if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});
router.get("/", ProductsController.products_getAll);
router.post("/", upload.single("productImage"), ProductsController.products_create);
router.get("/:productID", ProductsController.products_getSingleProduct);
router.patch("/:productID", ProductsController.products_updateSingleProduct);
router.delete("/:productID", ProductsController.products_deleteSingleProduct);
module.exports = router;
