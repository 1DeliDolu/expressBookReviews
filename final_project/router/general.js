const express = require('express');
const axios = require('axios'); // Tasks 10-13: Axios
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

// Get the book list available in the shop (Task 1 - synchronous)
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 10: Get all books using async/await with Axios
// New endpoint: GET /async
public_users.get('/async', async function (req, res) {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const response = await axios.get(`${baseUrl}/`);
    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books (async)" });
  }
});

// Task 11: Get book details by ISBN using Promises with Axios
// New endpoint: GET /async/isbn/:isbn
public_users.get('/async/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  axios
    .get(`${baseUrl}/isbn/${encodeURIComponent(isbn)}`)
    .then((response) => {
      return res.status(200).json(response.data);
    })
    .catch((error) => {
      const status = error.response?.status || 500;
      const data = error.response?.data || { message: "Error fetching book by ISBN (async)" };
      return res.status(status).json(data);
    });
});

// Task 12: Get book details by Author using async/await with Axios
// New endpoint: GET /async/author/:author
public_users.get('/async/author/:author', async function (req, res) {
  const author = req.params.author;
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  try {
    const response = await axios.get(`${baseUrl}/author/${encodeURIComponent(author)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: "Error fetching books by author (async)" };
    return res.status(status).json(data);
  }
});

// Task 13: Get book details by Title using Promises with Axios
// New endpoint: GET /async/title/:title
public_users.get('/async/title/:title', function (req, res) {
  const title = req.params.title;
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  axios
    .get(`${baseUrl}/title/${encodeURIComponent(title)}`)
    .then((response) => {
      return res.status(200).json(response.data);
    })
    .catch((error) => {
      const status = error.response?.status || 500;
      const data = error.response?.data || { message: "Error fetching books by title (async)" };
      return res.status(status).json(data);
    });
});

// Get book details based on ISBN (Task 2 - synchronous)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  }
  return res.status(404).json({ message: "Book not found" });
});

// Get book details based on author (Task 3 - synchronous)
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

// Task 13: Get book details by Title using Promises with Axios
// New endpoint: GET /async/title/:title
public_users.get('/async/title/:title', function (req, res) {
  const title = req.params.title;
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  axios
    .get(`${baseUrl}/title/${encodeURIComponent(title)}`)
    .then((response) => res.status(200).json(response.data))
    .catch((error) => {
      const status = error.response?.status || 500;
      const data = error.response?.data || { message: "Error fetching books by title (async)" };
      return res.status(status).json(data);
    });
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
