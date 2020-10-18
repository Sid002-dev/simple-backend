require("dotenv").config(); // Configure dotenv to load in the .env file

const mongoose = require("mongoose");
const Product = require("../models/Product");
var cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});
exports.products_getAll = (req, res, next) => {
  Product.find()
    .select("name price _id productImage")
    .exec()
    .then((result) => {
      const response = {
        count: result.length,
        products: result.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage.replace(/\\/g, "/"),
            _id: doc._id,
            request: {
              type: "GET",
              url: `http://localhost:3000/products/${doc._id}`,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => console.log(err));
};
exports.products_create = (req, res, next) => {
  console.log(req.file, "FILE");
  let fileNameWithoutExtension;
  if (req.file.mimetype === "image/png") {
    fileNameWithoutExtension = req.file.originalname.replace(/.png/g, "");
  } else if (req.file.mimetype === "image/jpeg") {
    fileNameWithoutExtension = req.file.originalname.replace(/.jpg/g, "");
  }
  // console.log("FILENAME EXT", fileNameWithoutExtension);
  const newProduct = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: "Name",
    price: "22",
    productImage: `http://res.cloudinary.com/sid002cloud/image/${
      process.env.FOLDER
    }/v1603037984/${req.file.path.replace(/upload\\/g, "")}`,
  });
  cloudinary.uploader.upload(
    req.file.path.replace(/\\/g, "/"),
    { public_id: fileNameWithoutExtension },
    function (error, result) {
      console.log(result, error, "CLOUDINARY");
    }
  );
  newProduct
    .save()
    .then((result) => {
      console.log(result);
      if (result) {
        res.status(201).json({
          message: "Created Product Successfully",
          createdProducts: {
            name: result.name,
            price: result.price,
            productImage: result.productImage,
            _id: result._id,
            request: {
              type: "GET",
              url: `http://localhost:3000/products/${result._id}`,
            },
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
};
exports.products_getSingleProduct = (req, res, next) => {
  const id = req.params.productID;
  Product.findById(id)
    .select("name price _id productImage")
    .exec()
    .then((document) => {
      console.log(document);
      if (document) {
        res.status(200).json({
          product: document,
          request: {
            type: "GET",
            description: "Provides a List Of All Products",
            url: `http://localhost:3000/products`,
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
      res.status(500).json({ error: err });
    });
};
exports.products_updateSingleProduct = (req, res, next) => {
  const id = req.params.productID;
  const updateOPS = {};
  //req.body is an Array
  for (const ops of req.body) {
    updateOPS[ops.propName] = ops.value;
  }
  Product.update({ _id: id }, { $set: updateOPS })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Product Updated",
        request: {
          type: "GET",
          url: `http://localhost:3000/products/${id}`,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};
exports.products_deleteSingleProduct = (req, res, next) => {
  const id = req.params.productID;
  Product.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Product Deleted",
        request: {
          type: "POST",
          url: `http://localhost:3000/products`,
          body: { name: "String", price: "Number" },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "Given ID Not Available In DB",
        error: err,
      });
    });
};
