const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.find(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({message: 'Username and password required.'});
    }

    const user = authenticatedUser(username, password);

    if (!user) {
        return res.status(400).json({message: 'Invalid username or password'});
    } 

    // generate JWT token
    const token = jwt.sign({username: user.username}, 'secret_key', {expiresIn: '1h'});
    
    // save token in session
    req.session.authorization = {
        token,
        username: user.username
    };

    return res.status(200).json({message: 'User successfully logged in', token});

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    if (!review) {
        return res.status(400).json({message: 'Review query parameter is required'});
    }

    const username = req.session.authorization?.username;
    if (!username) {
        return res.status(400).json({message: 'Unauthorized user'});
    }

    if (!books[isbn].reviews) {
        books[isbn].review = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: 'Review successfully added/updated',
        reviews: books[isbn].reviews
    });

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
