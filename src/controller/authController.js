const prisma = require("../lib/prisma")
const { errorResponse, successResponse } = require("../lib/responseWrapper")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const login = async(req, res) =>{
    try{
        const {email, password} = req.body
        const user = await prisma.User.findUnique({ where : {email}});
        const isValidPassword = await bcrypt.compareSync(password, user.password)
        if(!user || !isValidPassword) {
            return errorResponse(res, "Invalid credentials!", 401)
        }

        const token = jwt.sign({ userId : Number(user.id), userEmail: user.email}, process.env.JWT_SECRET, {expiresIn: '1d'})
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            domain: '.upashana.me',
            maxAge: 24 * 60 * 60 * 1000,
        })

        return successResponse(res, null, "Logged In Successfully", 201);
    }catch(error){
        console.log(error)
        return errorResponse(res, "Something went wrong!", 501)
    }
}

const logout = async(req, res) => {
    try{
        res.clearCookie('token');
        return successResponse(res, null, "Logged out successfully!", 201);
    }catch(error){
        return errorResponse(res, "Something went wrong!", 501)
    }
}

module.exports = { login, logout }