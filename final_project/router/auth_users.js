const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
      const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  if(!isbn){
    return res.status(400).json({message: "Unable to look for book."});
  }
  const book = books[isbn]
  if(!book){
    return res.status(404).json({message: "Book not found."});
  }
  const username = req.session.authorization.username
  const { review } = req.query
  if(!review){
    return res.status(400).json({message: "Unable to add review."});
  }
  if(!book.review){
    book.review = {}
  }
  book.review[username] = review
  books[isbn] = book
  return res.status(200).send("Review added.");
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  if(!isbn){
    return res.status(400).json({message: "Unable to look for book."});
  }
  const book = books[isbn]
  if(!book){
    return res.status(404).json({message: "Book not found."});
  }
  const username = req.session.authorization.username
  if(books[isbn].review){
    books[isbn].review[username] = undefined
  }
  return res.status(200).send("Review deleted.");
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
