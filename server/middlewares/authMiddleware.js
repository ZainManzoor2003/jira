import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "your_secret_key"
        );

        req.user = decoded; // attach user data to request
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
