const express = require('express');
const pool = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/', authRequired, async (req, res) => {
  try {
    const {
      batch_id,
      log_date,
      recorded_by,
      mortality_count,
      cull_count,
      feed_bags,
      feed_kg,
      water_liters,
      temperature_c,
      humidity_percent,
      photo_url,
      notes,
    } = req.body;

    if (!batch_id || !log_date || !recorded_by) {
      return res.status(400).json({ message: 'batch_id, log_date and recorded_by are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO daily_logs (batch_id, log_date, recorded_by, mortality_count, cull_count, feed_bags, feed_kg, water_liters, temperature_c, humidity_percent, photo_url, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        batch_id,
        log_date,
        recorded_by,
        mortality_count || 0,
        cull_count || 0,
        feed_bags || 0,
        feed_kg || 0,
        water_liters || 0,
        temperature_c || null,
        humidity_percent || null,
        photo_url || null,
        notes || null,
      ]
    );

    await pool.query(
      `UPDATE batches SET current_quantity = current_quantity - ? WHERE id = ?`,
      [(mortality_count || 0) + (cull_count || 0), batch_id]
    );

    const [inventoryRows] = await pool.query(
      `SELECT * FROM inventory WHERE category = 'feed' ORDER BY item_name` 
    );

    if (inventoryRows.length > 0) {
      const feedItem = inventoryRows[0];
      const newStock = Number(feedItem.stock_quantity) - Number(feed_kg || 0) / 100;
      await pool.query(
        `UPDATE inventory SET stock_quantity = ?, status = CASE WHEN ? <= reorder_level THEN 'low_stock' ELSE 'active' END WHERE id = ?`,
        [Math.max(0, newStock), newStock, feedItem.id]
      );
    }

    const [rows] = await pool.query('SELECT * FROM daily_logs WHERE id = ?', [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create daily log', error: error.message });
  }
});

router.get('/batch/:batchId', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT dl.*, u.full_name AS recorder_name
       FROM daily_logs dl
       LEFT JOIN users u ON u.id = dl.recorded_by
       WHERE dl.batch_id = ?
       ORDER BY dl.log_date DESC`,
      [req.params.batchId]
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch batch logs', error: error.message });
  }
});

module.exports = router;
