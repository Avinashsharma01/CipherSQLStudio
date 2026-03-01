const express = require('express');
const router = express.Router();
const {
  getAllAssignments,
  getAssignmentById,
  getAssignmentTables,
} = require('../controllers/assignmentController');

router.get('/', getAllAssignments);
router.get('/:id', getAssignmentById);
router.get('/:id/tables', getAssignmentTables);

module.exports = router;
