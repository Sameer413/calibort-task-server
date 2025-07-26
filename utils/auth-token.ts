import jwt from "jsonwebtoken";

const generateToken = (payload: object): string => {
    return jwt.sign(payload, "SecretKey", { expiresIn: '5h' })
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, "SecretKey");
};

export default generateToken;