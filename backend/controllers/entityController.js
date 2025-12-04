const Entity = require('../models/Entity');

// Get all entities for a user
exports.getEntities = async (req, res) => {
  try {
    const { search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const userId = req.user._id;

    let query = { userId };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { owner: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const entities = await Entity.find(query).sort(sort);
    res.json({ entities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single entity
exports.getEntity = async (req, res) => {
  try {
    const entity = await Entity.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!entity) {
      return res.status(404).json({ message: 'Entity not found' });
    }
    
    res.json({ entity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create entity
exports.createEntity = async (req, res) => {
  try {
    const { name, owner, status } = req.body;
    
    if (!name || !owner) {
      return res.status(400).json({ message: 'Name and owner are required' });
    }

    const entity = await Entity.create({
      name,
      owner,
      status: status || 'Pending',
      userId: req.user._id
    });

    res.status(201).json({ entity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update entity
exports.updateEntity = async (req, res) => {
  try {
    const { name, owner, status } = req.body;
    
    const entity = await Entity.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name, owner, status },
      { new: true, runValidators: true }
    );

    if (!entity) {
      return res.status(404).json({ message: 'Entity not found' });
    }

    res.json({ entity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete entity
exports.deleteEntity = async (req, res) => {
  try {
    const entity = await Entity.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entity) {
      return res.status(404).json({ message: 'Entity not found' });
    }

    res.json({ message: 'Entity deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

