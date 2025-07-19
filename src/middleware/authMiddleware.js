const { errorResponse } = require("../lib/responseWrapper");
const jwt = require("jsonwebtoken")

const getCookieValue = (cookieHeader, key) => {
  const cookies = cookieHeader?.split(';') || [];
  for (let cookie of cookies) {
    const [k, v] = cookie.trim().split('=');
    if (k === key) return v;
  }
  return null;
};

const authenticate = (req, res, next) => {
    const token = getCookieValue(req.headers.cookie, 'token');

    if(!token) return errorResponse(res, "Unauthorized", 401)

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded
        next()
    }catch(error){
        return errorResponse(res, "Invalid token!", 401)
    }
}

module.exports = {authenticate}