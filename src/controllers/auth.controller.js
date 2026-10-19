const User = require('../model/user.model');
const jwt = require("jsonwebtoken");
const BlackList = require("../model/blacklist.model");


async function userRegisterController(req, res) {

    try {

        const { email, password, name } = req.body;

        // if(!email || !password || !username){
        //     res.status(400).json({
        //         success : false,
        //         message : "All fields are required",
        //         error : null
        //     })
        //     return;
        // }

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(422).json({
                status: "failed",
                message: "Email is already registered"
            });
        }

        const user = await User.create({
            email: email,
            password: password,
            name: name
        })
        //  create token

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

        res.cookie("token", token);

        await user.save();

        return res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        })





    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}

async function userLoginController(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email }).select("+password");
        if (!user) {
            return res.status(404).json({
                status: "failed",
                message: "User not found"
            });
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: "failed",
                message: "Invalid password"
            });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });
        res.cookie("token", token);
        return res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function userLogoutController(req, res) {

    try {
        const token = req.cookies.token || req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(200).json({
                message: "User logged out successfully"
            });
        }
        await BlackList.create({
            token: token
        });
        res.clearCookie("token");
        return res.status(200).json({
            message: "User logged out successfully"
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports = { userRegisterController, userLoginController, userLogoutController };
