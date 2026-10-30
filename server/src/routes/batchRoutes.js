const express = require('express');
const pool = require('../config/db');
const { authRequired, authorize } = require('../middleware/auth');

const router = express.Router();

function getDayOfAge(chickInDate) {
  if (!chickInDate) return 0;
  const start = new Date(chickInDate);
  const now = new Date();
  const diff = now - start;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

router.get('/', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, h.house_name, h.location,
             TIMESTAMPDIFF(DAY, b.chick_in_date, CURDATE()) AS day_of_age
      FROM batches b
      LEFT JOIN houses h ON h.id = b.house_id
      WHERE b.deleted_at IS NULL
      ORDER BY b.chick_in_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch batches', error: error.message });
  }
});

router.post('/', authRequired, authorize('owner', 'manager'), async (req, res) => {
  try {
    const { house_id, batch_code, breed, chick_in_date, initial_quantity, target_weight_kg } = req.body;

    if (!house_id || !batch_code || !breed || !chick_in_date || !initial_quantity) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const [result] = await pool.query(
      `INSERT INTO batches (house_id, batch_code, breed, chick_in_date, initial_quantity, current_quantity, status, target_weight_kg)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
      [house_id, batch_code, breed, chick_in_date, initial_quantity, initial_quantity, target_weight_kg || null]
    );

    const [rows] = await pool.query('SELECT * FROM batches WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create batch', error: error.message });
  }
});

router.put('/:id', authRequired, authorize('owner', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No update data provided' });
    }

    const fields = [];
    const values = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'id' || key === 'created_at' || key === 'updated_at') return;
      fields.push(`${key} = ?`);
      values.push(value);
    });

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No valid fields for update' });
    }

    values.push(id);
    await pool.query(`UPDATE batches SET ${fields.join(', ')} WHERE id = ?`, values);

    const [rows] = await pool.query('SELECT * FROM batches WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update batch', error: error.message });
  }
});

router.delete('/:id', authRequired, authorize('owner'), async (req, res) => {
  try {
    await pool.query('UPDATE batches SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete batch', error: error.message });
  }
});

module.exports = router;
