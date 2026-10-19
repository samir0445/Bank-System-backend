const USER = require("../model/user.model");
const jwt = require("jsonwebtoken");

const BlackList = require("../model/blacklist.model");

async function authMiddleware(req, res, next) {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                error: null
            })
        }

        if (await BlackList.findOne({ token })) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                error: null
            })
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await USER.findById(decodedToken.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                error: null
            })
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function authSystemUserMiddleware(req, res, next) {

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
            error: null
        })
    }

    if (await BlackList.findOne({ token })) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
            error: null
        })
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await USER.findById(decoded.userId).select("+systemUser");
        if (!user || !user.systemUser) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized",
                error: null
            })
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports = { authMiddleware, authSystemUserMiddleware };