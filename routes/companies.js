//Get all companies
const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async function (req, res, next) {
  try {
    const results = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: results.rows });
  } catch (err) {
    return next(err);
  }
});

//Get a single company as an object
router.get("/:code", async function (req, res, next) {
  try {
    const result = await db.query(
      `SELECT *
      FROM companies WHERE code = $1`,
      [req.params.code]
    );
    let name = result.rows[0].name;
    let code = result.rows[0].code;
    let description = result.rows[0].description;
    return res.json({ company: { code, name, description } });
  } catch (err) {
    return next(err);
  }
});
//Post route to add a company
router.post("/", async function (req, res, next) {
  try {
    const { code, name, description } = req.body;
    const result = await db.query(
      `INSERT INTO companies (code, name, description) 
    VALUES ($1, $2, $3)
    RETURNING code, name, description`,
      [code, name, description]
    );
    return res.status(201).json(result.rows);
  } catch (err) {
    return next(err);
  }
});
//Put to edit an existing company
router.patch("/:code", async function (req, res, next) {
  try {
    const { name, description } = req.body;
    const result = await db.query(
      `UPDATE companies SET  name=$1, description=$2
             WHERE code=$3
             RETURNING name, description`,
      [name, description, req.params.code]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});
//Delete to delete an existing company
router.delete("/:code", async function (req, res, next) {
  try {
    const result = await db.query("DELETE FROM companies WHERE code=$1", [
      req.params.code,
    ]);
    return res.json({ message: "Deleted" });
  } catch (err) {
    return next(err);
  }
});
module.exports = router;
