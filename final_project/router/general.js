const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
      const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const { isbn } = req.params;
    if (!isbn) {
      return res.status(400).json({ message: "Unable to look for book." });
    }
    const book = books[isbn];
    if (book) {
      return res.send(JSON.stringify(book, null, 4));
    }
    return res.status(404).json({ message: "Book not found." });  
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const { author } = req.params
    if (!author) {
      return res.status(400).json({ message: "Unable to look for books." });
    }
    const booksByAuthor = []
    for (index in books) {
      if (books[index].author.replaceAll(' ', '').toLowerCase() === author.toLowerCase().replaceAll(' ', '')) {
        booksByAuthor.push(books[index]);
      }
    }
    if (booksByAuthor.length > 0) {
      return res.send(JSON.stringify(booksByAuthor, null, 4));
    }
    return res.status(404).json({ message: `No books were found by ${author}` });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const { title } = req.params
    if (!title) {
      return res.status(400).json({ message: "Unable to look for books." });
    }
    const booksWithTitle = [];
    for (index in books) {
      if (books[index].title.replaceAll(' ', '').toLowerCase() === title.toLowerCase().replaceAll(' ', '')) {
        booksWithTitle.push(books[index]);
      }
    }
    if (booksWithTitle.length > 0) {
      return res.send(JSON.stringify(booksWithTitle, null, 4));
    }
    return res.status(404).json({ message: `No books were found with this title ${title}` });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const { isbn } = req.params;
    if (!isbn) {
      return res.status(400).json({ message: "Unable to look for book." });
    }
    const book = books[isbn]
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }
    if (!book.review) {
      return res.status(404).json({ message: `Review for book with ISBN ${isbn} not found.` });
    }
    return res.send(JSON.stringify(book.review, null, 4));
});

module.exports.general = public_users;
