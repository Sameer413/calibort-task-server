import { NextFunction, Request, Response } from "express";
import { dbClient } from "../config/db";
import { IUser } from "../types/type";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary";

export const getAllUser = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const users = await dbClient.query('SELECT name ,email, created_at FROM users');

        if (!users.rows.length) {
            return res.status(404).json({ error: 'No User exists at this moment.' });
        }


        const allUser: IUser[] = users.rows;


        return res.status(200).json({
            success: true,
            message: "User Retrieve successfully.",
            allUser,
        })


    } catch (error: any) {
        console.error('Get All User Error:', error.message);
        res.status(500).json({ error: 'Server error during querying users' });
    }
}

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            return res.status(400).json({
                success: false,
                error: "User id not provided"
            })
        }
        const dbRes = await dbClient.query('SELECT name ,email, image_url, created_at FROM users where id = $1', [req.userId]);

        if (!dbRes.rows.length) {
            return res.status(409).json({ error: 'No User exists at this moment.' });
        }
        const user: IUser = dbRes.rows[0];


        return res.status(200).json({
            success: true,
            message: "User Retrieve successfully.",
            user,
        });
    } catch (error: any) {
        console.error('GetUserById Error:', error.message);
        res.status(500).json({ error: 'Server error during querying users' });
    }
}

type IUpdateUser = {
    name: string;
    email: string;
}

export const updateUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId as string;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User id not provided"
            })
        }

        const { email, name } = req.body as IUpdateUser;

        const dbRes = await dbClient.query(
            `UPDATE users
                SET name = COALESCE($1, name),
                email = COALESCE($2, email),
            WHERE id = $3
            RETURNING *`,
            [name, email, userId]
        );

        if (dbRes.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user: IUser = dbRes.rows[0];

        return res.status(200).json({
            success: true,
            message: "User updated successfully.",
            user,
        });
    } catch (error: any) {
        console.error('UpdateUser Error:', error.message);
        res.status(500).json({ error: 'Server error during querying users' });
    }
}

export const deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId as string;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User id not provided"
            })
        }

        const dbRes = await dbClient.query(
            `DELETE FROM users where id = $1 RETURNING *`,
            [userId]
        );
        if (dbRes.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            deletedUser: dbRes.rows[0],
        });
    } catch (error: any) {
        console.error('DeleteUser Error:', error.message);
        res.status(500).json({ error: 'Server error during querying users' });
    }
}

export const uploadOrUpdateUserImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId as string;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User id not provided"
            });
        }

        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                error: "File not provided"
            });
        }

        // Check if user exists
        const existUser = await dbClient.query(
            `SELECT * FROM users WHERE id = $1`, [userId]
        );

        if (existUser.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (existUser.rows[0].file_name && existUser.rows[0].image_url) {
            try {
                const deleteResult = await deleteFromCloudinary(existUser.rows[0].file_name);
                console.log(deleteResult);

            } catch (error: any) {
                console.error('Cloudinary Upload Error:', error.message);
                return res.status(500).json({ error: 'Failed to delete image to Cloudinary' });
            }
        }

        // Upload file to Cloudinary
        let uploadResult: any;

        try {
            uploadResult = await uploadToCloudinary(file.buffer);
        } catch (uploadError: any) {
            console.error('Cloudinary Upload Error:', uploadError.message);
            return res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
        }

        const dbRes = await dbClient.query(
            `UPDATE users
                SET file_name = COALESCE($1, file_name),
                    image_url = COALESCE($2, image_url)
             WHERE id = $3
             RETURNING *`,
            [uploadResult.public_id, uploadResult.secure_url, userId]
        );

        if (dbRes.rowCount === 0) {
            return res.status(404).json({ error: 'User not found after update' });
        }

        return res.status(200).json({
            success: true,
            message: "User image uploaded/updated successfully.",
            user: dbRes.rows[0]
        });
    } catch (error: any) {
        console.error('Upload Error:', error.message);
        res.status(500).json({ error: 'Server error during uploading or updating user image' });
    }
}

export const syncThirdPartyUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data } = req.body;
        console.log("here");

        if (!data || !Array.isArray(data)) {
            return res.status(404).json({
                success: false,
                error: "Invalid user data"
            })
        }
        console.log("here1");

        for (const user of data) {
            await dbClient.query(
                `INSERT INTO third_users (id, email, first_name, last_name, avatar)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (id) DO NOTHING`,

                [user.id, user.email, user.first_name, user.last_name, user.avatar]
            )
        }
        console.log("here2");

        res.status(200).json({
            success: true,
            message: "Users saved successfully."
        })
    } catch (error: any) {
        console.error('Sync User Error:', error.message);
        res.status(500).json({ error: 'Server error during syncing the users.' });
    }
}

export const getThirdPartyUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;

        const result = await dbClient.query(
            `SELECT * FROM third_users WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user: result.rows[0]
        });

    } catch (error: any) {
        console.error('Fetch User Error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Server error while fetching user'
        });
    }
};