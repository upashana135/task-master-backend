const { successResponse, errorResponse } = require("../lib/responseWrapper")
const prisma = require("../lib/prisma")
const bcrypt = require("bcrypt")
const saltRound = 10;

const registration = async(req, res) =>{
    try{
        const {name, email, password} = req.body;
        if (!name || !email || !password) {
            return errorResponse(res, "All fields are required", 400);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return errorResponse(res, "Invalid email format", 400);
        }
        if (password.length < 6) {
            return errorResponse(res, "Password must be at least 6 characters", 400);
        }
        const existingUser = await prisma.User.findUnique({ where: { email } });
        if (existingUser) {
            return errorResponse(res, "Email already in use", 409);
        }
        const hashedPassword = bcrypt.hashSync(password, saltRound);
        const newUser = await prisma.User.create({
            data: {
                name, 
                email,
                password: hashedPassword
            }
        })
        return successResponse(res, newUser, "User Created Successfully", 201);
    }catch(error){
        return errorResponse(res, "Something went wrong!", 500);
    }
}

const getUserById = async(req, res) => {
    try{
        const userId = Number(req.params.id)
        const user = await prisma.User.findFirst({
            where : {id : userId},
            select: {
                id: true, 
                email: true,
                name: true,
                address: true,
                role: true,
                bio: true,
                mobile_no: true
            }
        })
        return successResponse(res, user, "Successful", 201)
    }catch(error){
        return errorResponse(res, "Something went wrong!", 500);
    }
}

const updateUserById = async(req, res) => {
    try{
        const userId = Number(req.params.id)
        const {name, address, mobile_no, role, bio} = req.body

        const errors = [];

        if (name && typeof name !== 'string') errors.push("Name must be a string");
        if (address && typeof address !== 'string') errors.push("Address must be a string");
        if (mobile_no && !/^\d{10}$/.test(mobile_no)) errors.push("Mobile number must be 10 digits");
        if (role && typeof role !== 'string') errors.push("Role must be a string");
        if (bio && typeof bio !== 'string') errors.push("Bio must be a string");

        if (errors.length > 0) {
            return errorResponse(res, errors[0], 400); // Return first validation error
        }

        await prisma.User.update({
            where : {email: req.user.userEmail},
            data:{
                ...(name && {name}), 
                ...(address && {address}), 
                ...(mobile_no && {mobile_no}), 
                ...(role && {role}), 
                ...(bio && {bio}), 
            }
        })
        return successResponse(res, null, "Profile updated successfully!", 201)
    }catch(error){
        return errorResponse(res, "Something went wrong!", 500);
    }
}

const getAllUsers = async(req, res) =>{
    try{
        const userId = req.user.userId
        const users = await prisma.User.findMany({
            where: {
                NOT: {
                    id: userId
                }
            },
            select:{
                id: true,
                name: true, 
                email: true
            }
        })
        return successResponse(res, users, "Successful!", 201)
    }
    catch(error){
        return errorResponse(res, "Something went wrong!", 500);
    }
}

module.exports = {registration, getUserById, updateUserById, getAllUsers}