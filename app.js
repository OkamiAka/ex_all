const express = require("express");
require("dotenv").config();
const mysql = require("mysql2/promise");

const app = express();

app.use(express.json());

const port = 5000;

const database = mysql.createPool({
  host: process.env.DB_HOST, // address of the server
  port: process.env.DB_PORT, // port of the DB server (mysql), not to be confused with the APP_PORT !
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on ${port}`);
  }
});

const welcome = (req, res) => {
  res.send("Welcome to my favourite user list");
};
const HANDLER = (req, res) => {
  database
    .query(
      `select * from users ${
        req.query.language || req.query.city
          ? `where ${
              req.query.language ? `language='${req.query.language}'` : ""
            } ${req.query.city && req.query.language ? "and" : ""} ${
              req.query.city ? `city='${req.query.city}'` : ""
            }`
          : ""
      }`
    )
    .then(([users]) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    });
};
const user = (req, res) => {
  database
    .query("select * from users where id=?", [req.params.id])
    .then(([users]) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    });
};
const postUser = (req, res) => {
  const { title, director, year, color, duration } = req.body;

  database
    .query(
      "INSERT INTO users(title, director, year, color, duration) VALUES (?, ?, ?, ?, ?)",
      [title, director, year, color, duration]
    )
    .then(() => {
      res.send("✔");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error saving the user");
    });
};
const putUser = (req, res) => {
  const { title, director, year, color, duration } = req.body;

  database
    .query(
      "UPDATE `users` SET `title`=?,`director`=?,`year`=?,`color`=?,`duration`=? WHERE `id`=?",
      [title, director, year, color, duration, req.params.id]
    )
    .then(() => {
      res.send("✔");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error saving the user");
    });
};
const delUser = (req, res) => {
  database
    .query("DELETE FROM users WHERE id=?", [req.params.id])
    .then(() => {
      res.send("DELETE ✔");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error saving the user");
    });
};
app.get("/", welcome);

app.get("/api/users", HANDLER);
app.post("/api/users", postUser);

app.get("/api/users/:id", user);
app.put("/api/users/:id", putUser);
app.delete("/api/users/:id", delUser);

// app.get("/api/users", );
// app.get("/api/users", );
