const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const {username, password} = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(404).json({message: 'Unable to register user.'});
    }

    if (isValid(username)) {
        return res.status(404).json({message: 'User already exists'});
    } else {
        users.push({'username': username, 'password': password});
        return res.status(200).json({message: 'User successfully registered.'});
    }
    
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    const formattedBooks = JSON.stringify(books, null, 4);
    return res.status(200).send(formattedBooks);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({message: 'Book not found'});
    }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author.toLowerCase();

    let matchingBooks = [];

    // Get all keys (ISBNs) from the books object
    for (let isbn in books) {
        if (books[isbn].author.toLowerCase() === author) {
            matchingBooks.push({isbn: isbn, ...books[isbn]});
        }
    }

    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    } else {
        return res.status(404).json({message: 'No books found for this author'});
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.toLowerCase();
    let matchingBooks = [];

    for (let isbn in books) {
        if (books[isbn].title.toLowerCase() === title) {
            matchingBooks.push({isbn: isbn, ...books[isbn]});
        }
    }

    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    } else {
        return res.status(404).json({message: 'No book found with this title'});
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({message: 'Book not found'});
    }
});

module.exports.general = public_users;
