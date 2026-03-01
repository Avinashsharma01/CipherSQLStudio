const pool = require('../config/pgPool');

async function executeQuery(req, res) {
  const query = req.cleanQuery; // sanitized already

  try {
    const client = await pool.connect();

    try {
      await client.query('SET statement_timeout = 5000');
      const result = await client.query(query);
      // console.log('rows returned:', result.rowCount);

      const columns = result.fields.map((f) => f.name);

      res.json({
        success: true,
        columns,
        rows: result.rows,
        rowCount: result.rowCount,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Query error:', err.message);
    // send pg error back - helps the student learn
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

module.exports = { executeQuery };
