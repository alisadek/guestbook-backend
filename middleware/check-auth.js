const HttpError = require("../models/http-error");

const jwt = require("jsonwebtoken");

module.exports = (req, res ,next) => {
    try{
    const token =  req.headers.authorization.split("")[1]; //Authorization: "Bearer TOKEN"
    if(!token){
       throw new Error ("Authentication failed");
    }
    const decodedToken = jwt.verify(token, "ali_coformatique_secret");
    req.userData = {userId: decodedToken.userId, name: decodedToken.userName};
    next();    
}catch(err){
        const error= new HttpError("Authentication failed!", 401);
        return next(error);
    }

};
