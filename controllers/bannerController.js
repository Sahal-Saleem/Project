const bannerHelper = require('../helpers/bannerHelper')


const bannerList = async(req,res)=>{

    try{ 
        bannerHelper.bannerListHelper().then((response)=> {
            res.render('bannerList',{banners:response})
        })  
    } 
    catch(error){
        console.log(error);
    }
}

const addBannerGet = async(req,res)=>{
    try{
        res.render('addBanner')
    }
    catch(error){
        console.log(error);
    }
}

const addBannerPost = async(req,res)=>{
    bannerHelper.addBannerHelper(req.body, req.file.filename).then(( response) => {
        if (response) {
            res.redirect("/admin/bannerList");
        } else {
            res.status(505);
        }
    });
} 

const deleteBanner = async(req,res)=>{
    bannerHelper.deleteBannerHelper(req.query.id).then(() => {
        res.redirect("/admin/bannerList")
    });
}


module.exports= {
    bannerList,
    addBannerGet,
    addBannerPost,
    deleteBanner

}