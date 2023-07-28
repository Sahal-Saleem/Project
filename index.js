const mongoose=require("mongoose");
mongoose.connect("mongodb+srv://sahalsaleem2000:R9Ij2yDR3MVx3Pbb@urbanhues.pzsxifc.mongodb.net/URBANhues");
const path = require('path');
const cookieParser = require('cookie-parser');


const express = require("express");
const app = express();

// middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());

// view engine

app.set('view engine', 'ejs');

//for user routes

const userRoute = require('./routes/userRoutes');
app.use('/',userRoute);

//for admin routes

const adminRoute = require('./routes/adminRoutes');
app.use('/admin',adminRoute);



 
app.listen(3000,function(){ 
    console.log("server started...");
});
