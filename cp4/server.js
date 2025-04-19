const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Serve static files from the "public" folder
app.use(express.static('public'));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Home route: Display search form
app.get('/', (req, res) => {
  res.render('index');
});

// Handle form submission: Search or get a random cocktail
app.post('/search', async (req, res) => {
  const searchTerm = req.body.cocktail;
  let apiUrl = '';

  if (!searchTerm || searchTerm.trim() === '') {
    // No search term provided: fetch a random cocktail
    apiUrl = 'https://www.thecocktaildb.com/api/json/v1/1/random.php';
  } else {
    // Search for cocktails by name
    apiUrl = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchTerm)}`;
  }

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;
    if (data.drinks) {
      res.render('result', { drinks: data.drinks });
    } else {
      // No drinks found, render the result page with an empty array
      res.render('result', { drinks: [] });
    }
  } catch (error) {
    console.error(error);
    res.render('error', { error: 'Error retrieving data from the API.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
