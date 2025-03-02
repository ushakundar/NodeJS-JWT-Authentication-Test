const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');

const port = 4000;
const { expressjwt: expressJwt } = require('express-jwt');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

const secretkey = 'My super secret key';
const jwtTokenAlgo = expressJwt({
    secret: secretkey,
    algorithms: ['HS256']
});

let users = [
    { id: 1, username: 'Usha', password: 'Usha@123' },
    { id: 2, username: 'Latha', password: 'Latha@123' }
];

app.post('/api/login', (req, res) => {
    console.log('Login Attempt:', req.body); 
    const { username, password } = req.body;

    for (let user of users) {
        if (username === user.username && password === user.password) {
            let token = jwt.sign({ id: user.id, username: user.username }, secretkey, { expiresIn: '3m' });
            res.json({
                success: true,
                err: null,
                token: token
            });
            return;
        }
    }
    res.status(401).json({
        success: false,
        token: null,
        err: 'Invalid Credentials! Username or password is incorrect!'
    });
});

app.get('/api/dashboard', jwtTokenAlgo, (req, res) => {
    res.json({
        success: true,
        myContent: 'Protected Content Only Logged in People can See'
    });
});

app.get('/api/settings', jwtTokenAlgo, (req, res) => {
    res.json({
        success: true,
        myContent: 'This is Settings Page'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle other routes for frontend routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Unauthorized access: Invalid token.'
        });
    } else {
        next(err);
    }
});

app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});
