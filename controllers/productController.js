// const Admin = require('../models/adminModel')
// const User = require('../models/userModel')
// const path = require('path');
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const productHelper = require('../helpers/productHelper')
const Review = require('../models/reviewModel')
const path = require('path');
const mongoose = require('mongoose')

// add product display

const loadProducts = async (req, res) => {
    try {
      let categories = await Category.find({});
      res.render("addProduct", { category: categories });
    } catch (error) {
      console.log(error.message);
    }
  };



const createProduct = async (req, res) => {
    const { name, description, category, price,stock } = req.body;
    const filesArray = Object.values(req.files).flat();
    const images = filesArray.map((file) => file.filename);
    let categories = await Category.find({});
    const newProduct = new Product({
      name,
      description,
      images,
      category,
      price,
      stock
    });
  
    newProduct
      .save() 
      .then(() => {
      res.render("addProduct", { message:"product added succesfully",category: categories });
        
      })
      .catch((err) => {
        console.error("Error adding product:", err);
        res.status(500).send("Error adding product to the database");
      });
  };

  


  

//   display product


const Products = async(req,res)=>{
    try {
      const product = await Product.find({})
      res.render('productList',{product:product})    
    } catch (error) {
      console.log(error.message)
    }
  }



//   unlist
  
  const unListProduct = async(req,res)=>{
    try {
      await productHelper.unListProduct(req.query.id)
        res.redirect('/admin/product')
    } catch (error) {
        console.log(error.message);
    }
  }



  const reListProduct = async(req,res)=>{
    try {
        await productHelper.reListProduct(req.query.id)
        res.redirect('/admin/product')
    } catch (error) {
        console.log(error.message);
    }
  }

//   update 

    const loadUpdateProduct = async (req, res) => {
        try {
          const id = req.query.id;
          const productData = await Product.find({ _id: id });
          const category = productData[0].category;
          const productCategory = await Category.find({ _id: category });
          const allCategory = await Category.find();
    
          res.render("updateProduct", {
            productData,
            productCategory,
            allCategory,
          });
        } catch (error) {
          console.log(error.message);
        }
      };
//    object destructuring implement
    const updateProduct = async (req, res) => {  
        try {
          const id = req.body.id;
          const name = req.body.name;
          const description = req.body.description;
          const price = req.body.price;
          const category = req.body.category;
          const stock = req.body.stock
          const status = req.body.status === "listed";
          const filesArray = Object.values(req.files).flat();
          const images = filesArray.map((file) => file.filename);
      
          // Find the existing product data
          const productData = await Product.findById(id);
      
          // Check if new images are provided
          const updatedImages = images.length > 0 ? images : productData.images;      
          const update = await Product.updateOne(
            { _id: id },
            {
              $set: {
                name: name,
                description: description,
                price: price,
                stock: stock, 
                category: category,
                is_listed: status,
                images: updatedImages
              },
            }
          );
      
          res.redirect('/admin/product')
      
        } catch (error) {
          console.log(error.message);
        }
      };
   
      const productPage = async ( req, res ) => {
        try{
            const id = req.query.id
            const product = await Product.findOne({ _id : id }).populate('category').lean().exec();
            const review = await Review.find({proId:id})
            res.render('product',{product : product, review:review})
        }
        catch(error){ 
            console.log(error); 
            res.send({ success: false, error: error.message });
     } 
    
    }
    


  module.exports = {
    loadProducts,
    Products,
    createProduct,
    // displayProduct
    reListProduct,
    unListProduct,
    loadUpdateProduct,
    updateProduct,
    productPage
   
  }