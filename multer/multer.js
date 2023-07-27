const multer = require('multer')
const path = require('path');



const addBanner = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/banner-images"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const editBanner = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

module.exports={
  addBannerupload: multer({ storage: addBanner }).single("image"),
  editBannerupload: multer({ storage: editBanner }).single("image"),
}
