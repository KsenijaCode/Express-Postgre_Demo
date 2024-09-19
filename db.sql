-- Create table for actors
CREATE TABLE actors (
    id SERIAL PRIMARY KEY,        -- Auto-incrementing primary key
    first_name VARCHAR(100) NOT NULL,  -- Actor's first name
    last_name VARCHAR(100) NOT NULL,   -- Actor's last name
    date_of_birth DATE NOT NULL,  -- Actor's date of birth
    CHECK (date_of_birth <= CURRENT_DATE)  -- Ensure date_of_birth is not in the future
);

-- Create table for movies
CREATE TABLE movies (
    id SERIAL PRIMARY KEY,        -- Auto-incrementing primary key
    title VARCHAR(100) NOT NULL,  -- Movie title
    creation_date DATE NOT NULL,  -- Movie creation date
    actor_id INT,                 -- Foreign key to actors table
    FOREIGN KEY (actor_id) REFERENCES actors(id) ON DELETE SET NULL  -- Referential integrity
);

-- Optional: Create indexes for performance optimization
CREATE INDEX idx_actors_last_name ON actors (last_name);
CREATE INDEX idx_movies_title ON movies (title);
