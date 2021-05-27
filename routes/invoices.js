const express = require("express");
const router = express.Router();
const db = require("../db");

//Get all invoices
router.get("/", async function (req, res, next) {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoices: results.rows });
  } catch (e) {
    return next(e);
  }
});

//Get specific invoice

//Post to add an invoice

//Put to update an invoice

//Delete to delete an invoice

module.exports = router;
