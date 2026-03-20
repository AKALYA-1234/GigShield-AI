const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const insuranceController = require('../controllers/insuranceController');

// User Auth
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/user/:id', userController.getUser);

// Insurance & Simulation
router.get('/weather/:location', insuranceController.getWeatherAndPricing);
router.post('/simulate/condition', insuranceController.simulateCondition);
router.post('/simulate/toggle', insuranceController.toggleActivity);
router.post('/claims/process', insuranceController.processClaim);
router.get('/admin/stats', insuranceController.getAdminStats);

module.exports = router;
