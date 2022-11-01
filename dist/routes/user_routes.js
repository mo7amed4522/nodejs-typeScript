"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_connection_1 = __importDefault(require("../config/db.connection"));
const token_generation_1 = __importDefault(require("../config/token.generation"));
const authenticate_token_1 = __importDefault(require("../config/authenticate.token"));
var cachServer = require("express-api-cache");
const saltround = 10;
const usersRouter = (0, express_1.Router)();
var cache = cachServer.cache;
// get API to test the working of route
usersRouter.get('/all', authenticate_token_1.default, cache('10 minutes'), (req, res) => {
    console.log('Working line 12');
    db_connection_1.default.getConnection(function (err, conn) {
        // check for connection error if error is true
        if (err) {
            console.log('Entered into error');
            console.log(err); // show error details in console
            res.send({
                success: false,
                statusCode: 500,
                message: 'Getting error during the connection'
            });
            return;
        }
        console.log('Line 31');
        // if you got a connection...
        db_connection_1.default.query('SELECT Id, Email, Mobile, InsertDateTimeUtc as CreatedDate FROM register', function (err, rows) {
            if (err) {
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
        });
    });
});
// get single user details
usersRouter.get('/details/:id', authenticate_token_1.default, (req, res) => {
    db_connection_1.default.getConnection(function (err, conn) {
        if (err) {
            console.log('Entered into error');
            console.log(err);
            res.send({
                success: false,
                statusCode: 500,
                message: 'Getting error during the connection'
            });
            return;
        }
        console.log('The id: ' + req.params.id);
        // if you got a connection...
        db_connection_1.default.query('SELECT * FROM register WHERE id=?', [req.params.id], function (err, rows) {
            if (err) {
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
        });
    });
});
// register user
usersRouter.post('/register', (req, res) => {
    db_connection_1.default.getConnection(function (err, conn) {
        if (err) {
            console.log('Entered into error');
            console.log(err);
            res.send({
                success: false,
                statusCode: 500,
                message: 'Getting error during the connection'
            });
            return;
        }
        bcrypt_1.default.hash(req.body.password, saltround, (error, hash) => {
            console.log('Entered into error6');
            if (error) {
                res.send({
                    success: false,
                    statusCode: 500,
                    message: 'Getting error during the connection'
                });
                return;
            }
            else {
                let sqlQuery = `call registeruser(?,?,?)`;
                // if you got a connection...
                conn.query(sqlQuery, [req.body.email, req.body.phone, hash], function (err, rows) {
                    if (err) {
                        conn.release();
                        console.log(err);
                        return res.send({
                            success: false,
                            statusCode: 400
                        });
                    }
                    console.log('line 100');
                    console.log(req.body);
                    // for simplicity, just send the rows
                    res.send({
                        message: 'Success',
                        statusCode: 200,
                        // data: rows
                    });
                    // CLOSE THE CONNECTION
                    conn.release();
                });
            }
        });
    });
});
// user login
usersRouter.post('/login', (req, res) => {
    db_connection_1.default.getConnection(function (err, conn) {
        if (err) {
            console.log('Entered into error');
            console.log(err);
            res.send({
                success: false,
                statusCode: 500,
                message: 'Getting error during the connection'
            });
            return;
        }
        console.log('Line 132');
        console.log(req.body);
        db_connection_1.default.query('SELECT password FROM register WHERE email=?', [req.body.email], function (err, rows) {
            if (err) {
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
            bcrypt_1.default.compare(req.body.password, hash, function (err, result) {
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
                        data: { token: (0, token_generation_1.default)(req.body.email) }
                    });
                }
                else {
                    res.send({
                        message: 'failed',
                        statusCode: 500,
                        data: err
                    });
                }
            });
            // CLOSE THE CONNECTION
            conn.release();
        });
    });
});
usersRouter.post('/Id/:id/Name/:name', (req, res) => {
    res.send({
        data: req.body,
        params: {
            id: req.params.id,
            name: req.params.name
        }
    });
});
exports.default = usersRouter;
