import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';

const app = express();

app.use(express.json())
app.use(cors())

// Use routes
app.use(authRoutes);
app.use(profileRoutes);
app.use(submissionRoutes);

app.get('/',(req,res)=> {
    res.json("Hello World");
})

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
})
