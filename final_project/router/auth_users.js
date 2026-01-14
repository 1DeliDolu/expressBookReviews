const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { // returns boolean
  // "valid" = username daha önce kayıtlı değilse true
  return !users.some((u) => u.username === username);
};


const authenticatedUser = (username, password) => { // returns boolean
  return users.some((u) => u.username === username && u.password === password);
};


regd_users.post("/login", (req, res) => {
  const username = req.body?.username;
  const password = req.body?.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT access token (1 hour)
    const accessToken = jwt.sign(
      { data: password },
      "access",
      { expiresIn: 60 * 60 }
    );

    // Store access token and username in session
    req.session.authorization = { accessToken, username };

    return res.status(200).send("User successfully logged in");
  }

  return res.status(208).json({ message: "Invalid Login. Check username and password" });
});



// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  // review query zorunlu
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Kitap var mı?
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Session’dan username al
  const username = req.session?.authorization?.username;
  if (!username) {
    // Normalde index.js auth middleware bunu zaten engeller; yine de güvenli kontrol
    return res.status(403).json({ message: "User not logged in" });
  }

  // reviews objesi yoksa oluştur
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Aynı kullanıcı aynı ISBN için yeniden review atarsa overwrite ederek günceller
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    isbn,
    reviews: books[isbn].reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Session’dan username al
  const username = req.session?.authorization?.username;
  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  // Kitap var mı?
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Review var mı?
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  // Sadece bu kullanıcıya ait review silinir
  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    isbn,
    reviews: books[isbn].reviews
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
