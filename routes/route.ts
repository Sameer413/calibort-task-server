import express from "express"
import {
    deleteUserById,
    getAllUser,
    getThirdPartyUserById,
    getUserById,
    syncThirdPartyUsers,
    updateUserById,
    uploadOrUpdateUserImage
} from "../controller/user-controller";
import { loginUser, registerUser, signOut } from "../controller/auth-controller";
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

router.route('/sign-out').get(signOut);

router.route('/upload-file').post(isAuthenticated, upload.single("file"), uploadOrUpdateUserImage);

router.post('/sync-users', syncThirdPartyUsers);

router.get('/third-party-user/:id', getThirdPartyUserById);

export default router;