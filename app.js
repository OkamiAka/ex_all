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
  const { name, mail, mdp } = req.body;

  database
    .query("INSERT INTO users(name, mail, mdp) VALUES (?, ?, ?)", [
      name,
      mail,
      mdp,
    ])
    .then(() => {
      res.send(201);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error saving the user");
    });
};
const putUser = (req, res) => {
  const { name, mail, mdp } = req.body;

  database
    .query("UPDATE `users` SET `name`=?,`mail`=?,`mdp`=? WHERE `id`=?", [
      name,
      mail,
      mdp,
      req.params.id,
    ])
    .then(() => {
      res.send(200);
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
      res.send(200);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error saving the user");
    });
};
app.get("/", welcome);

app.get("/users", HANDLER);
app.post("/users", postUser);

app.get("/users/:id", user);
app.put("/users/:id", putUser);
app.delete("/users/:id", delUser);

// app.get("/users", );
