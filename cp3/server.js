const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" folder
app.use(express.static('public'));

// In-memory storage for posts
let posts = []; // Each post: { id, title, content, createdAt }

// Home: List all posts
app.get('/', (req, res) => {
  res.render('index', { posts });
});

// Display form to create a new post
app.get('/posts/new', (req, res) => {
  res.render('new');
});

// Handle new post creation
app.post('/posts', (req, res) => {
  const { title, content } = req.body;
  const id = Date.now().toString();
  const createdAt = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
    // Current date and time
  posts.push({ id, title, content, createdAt });  // Include createdAt
  console.log(posts);  // This logs the posts array, check the console to see the output
  res.redirect('/');
});




// Display form to edit a post
app.get('/posts/edit/:id', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) {
    return res.redirect('/');
  }
  res.render('edit', { post });
});

// Handle post updates
app.post('/posts/edit/:id', (req, res) => {
  const { title, content } = req.body;
  const post = posts.find(p => p.id === req.params.id);
  if (post) {
    post.title = title;
    post.content = content;
  }
  res.redirect('/');
});

// Handle post deletion
app.post('/posts/delete/:id', (req, res) => {
  posts = posts.filter(p => p.id !== req.params.id);
  res.redirect('/');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
