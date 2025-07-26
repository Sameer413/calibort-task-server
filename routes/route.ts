import express from "express"
import { deleteUserById, getAllUser, getUserById, updateUserById, uploadOrUpdateUserImage } from "../controller/user-controller";
import { loginUser, registerUser } from "../controller/auth-controller";
import { isAuthenticated } from "../middleware/auth-middleware";
import upload from "../middleware/multer";

const router = express.Router();

router.route('/users').get(getAllUser);

router.route('/user')
    .get(isAuthenticated, getUserById)
    .put(isAuthenticated, updateUserById)
    .delete(isAuthenticated, deleteUserById);

router.route('/sign-up').post(registerUser);

router.route('/sign-in').post(loginUser);

router.route('/upload-file').post(isAuthenticated, upload.single("file"), uploadOrUpdateUserImage)

export default router;