const express = require('express');
const pool = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inventory ORDER BY category, item_name');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch inventory', error: error.message });
  }
});

module.exports = router;
