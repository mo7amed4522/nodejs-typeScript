import express, { Request, Response } from 'express';
import mysql from 'mysql2';
import routes from './routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(routes);

app.listen(process.env.PORT, () => {
    console.log(`The application is listening on port ${process.env.PORT}!`);
})