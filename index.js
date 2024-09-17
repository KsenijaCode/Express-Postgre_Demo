const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// In-memory storage
let actors = [];
let movies = [];
let nextActorId = 1;
let nextMovieId = 1;

// Helper function to validate date
const isValidDate = (dateStr) => {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
};

const isFutureDate = (dateStr) => {
    const now = new Date();
    const inputDate = new Date(dateStr);
    return inputDate > now;
};

// CRUD for Actors

// Create an Actor
app.post('/actors', (req, res) => {
    const { firstName, lastName, dateOfBirth } = req.body;
    
    if (!firstName || !lastName || !dateOfBirth) {
        return res.status(400).json({ message: "FirstName, LastName, and DateOfBirth are required" });
    }

    if (!isValidDate(dateOfBirth) || isFutureDate(dateOfBirth)) {
        return res.status(400).json({ message: "Invalid Date of Birth. Date cannot be in the future." });
    }

    const newActor = {
        id: nextActorId++,
        firstName,
        lastName,
        dateOfBirth
    };

    actors.push(newActor);
    res.status(201).json(newActor);
});

// Get all Actors
app.get('/actors', (req, res) => {
    res.json(actors);
});

// Get an Actor by ID
app.get('/actors/:id', (req, res) => {
    const actorId = parseInt(req.params.id);
    const actor = actors.find(a => a.id === actorId);

    if (!actor) {
        return res.status(404).json({ message: "Actor not found" });
    }

    res.json(actor);
});

// Update an Actor
app.put('/actors/:id', (req, res) => {
    const actorId = parseInt(req.params.id);
    const actor = actors.find(a => a.id === actorId);

    if (!actor) {
        return res.status(404).json({ message: "Actor not found" });
    }

    const { firstName, lastName, dateOfBirth } = req.body;

    if (dateOfBirth && (isFutureDate(dateOfBirth) || !isValidDate(dateOfBirth))) {
        return res.status(400).json({ message: "Invalid Date of Birth. Date cannot be in the future." });
    }

    actor.firstName = firstName || actor.firstName;
    actor.lastName = lastName || actor.lastName;
    actor.dateOfBirth = dateOfBirth || actor.dateOfBirth;

    res.json(actor);
});

// Delete an Actor
app.delete('/actors/:id', (req, res) => {
    const actorId = parseInt(req.params.id);
    const actorIndex = actors.findIndex(a => a.id === actorId);

    if (actorIndex === -1) {
        return res.status(404).json({ message: "Actor not found" });
    }

    // Remove the actor from the array
    actors.splice(actorIndex, 1);
    res.status(204).send();
});

// CRUD for Movies

// Create a Movie
app.post('/movies', (req, res) => {
    const { title, creationDate, actorId } = req.body;

    if (!title || !creationDate || !actorId) {
        return res.status(400).json({ message: "Title, CreationDate, and ActorId are required" });
    }

    if (!isValidDate(creationDate)) {
        return res.status(400).json({ message: "Invalid Creation Date" });
    }

    const actor = actors.find(a => a.id === actorId);
    if (!actor) {
        return res.status(404).json({ message: "Actor not found" });
    }

    const newMovie = {
        id: nextMovieId++,
        title,
        creationDate,
        actor
    };

    movies.push(newMovie);
    res.status(201).json(newMovie);
});

// Get all Movies
app.get('/movies', (req, res) => {
    res.json(movies);
});

// Get a Movie by ID
app.get('/movies/:id', (req, res) => {
    const movieId = parseInt(req.params.id);
    const movie = movies.find(m => m.id === movieId);

    if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
    }

    res.json(movie);
});

// Update a Movie
app.put('/movies/:id', (req, res) => {
    const movieId = parseInt(req.params.id);
    const movie = movies.find(m => m.id === movieId);

    if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
    }

    const { title, creationDate, actorId } = req.body;

    if (creationDate && !isValidDate(creationDate)) {
        return res.status(400).json({ message: "Invalid Creation Date" });
    }

    if (actorId) {
        const actor = actors.find(a => a.id === actorId);
        if (!actor) {
            return res.status(404).json({ message: "Actor not found" });
        }
        movie.actor = actor;
    }

    movie.title = title || movie.title;
    movie.creationDate = creationDate || movie.creationDate;

    res.json(movie);
});

// Delete a Movie
app.delete('/movies/:id', (req, res) => {
    const movieId = parseInt(req.params.id);
    const movieIndex = movies.findIndex(m => m.id === movieId);

    if (movieIndex === -1) {
        return res.status(404).json({ message: "Movie not found" });
    }

    // Remove the movie from the array
    movies.splice(movieIndex, 1);
    res.status(204).send();
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});