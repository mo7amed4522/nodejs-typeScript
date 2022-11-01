import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();
console.log('process.env.HOST');
console.log(process.env.USER);
console.log(process.env.DATABASE);
dotenv.config();
const pool = mysql.createPool({
    host : process.env.HOST,
    user: process.env.USER,
    password : process.env.PASSWORD,
    database : process.env.DATABASE,
    multipleStatements : true,
})
export default pool;