const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body?.username;
  const password = req.body?.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Unable to register user." });
  }

  if (typeof isValid === "function" && !isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }

  const alreadyExists = users.some((u) => u.username === username);
  if (alreadyExists) {
    return res.status(404).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

/**
 * Task 10: Get all books – Using async/await with Axios
 * GET /
 */
public_users.get('/', async function (req, res) {
  try {
    // booksdb.js local objesini “Axios ile” göstermek için internal call
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const response = await axios.get(`${baseUrl}/internal/books`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books (async)" });
  }
});

/**
 * Internal helper endpoint: Axios'un çektiği kaynak
 * (Task 10-13 Axios kullanımını sağlamak için)
 */
public_users.get('/internal/books', function (req, res) {
  return res.status(200).json(books);
});

/**
 * Task 11: Search by ISBN – Using Promises with Axios
 * GET /isbn/:isbn
 */
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  axios
    .get(`${baseUrl}/internal/books`)
    .then((response) => {
      const allBooks = response.data;
      if (allBooks[isbn]) {
        return res.status(200).json(allBooks[isbn]);
      }
      return res.status(404).json({ message: "Book not found" });
    })
    .catch(() => {
      return res.status(500).json({ message: "Error fetching book by ISBN (promise)" });
    });
});

/**
 * Task 12: Search by Author – Using async/await with Axios
 * GET /author/:author
 */
public_users.get('/author/:author', async function (req, res) {
  const authorParam = req.params.author;
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  try {
    const response = await axios.get(`${baseUrl}/internal/books`);
    const allBooks = response.data;

    const matches = [];
    for (const isbn of Object.keys(allBooks)) {
      const book = allBooks[isbn];
      if (book && book.author === authorParam) {
        matches.push({ isbn, ...book });
      }
    }

    if (matches.length > 0) {
      return res.status(200).json(matches);
    }
    return res.status(404).json({ message: "No books found for the given author" });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author (async)" });
  }
});

/**
 * Task 13: Search by Title – Using Promises with Axios
 * GET /title/:title
 */
public_users.get('/title/:title', function (req, res) {
  const titleParam = req.params.title;
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  axios
    .get(`${baseUrl}/internal/books`)
    .then((response) => {
      const allBooks = response.data;

      const matches = [];
      for (const isbn of Object.keys(allBooks)) {
        const book = allBooks[isbn];
        if (book && book.title === titleParam) {
          matches.push({ isbn, ...book });
        }
      }

      if (matches.length > 0) {
        return res.status(200).json(matches);
      }
      return res.status(404).json({ message: "No books found for the given title" });
    })
    .catch(() => {
      return res.status(500).json({ message: "Error fetching books by title (promise)" });
    });
});

// Task 5: Get book review (rubric friendly)
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const reviews = books[isbn].reviews || {};
  if (Object.keys(reviews).length === 0) {
    return res.status(200).json({ message: "No reviews found for this book." });
  }

  return res.status(200).json(reviews);
});

module.exports.general = public_users;
