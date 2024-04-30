import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db/db.js';
import dotenv from "dotenv";
dotenv.config();

import checkIfUserLogged from '../middlewares/checkIfUserLogged.js';

const router = express.Router();

router.post('/update-profile', checkIfUserLogged, async (req, res) => {
    
    const { username , oldPassword, newPassword } = req.body;

    const { user } = req;

    if (!username && !oldPassword && !newPassword) {
        res.status(400).json({ error: "You must enter at least one field!"});
        return;
    }

    if (oldPassword && !newPassword) {
        res.status(400).json({ error: "You need to enter new password."});
        return;
    }

    if (newPassword && !oldPassword) {
        res.status(400).json({ error: "You need to enter old password."});
        return;
    }

    const dbUser = await db("users").where({ 
        email: user.email,
    }).orWhere({ 
        username: user.username,
    }).first();

    if (oldPassword && !bcrypt.compareSync(oldPassword, dbUser.password)) {
        res.status(400).json({error: "Invalid Password"});
        return;
    }

    // Check if the username already exists or not

    const checkExistingUsername = await db("users").where({
        username: username
    }).whereNot({
        username: user.username
    }).first();

    if (username && checkExistingUsername){
        res.status(400).json({ error: "The username is already taken."});
        return;
    }

    if (username) {

        const updateUsername = await db('users')
        .where({ email: user.email,})
        .orWhere({ username: user.username})
        .update({
            'username' : username
        })

        if (!updateUsername) {
            res.status(400).json({ error: "Error updating username."});
            return;
        }

    }

    if (newPassword) {

        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        const updatePassword = await db('users')
        .where({ email: user.email,})
        .orWhere({ username: user.username})
        .update({
            'password' : hashedPassword
        })

        if (!updatePassword) {
            res.status(400).json({ error: "Error updating password."});
            return;
        }

    }

    res.status(200).json({ success: "Fields updated successfully!"});

});

router.post('/profile', checkIfUserLogged, async(req,res) => {
    const user = req.user;

    const dbUser = await db("users").where({ 
        email: user.email,
    }).first();

    const userObject = {
        "id": dbUser.id,
        "email": dbUser.email,
        "username": dbUser.username,
        "remaining_tokens": dbUser.remaintoken
    }

    const jwtToken = jwt.sign(userObject, 'SECRET_KEY');

    res.json({
        "user": userObject,
        "jwt": jwtToken
    })
    
})

export default router;