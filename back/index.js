const express = require("express");
const session = require("express-session");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = 3000;

app.use(express.json());

app.use(
    session({
        secret: "zaokprakopkopazrkpoazokpakpokpoazkpotazkpotokpa",
        resave: false,
        saveUninitialized: true,
    })
);

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "todo",
});

app.post("/api/register", async (req, res) => {
    const { email, password, username } = req.body;

    const user = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    if (user[0].length > 0) {
        res.status(400).send("User already exists");
    } else {
        bcrypt.hash(password, 10, async (err, hashedPassword) => {
            if (err) {
                res.status(500).send("Internal server error");
                return;
            }

            const randomId = uuidv4();

            pool.query("INSERT INTO users (email, password, username, id) VALUES (?, ?, ?, ?)", [
                email,
                hashedPassword,
                username,
                randomId,
            ]).then(() => {
                req.session.userId = randomId;
                req.session.username = username;
                req.session.email = email;
                res.status(200).send(req.session);
            }).catch(() => {
                res.status(500).send("Internal server error");
            });
        })
    }
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    if (user[0].length > 0) {
        bcrypt.compare(password, user[0][0].password, (err, validPassword) => {
            if (validPassword) {
                req.session.userId = user[0][0].id;
                req.session.username = user[0][0].username;
                req.session.email = user[0][0].email;
                res.status(200).send(req.session);
            } else {
                res.status(400).send("Invalid credentials");
            }
        });
    }
});

app.get("/api/user", (req, res) => {
    if (req.session.userId) {
        res.status(200).send(req.session);
    } else {
        res.status(401).send("Unauthorized");
    }
});

app.get("/api/todos", async (req, res) => {
    if (!req.session.userId) {
        res.status(401).send("Unauthorized");
        return;
    }

    const todos = await pool.query("SELECT * FROM todos WHERE author_id = ?", [
        req.session.userId,
    ]);

    const todosWithUsername = await Promise.all(todos[0].map(async (todo) => {
        const user = await pool.query("SELECT username FROM users WHERE id = ?", [todo.author_id]);
        return {
            ...todo,
            author_username: user[0][0].username
        };
    }));

    res.status(200).send(todosWithUsername);
});

app.post("/api/todos", async (req, res) => {
    if (!req.session.userId) {
        res.status(401).send("Unauthorized");
        return;
    }

    const { title } = req.body;
    const randomId = uuidv4();
    await pool.query("INSERT INTO todos (text, author_id, completed, id, category, date) VALUES (?, ?, 0, ?, ?, ?)", [
        title,
        req.session.userId,
        randomId,
        "Todo",
        new Date().toISOString(),
    ]);

    res.status(201).send("Todo created");
});

app.delete("/api/todos/:id", async (req, res) => {
    if (!req.session.userId) {
        res.status(401).send("Unauthorized");
        return;
    }

    await pool.query("DELETE FROM todos WHERE id = ? AND author_id = ?", [
        req.params.id,
        req.session.userId,
    ]);

    const todos = await pool.query("SELECT * FROM todos WHERE author_id = ?", [
        req.session.userId,
    ]);

    res.status(200).send(todos[0]);
});

app.put("/api/todos/:id", async (req, res) => {
    if (!req.session.userId) {
        res.status(401).send("Unauthorized");
        return;
    }

    const { type } = req.body;

    if (type === "changeCategory") {
        const { category } = req.body;

        await pool.query("UPDATE todos SET category = ? WHERE id = ? AND author_id = ?", [
            category,
            req.params.id,
            req.session.userId,
        ]);

        res.status(200).send("Category changed");
        return;
    } else if (type === "markComplete") {
        const { completed } = req.body;

        await pool.query("UPDATE todos SET completed = ? WHERE id = ? AND author_id = ?", [
            completed,
            req.params.id,
            req.session.userId,
        ]);

        res.status(200).send("Todo updated");
        return;
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});