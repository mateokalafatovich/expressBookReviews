const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    // Filter the users array for any user with the same username
    let userwithsamename = users.filter((user) =>  user.username === username);

    // Return true if any user with the same username is found, otherwise false
    return userwithsamename.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => (user.username === username && user.password === password));

    // Return true if any valid user is found, otherwise false
    return validusers.length > 0; 
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({message: "Username and password required."});
    }

    if (!authenticatedUser(username, password)) {
        return res.status(400).json({message: "Invalid username or password"});
    } 

    // generate JWT token
    const token = jwt.sign({username}, "secret_key", {expiresIn: 60 * 60});
    
    // save token in session
    req.session.authorization = {
        accessToken: token,
        username
    };

    return res.status(200).json({message: "User successfully logged in"});

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    if (!review) {
        return res.status(400).json({message: "Review query parameter is required"});
    }

    const username = req.session.authorization?.username;
    if (!username) {
        return res.status(400).json({message: "Unauthorized user"});
    }

    if (!books[isbn]) {
        return res.status(400).json({message: "Book not found."});
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review successfully added/updated",
        reviews: books[isbn].reviews
    });

});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(400).json({message: "Unauthorized user"});
    }

    if (!books[isbn]) {
        return res.status(400).json({message: "Book not found."});
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(400).json({message: 'No review found for this user and book.'});
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review successfully deleted.",
        reviews: books[isbn].reviews
    });

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
