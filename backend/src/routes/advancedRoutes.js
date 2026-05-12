const express = require('express');
const router = express.Router();
const advancedController = require('../controllers/advancedController');

router.get('/sustainability-score', advancedController.getSustainabilityScore);
router.post('/recommend-route', advancedController.recommendRoute);
router.get('/health-index', advancedController.getCityHealthIndex);

module.exports = router;
