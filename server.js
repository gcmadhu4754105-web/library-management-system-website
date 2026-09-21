const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ==================== FRONTEND ====================

// Serve index.html, style.css and script.js from public folder
app.use(express.static(path.join(__dirname, "public")));

// Main page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ==================== DATABASE ====================

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }

    console.log("MySQL Connected Successfully!");
});

// ==================== BOOKS ====================

// Get all books
app.get("/api/books", (req, res) => {
    db.query("SELECT * FROM books", (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error loading books",
                error: err.message
            });
        }

        res.json(results);
    });
});

// Add book
app.post("/api/books", (req, res) => {
    const { title, author } = req.body;

    if (!title || !author) {
        return res.status(400).json({
            message: "Title and author are required"
        });
    }

    const sql = "INSERT INTO books (title, author) VALUES (?, ?)";

    db.query(sql, [title, author], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error adding book",
                error: err.message
            });
        }

        res.json({
            message: "Book added successfully",
            id: result.insertId
        });
    });
});

// ==================== STUDENTS ====================

// Get all students
app.get("/api/students", (req, res) => {
    db.query("SELECT * FROM students", (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error loading students",
                error: err.message
            });
        }

        res.json(results);
    });
});

// Add student
app.post("/api/students", (req, res) => {
    const { name, department } = req.body;

    if (!name || !department) {
        return res.status(400).json({
            message: "Name and department are required"
        });
    }

    const sql = "INSERT INTO students (name, department) VALUES (?, ?)";

    db.query(sql, [name, department], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error adding student",
                error: err.message
            });
        }

        res.json({
            message: "Student added successfully",
            id: result.insertId
        });
    });
});

// ==================== ISSUE BOOK ====================

app.post("/api/issue", (req, res) => {
    const { student_id, book_id } = req.body;

    if (!student_id || !book_id) {
        return res.status(400).json({
            message: "Student ID and Book ID are required"
        });
    }

    db.query(
        "SELECT id FROM students WHERE id = ?",
        [student_id],
        (err, students) => {
            if (err) {
                return res.status(500).json({
                    message: "Error checking student",
                    error: err.message
                });
            }

            if (students.length === 0) {
                return res.status(404).json({
                    message: "Student not found"
                });
            }

            db.query(
                "SELECT * FROM books WHERE id = ? AND available = TRUE",
                [book_id],
                (err, books) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Error checking book",
                            error: err.message
                        });
                    }

                    if (books.length === 0) {
                        return res.status(400).json({
                            message: "Book is not available"
                        });
                    }

                    const sql = `
                        INSERT INTO issued_books
                        (student_id, book_id, issue_date, status)
                        VALUES (?, ?, CURDATE(), 'Issued')
                    `;

                    db.query(
                        sql,
                        [student_id, book_id],
                        (err) => {
                            if (err) {
                                return res.status(500).json({
                                    message: "Error issuing book",
                                    error: err.message
                                });
                            }

                            db.query(
                                "UPDATE books SET available = FALSE WHERE id = ?",
                                [book_id],
                                (err) => {
                                    if (err) {
                                        return res.status(500).json({
                                            message: "Error updating book",
                                            error: err.message
                                        });
                                    }

                                    res.json({
                                        message: "Book issued successfully"
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

// ==================== RETURN BOOK ====================

app.put("/api/return/:book_id", (req, res) => {
    const bookId = req.params.book_id;

    const sql = `
        UPDATE issued_books
        SET status = 'Returned',
            return_date = CURDATE()
        WHERE book_id = ?
        AND status = 'Issued'
    `;

    db.query(sql, [bookId], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error returning book",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "No issued book found"
            });
        }

        db.query(
            "UPDATE books SET available = TRUE WHERE id = ?",
            [bookId],
            (err) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error updating book",
                        error: err.message
                    });
                }

                res.json({
                    message: "Book returned successfully"
                });
            }
        );
    });
});

// ==================== DASHBOARD ====================

app.get("/api/dashboard", (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM books) AS totalBooks,
            (SELECT COUNT(*) FROM students) AS totalStudents,
            (
                SELECT COUNT(*)
                FROM issued_books
                WHERE status = 'Issued'
            ) AS booksIssued,
            (
                SELECT COUNT(*)
                FROM books
                WHERE available = TRUE
            ) AS availableBooks
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error loading dashboard",
                error: err.message
            });
        }

        res.json(results[0]);
    });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});