CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    date_read DATE DEFAULT CURRENT_DATE,
    isbn VARCHAR(13)
);