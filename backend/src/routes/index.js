const express = require('express');
const router = express.Router();
const statusRoutes = require('./statusRoutes');

router.use('/status', statusRoutes);

module.exports = router;
