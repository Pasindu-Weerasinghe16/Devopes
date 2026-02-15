const express = require('express');
const router = express.Router();
const { Inventory } = require('../models/inventory');

function computeStatus(stock) {
    if (typeof stock !== 'number') return 'In Stock';
    if (stock === 0) return 'Out of Stock';
    if (stock < 50) return 'Low Stock';
    return 'In Stock';
}

function todayISO() {
    return new Date().toISOString().split('T')[0];
}

// Get all inventory items for the authenticated user
router.get('/', async (req, res) => {
    try {
        const items = await Inventory.find({ userId: req.userId }).sort({ updatedAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch inventory', details: err });
    }
});

// Create inventory item
router.post('/', async (req, res) => {
    try {
        const payload = {
            userId: req.userId,
            name: req.body.name,
            sku: req.body.sku,
            category: req.body.category,
            stock: Number(req.body.stock),
            price: Number(req.body.price),
        };
        payload.status = computeStatus(payload.stock);
        payload.lastUpdated = todayISO();

        const item = new Inventory(payload);
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ error: 'Failed to create item', details: err });
    }
});

// Update inventory item
router.put('/:id', async (req, res) => {
    try {
        const update = {
            name: req.body.name,
            sku: req.body.sku,
            category: req.body.category,
            stock: Number(req.body.stock),
            price: Number(req.body.price),
            lastUpdated: todayISO(),
        };
        update.status = computeStatus(update.stock);

        const item = await Inventory.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            update,
            { new: true }
        );
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(item);
    } catch (err) {
        res.status(400).json({ error: 'Failed to update item', details: err });
    }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
    try {
        const result = await Inventory.deleteOne({ _id: req.params.id, userId: req.userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(400).json({ error: 'Failed to delete item', details: err });
    }
});

module.exports = router;
