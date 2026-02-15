const express = require('express');
const router = express.Router();
const { Inventory } = require('../models/inventory');

// Get all inventory items for a user
router.get('/:userId', async (req, res) => {
    try {
        const items = await Inventory.find({ userId: req.params.userId });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch inventory', details: err });
    }
});

// Create inventory item
router.post('/', async (req, res) => {
    try {
        const item = new Inventory(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ error: 'Failed to create item', details: err });
    }
});

// Update inventory item
router.put('/:id', async (req, res) => {
    try {
        const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(item);
    } catch (err) {
        res.status(400).json({ error: 'Failed to update item', details: err });
    }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
    try {
        await Inventory.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(400).json({ error: 'Failed to delete item', details: err });
    }
});

module.exports = router;
