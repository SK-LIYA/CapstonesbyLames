require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const app = express();

// Fixed port declaration (only one declaration)
const port = process.env.PORT || 3001;

// Database configuration
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));


// Routes
app.get('/', async (req, res) => {
    try {
        const sort = req.query.sort || 'date_read';
        const validSorts = ['title', 'rating', 'date_read'];
        const sortBy = validSorts.includes(sort) ? sort : 'date_read';
        
        // Add direction based on sort type
        const orderDirection = sortBy === 'title' ? 'ASC' : 'DESC';

        const { rows } = await pool.query(
            `SELECT * FROM books 
            ORDER BY ${sortBy} ${orderDirection}`
        );
        
        res.render('index', { 
            books: rows, 
            sortBy,
            sortDirections: {
                title: 'A-Z',
                rating: 'Highest First',
                date_read: 'Newest First'
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/add', async (req, res) => {
    const { title, author, rating, review, date_read, isbn } = req.body;
    try {
        await pool.query(
            'INSERT INTO books (title, author, rating, review, date_read, isbn) VALUES ($1, $2, $3, $4, $5, $6)',
            [title, author, rating, review, date_read, isbn]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding book');
    }
});
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.send(`Database connection OK! Current time: ${result.rows[0].now}`);
    } catch (err) {
        res.send(`Database connection FAILED: ${err.message}`);
    }
});

app.get('/edit/:id', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
        res.render('edit', { book: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/edit/:id', async (req, res) => {
    const { title, author, rating, review, date_read, isbn } = req.body;
    try {
        await pool.query(
            'UPDATE books SET title = $1, author = $2, rating = $3, review = $4, date_read = $5, isbn = $6 WHERE id = $7',
            [title, author, rating, review, date_read, isbn, req.params.id]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating book');
    }
});

app.post('/delete/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM books WHERE id = $1', [req.params.id]);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting book');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying port ${port + 1}...`);
        app.listen(port + 1);
    } else {
        console.error('Server error:', err);
    }
});