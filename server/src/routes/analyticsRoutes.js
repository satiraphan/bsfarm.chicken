const express = require('express');
const pool = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/batch/:batchId', authRequired, async (req, res) => {
  try {
    const { batchId } = req.params;

    const [batchRows] = await pool.query('SELECT * FROM batches WHERE id = ? AND deleted_at IS NULL', [batchId]);
    const batch = batchRows[0];

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const [logRows] = await pool.query(
      `SELECT COALESCE(SUM(feed_kg), 0) AS total_feed_kg,
              COALESCE(SUM(mortality_count + cull_count), 0) AS total_loss,
              COALESCE(AVG(temperature_c), 0) AS avg_temp,
              COALESCE(AVG(humidity_percent), 0) AS avg_humidity
       FROM daily_logs WHERE batch_id = ?`,
      [batchId]
    );

    const totalFeedKg = Number(logRows[0]?.total_feed_kg || 0);
    const totalLoss = Number(logRows[0]?.total_loss || 0);
    const avgTemp = Number(logRows[0]?.avg_temp || 0);
    const avgHumidity = Number(logRows[0]?.avg_humidity || 0);
    const totalBirds = Number(batch.initial_quantity || 0);
    const totalWeight = batch.target_weight_kg ? Number(batch.target_weight_kg) * totalBirds : 0;

    const fcr = totalFeedKg > 0 && totalWeight > 0 ? Number((totalFeedKg / totalWeight).toFixed(2)) : 0;
    const mortalityRate = totalBirds > 0 ? Number(((totalLoss / totalBirds) * 100).toFixed(2)) : 0;
    const adg = batch.chick_in_date ? Number(((totalWeight / Math.max(1, Math.ceil((Date.now() - new Date(batch.chick_in_date).getTime()) / (1000 * 60 * 60 * 24))))).toFixed(2)) : 0;

    return res.json({
      batchId: Number(batchId),
      batchCode: batch.batch_code,
      breed: batch.breed,
      status: batch.status,
      fcr,
      adg,
      mortalityRate,
      avgTemp,
      avgHumidity,
      totalLoss,
      totalFeedKg,
      totalBirds,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to calculate analytics', error: error.message });
  }
});

module.exports = router;
