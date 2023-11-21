
module.exports.home = async(req,res)=> {
    console.log(req.user);
    return res.render('home', {
        user: req.user
    })
}