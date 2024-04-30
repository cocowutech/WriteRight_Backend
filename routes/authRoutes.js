import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db/db.js';
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post('/login',async(req,res) => {

    const { emailUsername, password } = req.body;

    const dbUser = await db("users").where({ 
        email: emailUsername,
    }).orWhere({ 
        username: emailUsername,
    }).first();

    if (!dbUser) {
        res.json({error: "Invalid Email or Username"});
        return;
    }

    if (!bcrypt.compareSync(password, dbUser.password)) {
        res.json({error: "Invalid Password"});
        return;
    }

    const userObject = {
        "id": dbUser.id,
        "email": dbUser.email,
        "username": dbUser.username,
        "remaining_tokens": dbUser.remaintoken
    }

    const jwtToken = jwt.sign(userObject, 'SECRET_KEY');

    // userObject (using this key (SECRET_KEY)) -> encrypt userObject

    res.json({
        "user": userObject,
        "jwt": jwtToken
    })
});

router.post('/register', (req, res) => {
    const { username, email, password } = req.body;
  
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    // ABCD
    
    db('users').insert({ username, email, password: hashedPassword, remaintoken: 2 })
      .then(ids => {
        res.status(201).json({ id: ids[0], username, email });
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ error: 'Your username/email is already taken!Try another one'});
      });
});

export default router;
