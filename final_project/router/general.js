const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = 'http://localhost:5000';

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
  return new Promise((resolve) => {
    resolve(books);
  });
}

async function getBooksByISBN(isbn) {
  return new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject(new Error("ISBN not found"));
    }
  });
}

async function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    const filtered = Object.values(books).filter(
      (book) => book.author.toLowerCase() === author.toLowerCase()
    );
    if (filtered.length > 0) {
      resolve(filtered);
    } else {
      reject(new Error("Author not found"));
    }
  });
}

async function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    const filtered = Object.values(books).filter(
      (book) => book.title.toLowerCase().includes(title.toLowerCase())
    );
    if (filtered.length > 0) {
      resolve(filtered);
    } else {
      reject(new Error("Title not found"));
    }
  });
}

async function getAllBooksWithAxios() {
  const response = await axios.get(`${BASE_URL}/`);
  return response.data;
}

async function getBookByISBNWithAxios(isbn) {
  const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
  return response.data;
}

async function getBooksByAuthorWithAxios(author) {
  const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
}

async function getBooksByTitleWithAxios(title) {
  const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
  return response.data;
}

module.exports.getAllBooksWithAxios = getAllBooksWithAxios;
module.exports.getBookByISBNWithAxios = getBookByISBNWithAxios;
module.exports.getBooksByAuthorWithAxios = getBooksByAuthorWithAxios;
module.exports.getBooksByTitleWithAxios = getBooksByTitleWithAxios;

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const bookList = await getBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const book = await getBooksByISBN(req.params.isbn);
    return res.status(200).send(JSON.stringify(book, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  try {
    const filtered_books = await getBooksByAuthor(req.params.author);
    return res.status(200).send(JSON.stringify(filtered_books, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  try {
    const filtered_books = await getBooksByTitle(req.params.title);
    return res.status(200).send(JSON.stringify(filtered_books, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
});

module.exports.general = public_users;
