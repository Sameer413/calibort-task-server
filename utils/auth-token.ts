require("dotenv").config();
import jwt from "jsonwebtoken";

const generateToken = (payload: object): string => {
    return jwt.sign(payload, process.env.SECRET_KEY!, { expiresIn: '5h' })
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, process.env.SECRET_KEY!);
};

export default generateToken;