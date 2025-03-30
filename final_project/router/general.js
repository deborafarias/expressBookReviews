const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    const doesExist = (username) => {
        // Filter the users array for any user with the same username
        let userswithsamename = users.filter((user) => {
            return user.username === username;
        });
        // Return true if any user with the same username is found, otherwise false
        if (userswithsamename.length > 0) {
            return true;
        } else {
            return false;
        }
    }
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
public_users.get('/', async function (req, res) {
    try {
        let response = await new Promise((resolve) => {
            setTimeout(() => {
                resolve(books);
            }, 2000); // Simula una demora de 2 segundos
        });

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        
        // Simular una petición con Axios (aquí se accede directamente a books)
        const response = await new Promise((resolve, reject) => {
            setTimeout(() => {
                if (books[isbn]) {
                    resolve(books[isbn]);
                } else {
                    reject("Book not found");
                }
            }, 2000); // Simula una espera de 2 segundos
        });

        res.status(200).json(response);
    } catch (error) {
        res.status(404).json({ message: error });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author;

        // Simulación de una petición asíncrona con una Promesa
        const booksByAuthor = await new Promise((resolve, reject) => {
            setTimeout(() => {
                let bookList = [];

                // Filtrar los libros por autor
                Object.keys(books).forEach(key => {
                    if (books[key].author === author) {
                        bookList.push(books[key]);
                    }
                });

                // Verificar si se encontraron libros
                if (bookList.length > 0) {
                    resolve(bookList);
                } else {
                    reject("No books found for this author.");
                }
            }, 2000); // Simula una espera de 2 segundos
        });

        res.status(200).json({ books: booksByAuthor });
    } catch (error) {
        res.status(404).json({ message: error });
    }
});


// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title.toLowerCase();

        // Simulación de una petición asíncrona con una Promesa
        const bookByTitle = await new Promise((resolve, reject) => {
            setTimeout(() => {
                let bookFound = null;

                // Filtrar el libro por título
                Object.keys(books).forEach(key => {
                    if (books[key].title.toLowerCase() === title) {
                        bookFound = books[key];
                    }
                });

                // Verificar si encontramos el libro
                if (bookFound) {
                    resolve(bookFound);
                } else {
                    reject("No book found with this title.");
                }
            }, 2000); // Simula una espera de 2 segundos
        });

        res.status(200).json({ book: bookByTitle });
    } catch (error) {
        res.status(404).json({ message: error });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    // Verificar si el libro con el ISBN existe en la base de datos
    if (books[isbn]) {
        const reviews = books[isbn].reviews || {}; // Obtener las reseñas, si existen
        return res.status(200).json({ reviews });
    } else {
        return res.status(404).json({ message: "Book not found." });
    }
});

module.exports.general = public_users;
