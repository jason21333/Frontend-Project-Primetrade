const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getEntities,
  getEntity,
  createEntity,
  updateEntity,
  deleteEntity
} = require('../controllers/entityController');

// All routes require authentication
router.use(auth);

router.get('/', getEntities);
router.get('/:id', getEntity);
router.post('/', createEntity);
router.put('/:id', updateEntity);
router.delete('/:id', deleteEntity);

module.exports = router;

