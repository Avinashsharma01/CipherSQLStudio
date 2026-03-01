const Assignment = require('../models/Assignment');
const pool = require('../config/pgPool');

// get all assignments
async function getAllAssignments(req, res) {
  try {
    const assignments = await Assignment.find().sort({ created_at: -1 });
    res.json({ success: true, data: assignments });
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ success: false, error: 'Failed to load assignments' });
  }
}

async function getAssignmentById(req, res) {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }
    res.json({ success: true, data: assignment });
  } catch (err) {
    console.error('Error fetching assignment:', err);
    res.status(500).json({ success: false, error: 'Failed to load assignment' });
  }
}

// returns schema + sample data for the tables used in an assignment
async function getAssignmentTables(req, res) {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    const tablesInfo = [];

    for (const tableName of assignment.tables_used) {
      // column info from information_schema
      const schemaResult = await pool.query(
        `SELECT column_name, data_type
         FROM information_schema.columns
         WHERE table_name = $1
         ORDER BY ordinal_position`,
        [tableName]
      );

      // grab few sample rows
      const sampleResult = await pool.query(
        `SELECT * FROM ${tableName} LIMIT 5`
      );

      tablesInfo.push({
        table_name: tableName,
        columns: schemaResult.rows,
        sample_data: sampleResult.rows,
      });
    }

    res.json({ success: true, data: tablesInfo });
  } catch (err) {
    console.error('Error fetching table info:', err);
    res.status(500).json({ success: false, error: 'Could not load table information' });
  }
}

module.exports = {
  getAllAssignments,
  getAssignmentById,
  getAssignmentTables,
};
