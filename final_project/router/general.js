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
public_users.get('/', async function (req, res) {
    try {
        const getBooks = () => {
            return new Promise((resolve, reject) => {
                resolve(books);
            });
        };
        const allBooks = await getBooks();
        return res.status(200).send(JSON.stringify(allBooks, null, 4));
    } catch (error) {
        return res.status(500).json({message: 'Error fetching books.'});
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const getBookByISBN = new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject('Book not found');
        }
    });

    getBookByISBN
        .then((book) => res.status(200).json(book))
        .catch((error) => res.status(404).json({message: error}));
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author.toLowerCase();

    const getBooksByAuthor = () => {
        return new Promise((resolve) => {
            let matchingBooks = [];
            for (let isbn in books) {
                if (books[isbn].author.toLowerCase() === author) {
                    matchingBooks.push({isbn: isbn, ...books[isbn]});
                }
            }
            resolve(matchingBooks);
        });
    };
    try {
        const booksByAuthor = await getBooksByAuthor();
        if (booksByAuthor.length > 0) {
            return res.status(200).json(booksByAuthor);
        } else {
            return res.status(404).json({message: 'No books found for this author.'});
        }
    } catch (error) {
        return res.status(500).json({message: 'Server error'});
    }

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.toLowerCase();
    const getBooksByTitle = new Promise((resolve) => {
        let matchingBooks = [];
        for (let isbn in books) {
            if (books[isbn].title.toLowerCase() === title) {
                matchingBooks.push({isbn: isbn, ...books[isbn]});
            }
        }
        resolve(matchingBooks);
    });
    
    getBooksByTitle
        .then((matchingBooks) => {
            if (matchingBooks.length > 0) {
                return res.status(200).json(matchingBooks);
            } else {
                return res.status(404).json({message: 'No book found with this title'});
            }
        })
        .catch(() => {
            res.status(500).json({message: 'Error fetching books by title.'});
        });

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
