const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ username }, 'access', { expiresIn: "1h" });
        
        // Guardar el token en la sesión
        req.session.authorization = { accessToken, username };

        return res.status(200).json({ message: "User successfully logged in", accessToken });
    } else {
        return res.status(401).json({ message: "Invalid login. Check username and password." });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
        const { isbn } = req.params;
        const { review } = req.body;
    
        // Verificar si el usuario está autenticado
        if (!req.session.authorization) {
            return res.status(401).json({ message: "User not authenticated" });
        }
    
        const username = req.session.authorization.username;
    
        if (!review) {
            return res.status(400).json({ message: "Review content is required" });
        }
    
        // Verificar si el libro existe
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }
    
        // Si el libro ya tiene reseñas, verificamos si el usuario ya dejó una
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }
    
        // Agregar o actualizar la reseña del usuario
        books[isbn].reviews[username] = review;
    
        return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;

    // Verificar si el usuario está autenticado
    if (!req.session.authorization) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    const username = req.session.authorization.username;

    // Verificar si el libro existe
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Verificar si el libro tiene reseñas
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review found for this user" });
    }

    // Eliminar la reseña del usuario
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
