const express = require('express');
const router = express.Router();
const { getLivePollution, addPollutionData } = require('../controllers/pollutionController');

router.get('/live', getLivePollution);
router.post('/add', addPollutionData);

module.exports = router;
