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
router.get("/:id", async function (req, res, next) {
  try {
    const result_invoice = await db.query(
      `SELECT *
          FROM invoices WHERE id = $1`,
      [req.params.id]
    );
    const result_company = await db.query(
      `SELECT *
            FROM companies WHERE code = $1`,
      [result_invoice.rows[0].comp_code]
    );
    let company = result_company.rows[0];
    return res.json({ invoice: result_invoice.rows, company: company });
  } catch (err) {
    return next(err);
  }
});

//Post to add an invoice
router.post("/", async function (req, res, next) {
  try {
    const { id, comp_code, amt, paid, add_date, paid_date } = req.body;
    const result = await db.query(
      `INSERT INTO invoices (id, comp_code, amt, paid, add_date, paid_date) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [id, comp_code, amt, paid, add_date, paid_date]
    );
    return res.status(201).json(result.rows);
  } catch (err) {
    return next(err);
  }
});

//Put to update an invoice
router.put("/:id", async function (req, res, next) {
  try {
    const { amt, paid } = req.body;
    let id = req.params.id;
    let paidDate = null;

    const currResult = await db.query(
      `SELECT paid FROM invoices WHERE id = $1`,
      [id]
    );

    if (currResult.rows.length === 0) {
      throw new EXpreeError(`No such voice: ${id}`, 404);
    }

    const currPaidDate = currResult.rows[0].paid_date;

    if (!currPaidDate && paid) {
      paidDate = new Date();
    } else if (!paid) {
      paidDate = null;
    } else {
      paidDate = currPaidDate;
    }

    const result = await db.query(
      `Update invoices SET amt=$1, paid=$2, paid_date=$3
        WHERE id = $4
        RETURNING id, comp_code, amy, paid, add_date, paid_date
      `,
      [amt, paid, paidDate, id]
    );
    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

//Delete to delete an invoice
router.delete("/:id", async function (req, res, next) {
  try {
    const result = await db.query("DELETE FROM invoices WHERE id=$1", [
      req.params.id,
    ]);
    return res.json({ message: "Deleted" });
  } catch (err) {
    return next(err);
  }
});

//Get /companies/[code] returns a company and it's invoice information
router.get("/companies/:code", async function (req, res, next) {
  try {
    const result_company = await db.query(
      `SELECT *
                FROM companies WHERE code = $1`,
      [req.params.code]
    );
    const result_invoice = await db.query(
      `SELECT *
              FROM invoices WHERE comp_code = $1`,
      [result_company.rows[0].code]
    );
    invoice = result_invoice.rows[0];
    return res.json({ company: result_company.rows, invoices: invoice });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
