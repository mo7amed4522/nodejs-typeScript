import { Router, Request, Response } from 'express';
import bcrypt, { hash } from 'bcrypt';
import pool from '../config/db.connection';
import generateToken from '../config/token.generation';
import authenticate from '../config/authenticate.token';
var cachServer = require("express-api-cache")

const saltround = 10;
const usersRouter = Router();
var cache = cachServer.cache; 

// get API to test the working of route
usersRouter.get('/all', authenticate, cache('10 minutes'), (req: Request, res: Response) => {
    console.log('Working line 12');
    pool.getConnection(function (err : any, conn : any) {
        // check for connection error if error is true
        if (err)
        {
            console.log('Entered into error')
            console.log(err) // show error details in console
            res.send({
                success: false,
                statusCode: 500,
                message: 'Getting error during the connection'
            })

            return;
        }

        console.log('Line 31');

        // if you got a connection...
        pool.query('SELECT Id, Email, Mobile, InsertDateTimeUtc as CreatedDate FROM register', function(err : any, rows : any) {
            if(err) {
                conn.release();
                return res.send({
                    success: false,
                    statusCode: 400
                });
            }

            // for simplicity, just send the rows
            res.send({
                message: 'Success',
                statusCode: 200,
                data: rows
            });

            // CLOSE THE CONNECTION
            conn.release();
        })
    })
});

// get single user details
usersRouter.get('/details/:id', authenticate, (req: Request, res: Response) => {
    
        pool.getConnection(function (err : any, conn : any) {
            if (err)
            {
                console.log('Entered into error')
                console.log(err)
                res.send({
                    success: false,
                    statusCode: 500,
                    message: 'Getting error during the connection'
                })
    
                return;
            }
    
            console.log('The id: ' + req.params.id);
                
            // if you got a connection...
            pool.query('SELECT * FROM register WHERE id=?', [req.params.id], function(err : any, rows : any) {
                if(err) {
                    conn.release();
                    return res.send({
                        success: false,
                        statusCode: 400
                    });
                }
    
                // for simplicity, just send the rows
                res.send({
                    message: 'Success',
                    statusCode: 200,
                    data: rows
                });
    
                // CLOSE THE CONNECTION
                conn.release();
            })
        })
});

// register user
usersRouter.post('/register', (req: Request, res: Response) => {

    pool.getConnection(function (err : any, conn : any) {
        if (err)
        {
            console.log('Entered into error')
            console.log(err)
            res.send({
                success: false,
                statusCode: 500,
                message: 'Getting error during the connection'
            })

            return;
        }
        
        bcrypt.hash(req.body.password, saltround, (error: any, hash: string) =>
            {
                console.log('Entered into error6')
                if(error)
                {
                    res.send({
                        success: false,
                        statusCode: 500,
                        message: 'Getting error during the connection'
                    })

                    return;
                }
                else{
                    let sqlQuery = `call registeruser(?,?,?)`;
                    // if you got a connection...
                    conn.query(sqlQuery, [req.body.email, req.body.phone, hash], function(err : any, rows : any) {
                        if(err) {
                            conn.release();
                            console.log(err);
                            return res.send({
                                success: false,
                                statusCode: 400
                            });
                        }
                        console.log('line 100')
                        console.log(req.body)
                        // for simplicity, just send the rows
                        res.send({
                            message: 'Success',
                            statusCode: 200,
                            // data: rows
                        });
            
                        // CLOSE THE CONNECTION
                        conn.release();
                    })
                }
            })
    })
});

// user login
usersRouter.post('/login', (req: Request, res: Response) => {
    pool.getConnection(function (err : any, conn : any) {
        if (err)
        {
            console.log('Entered into error')
            console.log(err)
            res.send({
                success: false,
                statusCode: 500,
                message: 'Getting error during the connection'
            })

            return;
        }
        
        console.log('Line 132');
        console.log(req.body);
        pool.query('SELECT password FROM register WHERE email=?', [req.body.email], function(err : any, rows : any) {
            if(err) {
                conn.release();
                return res.send({
                    success: false,
                    statusCode: 400,
                    data: err
                });
            }

            console.log(rows[0].password);
            const hash = rows[0].password;
            // Load hash from your password DB.
            bcrypt.compare(req.body.password, hash, function(err, result) {
                if (err) {
                    res.send({
                        message: 'failed',
                        statusCode: 500,
                        data: err
                    });
                }

                if (result) {
                    res.send({
                        message: 'Success',
                        statusCode: 200,
                        data: {token: generateToken(req.body.email)}
                    });
                } else {
                    res.send({
                        message: 'failed',
                        statusCode: 500,
                        data: err
                    });
                }
            });

            // CLOSE THE CONNECTION
            conn.release();
        })
    })
    
});

usersRouter.post('/Id/:id/Name/:name', (req: Request, res: Response) => {
    res.send({
        data: req.body,
        params: {
            id: req.params.id,
            name: req.params.name
        }
    })
})
export default usersRouter;