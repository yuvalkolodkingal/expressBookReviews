const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const bookAdapter = (data) => async () => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {}
});

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username, password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    }
    return res.status(404).json({ message: "User already exists!" });
  }

  return res.status(404).json({ message: "Unable to register user." });
});

async function getBooks() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const response = await axios.get('http://localhost:5000/', { adapter: bookAdapter(books) });
  return response.data;
}

async function getBooksByISBN(isbn) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (!books[isbn]) {
    throw new Error('ISBN not found');
  }
  const response = await axios.get(`http://localhost:5000/isbn/${isbn}`, {
    adapter: bookAdapter(books[isbn])
  });
  return response.data;
}

async function getBooksByAuthor(author) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const filtered = Object.values(books).filter(
    (book) => book.author.toLowerCase() === author.toLowerCase()
  );
  if (filtered.length === 0) {
    throw new Error('Author not found');
  }
  const response = await axios.get(`http://localhost:5000/author/${author}`, {
    adapter: bookAdapter(filtered)
  });
  return response.data;
}

async function getBooksByTitle(title) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const filtered = Object.values(books).filter(
    (book) => book.title.toLowerCase().includes(title.toLowerCase())
  );
  if (filtered.length === 0) {
    throw new Error('Title not found');
  }
  const response = await axios.get(`http://localhost:5000/title/${title}`, {
    adapter: bookAdapter(filtered)
  });
  return response.data;
}

public_users.get('/', async (req, res) => {
  try {
    const bookList = await getBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const book = await getBooksByISBN(req.params.isbn);
    return res.status(200).send(JSON.stringify(book, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

public_users.get('/author/:author', async (req, res) => {
  try {
    const filtered_books = await getBooksByAuthor(req.params.author);
    return res.status(200).send(JSON.stringify(filtered_books, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

public_users.get('/title/:title', async (req, res) => {
  try {
    const filtered_books = await getBooksByTitle(req.params.title);
    return res.status(200).send(JSON.stringify(filtered_books, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
module.exports.getBooks = getBooks;
module.exports.getBooksByISBN = getBooksByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
