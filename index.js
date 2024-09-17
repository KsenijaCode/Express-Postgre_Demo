// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// PostgreSQL pool for database connection
const pool = new Pool({
  user: 'postgres',     // Update with your PostgreSQL username
  host: 'localhost',
  database: 'movies-db', // Update with your database name
  password: 'postgres', // Update with your password
  port: 5432,
});

// Helper function to check if date is in the future
function isFutureDate(date) {
  const today = new Date();
  return new Date(date) > today;
}

// CRUD for Actors

// Get all actors
app.get('/actors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM actors');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get an actor by ID
app.get('/actors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM actors WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Actor not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new actor
app.post('/actors', async (req, res) => {
  const { firstName, lastName, dateOfBirth } = req.body;

  if (isFutureDate(dateOfBirth)) {
    return res.status(400).json({ error: 'Date of birth cannot be in the future' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO actors (first_name, last_name, date_of_birth) VALUES ($1, $2, $3) RETURNING *',
      [firstName, lastName, dateOfBirth]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an actor
app.put('/actors/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, dateOfBirth } = req.body;

  if (isFutureDate(dateOfBirth)) {
    return res.status(400).json({ error: 'Date of birth cannot be in the future' });
  }

  try {
    const result = await pool.query(
      'UPDATE actors SET first_name = $1, last_name = $2, date_of_birth = $3 WHERE id = $4 RETURNING *',
      [firstName, lastName, dateOfBirth, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Actor not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an actor
app.delete('/actors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM actors WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Actor not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD for Movies

// Get all movies
app.get('/movies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a movie by ID
app.get('/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new movie
app.post('/movies', async (req, res) => {
  const { title, creationDate, actorId } = req.body;

  if (!actorId) {
    return res.status(400).json({ error: 'Actor ID is required' });
  }

  try {
    // Check if actor exists
    const actorResult = await pool.query('SELECT * FROM actors WHERE id = $1', [actorId]);

    if (actorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Actor not found' });
    }

    // Insert the movie
    const result = await pool.query(
      'INSERT INTO movies (title, creation_date, actor_id) VALUES ($1, $2, $3) RETURNING *',
      [title, creationDate, actorId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a movie
app.put('/movies/:id', async (req, res) => {
  const { id } = req.params;
  const { title, creationDate, actorId } = req.body;

  if (actorId) {
    // Check if actor exists
    const actorResult = await pool.query('SELECT * FROM actors WHERE id = $1', [actorId]);

    if (actorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Actor not found' });
    }
  }

  try {
    const result = await pool.query(
      'UPDATE movies SET title = $1, creation_date = $2, actor_id = $3 WHERE id = $4 RETURNING *',
      [title, creationDate, actorId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a movie
app.delete('/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM movies WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
