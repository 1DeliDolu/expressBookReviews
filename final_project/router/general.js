const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body?.username;
  const password = req.body?.password;

  // username & password yoksa hata
  if (!username || !password) {
    return res.status(404).json({ message: "Unable to register user." });
  }

  // username zaten varsa hata
  // (Starter projede isValid genelde "kullanıcı yoksa true" döner.)
  if (typeof isValid === "function" && !isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }

  // isValid yoksa/başka implementasyon varsa diye ek kontrol
  const alreadyExists = users.some((u) => u.username === username);
  if (alreadyExists) {
    return res.status(404).json({ message: "User already exists!" });
  }

  // kullanıcıyı ekle
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop (Task 1)
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN (Task 2)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  }
  return res.status(404).json({ message: "Book not found" });
});

// Get book details based on author (Task 3)
public_users.get('/author/:author', function (req, res) {
  const authorParam = req.params.author;

  const isbns = Object.keys(books);
  const matches = [];

  for (const isbn of isbns) {
    const book = books[isbn];
    if (book && book.author === authorParam) {
      matches.push({ isbn, ...book });
    }
  }

  if (matches.length > 0) {
    return res.status(200).json(matches);
  }
  return res.status(404).json({ message: "No books found for the given author" });
});

// Get all books based on title (Task 4)
public_users.get('/title/:title', function (req, res) {
  const titleParam = req.params.title;

  const isbns = Object.keys(books);
  const matches = [];

  for (const isbn of isbns) {
    const book = books[isbn];
    if (book && book.title === titleParam) {
      matches.push({ isbn, ...book });
    }
  }

  if (matches.length > 0) {
    return res.status(200).json(matches);
  }
  return res.status(404).json({ message: "No books found for the given title" });
});

// Get book review (Task 5)
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews || {});
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
