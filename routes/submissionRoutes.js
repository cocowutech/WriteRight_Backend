import express from 'express';
import OpenAI from 'openai'
import dotenv from "dotenv";
import db from '../db/db.js';
dotenv.config();

import checkIfUserLogged from '../middlewares/checkIfUserLogged.js';

const openai = new OpenAI({
    apiKey: process.env.OpenAi,
})

const router = express.Router();

router.post('/submit-paper', checkIfUserLogged, async (req,res) => {

    const { content } = req.body;

    const user = req.user;

    if (!content) {
        return res.status(400).json({ error: 'No content' });
    }

    // frontend - user info to backend 
    // select condition, if the remaining token = 0, then return,
    const dbRemaintoken = await db("users")
    .select('remaintoken')
    .where({ email: user.email,})
    .first();

    // knex return an object , status 400 is forbidden
    if (dbRemaintoken.remaintoken < 1) {
        res.status(400).json({ error: "You don't have more token for today"});
        return;
    } 

    const openAiParam = {
        messages: [
            {
                role: 'system',
                content: 'Please evaluate the TOEFL article submitted by the user and provide a score (out of 30 as full score) for the writing section based on its structure, grammar, coherence, and use of language. Only the score should be returned, without detailed feedback or comments.'
            }
            ,
            {
                role: 'user',
                content: content
            }],
        model: 'gpt-3.5-turbo'
    }

    const updateRemainingToken = await db('users')
    .where({ email: user.email,})
    .update({
        'remaintoken' : dbRemaintoken.remaintoken-1,
    })

    const updatedRemainingToken = await db("users")
    .select('remaintoken')
    .where({ email: user.email,})
    .first();

    const chatCompletion = await openai.chat.completions.create(openAiParam)

    res.send({score: chatCompletion.choices[0].message.content,remaining_token: updatedRemainingToken.remaintoken});

    // res.send({score: chatCompletion, remaining_token: updatedRemainingToken.remaintoken });
});

router.post('/improve', checkIfUserLogged, async(req,res) => {
    const { content } = req.body; 
    
    const user = req.user;

    if (!content) {
        return res.status(400).json({ error: 'No content' });
    }
    
    const dbRemaintoken = await db("users")
    .select('remaintoken')
    .where({ email: user.email,})
    .first();

    // knex return an object , status 400 is forbidden
    if (dbRemaintoken.remaintoken < 1) {
        res.status(400).json({ error: "You don't have more token for today"});
        return;
    } 

    const openAiParam = {
        messages: [
            {
                role: 'system',
                content: 'Please enhance the clarity, coherence, and overall language quality of the TOEFL article submitted by the user, while ensuring the original meaning and context are preserved. Provide feedback on grammar, vocabulary, and structure improvements.'
            },
            {
            role: 'user',
            content: content
        }],
        model: 'gpt-3.5-turbo'
    }

    const updateRemainingToken = await db('users')
    .where({ email: user.email,})
    .update({
        'remaintoken' : dbRemaintoken.remaintoken-1,
    })

    const updatedRemainingToken = await db("users")
    .select('remaintoken')
    .where({ email: user.email,})
    .first();

    const chatCompletion = await openai.chat.completions.create(openAiParam)

    res.send({content: chatCompletion.choices[0].message.content, remaining_token: updatedRemainingToken.remaintoken});
});

export default router;