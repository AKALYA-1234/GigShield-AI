const db = require('../database/db');
const weatherService = require('../services/weatherService');
const predictiveRiskService = require('../services/predictiveRiskService');
const adaptivePricingService = require('../services/adaptivePricingService');
const swarmService = require('../services/swarmService');
const autonomousDecisionEngine = require('../services/autonomousDecisionEngine');
const zoneScoringService = require('../services/zoneScoringService');
const selfLearningService = require('../services/selfLearningService');

exports.getWeatherAndPricing = async (req, res) => {
    try {
        const user = db.users.find(u => u.id === req.query.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        const weather = await weatherService.getWeather(req.params.location);
        const { riskScore, riskTier } = weatherService.calculateRisk(weather);
        
        const forecast = predictiveRiskService.getRiskForecast(weather);
        
        const dynamicPremium = adaptivePricingService.calculatePremium(user.dailyEarnings, riskScore, 1.0);
        user.premium = dynamicPremium;
        user.riskTier = riskTier;
        user.riskScore = riskScore;
        
        res.json({ weather, riskScore, riskTier, forecast, dynamicPremium });
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch predictive data' });
    }
};

exports.simulateCondition = (req, res) => {
    const { userId, condition, rain, temp } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.currentWeather = { main: condition, rain, temp };
    
    const swarm = swarmService.swarmValidation(user.location);
    const forecast = predictiveRiskService.getRiskForecast(user.currentWeather);
    
    const evaluation = autonomousDecisionEngine.evaluateSimulation(user, forecast, swarm);
    
    let zoneSuggestions = null;
    if (evaluation.decision === 'SUGGEST_ZONE') {
        zoneSuggestions = zoneScoringService.getRankedZones(user.location, user.dailyEarnings);
    }
    
    res.json({ 
        message: 'Simulation evaluated automatically', 
        user, 
        evaluation, 
        forecast,
        swarm,
        zoneSuggestions 
    });
};

exports.processClaim = (req, res) => {
    const { userId, condition, acceptedZoneId, expectedPayout, lostHours } = req.body;
    const user = db.users.find(u => u.id === userId);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const today = new Date().toISOString().split('T')[0];
    
    if (acceptedZoneId) {
        selfLearningService.rewardZoneSuccess(acceptedZoneId);
        if (!user.lossPrevented) user.lossPrevented = 0;
        user.lossPrevented += (expectedPayout || 200); 
        return res.json({ message: 'User accepted suggestion', lossPrevented: (expectedPayout || 200), userLossPrevented: user.lossPrevented });
    }
    
    const swarm = swarmService.swarmValidation(user.location);
    const execution = autonomousDecisionEngine.executePayoutDecision(user, lostHours || 2, condition, swarm, db.claims, today);
    
    if (!execution.success) {
        if (execution.fraud && execution.fraud.fraudScore > 0) {
            if (!db.fraudLogs) db.fraudLogs = [];
            db.fraudLogs.push({ id: Date.now(), userId, date: today, score: execution.fraud.fraudScore, action: execution.fraud.action });
        }
        return res.status(400).json({ error: execution.reason, fraud: execution.fraud });
    }
    
    const newClaim = {
        id: String(db.claims.length + 1),
        userId,
        date: today,
        amount: execution.amount,
        reason: condition,
        status: `Paid (Conf: ${(execution.confidence*100).toFixed(0)}%)`
    };
    
    db.claims.push(newClaim);
    user.wallet += execution.amount;
    
    selfLearningService.learnFromClaim(newClaim);
    
    res.json({ message: 'Dynamic Context-Aware Payout Triggered', claim: newClaim, newWalletBalance: user.wallet, confidence: execution.confidence });
};

exports.getAdminStats = (req, res) => {
    const totalUsers = db.users.length;
    const totalClaims = db.claims.length;
    const totalPayouts = db.claims.reduce((acc, c) => acc + c.amount, 0);
    const totalLossPrevented = db.users.reduce((acc, u) => acc + (u.lossPrevented || 0), 0);
    const activeRiskZones = 4; 
    const fraudAlerts = db.fraudLogs ? db.fraudLogs.length : 0;
    
    const digitalTwinNodes = Array(24).fill(0).map((_, i) => ({
        id: i,
        status: Math.random() > 0.85 ? 'CRITICAL' : Math.random() > 0.6 ? 'RISK' : 'SAFE'
    }));
    
    let confidenceSum = 0;
    let confidenceCount = 0;
    db.claims.forEach(c => {
        if (c.status.includes('Conf:')) {
            const match = c.status.match(/(\d+)%/);
            if(match) { confidenceSum += parseInt(match[1]); confidenceCount++; }
        }
    });
    const systemConfidence = confidenceCount > 0 ? Math.round(confidenceSum / confidenceCount) : 85; 
    
    res.json({ totalUsers, totalClaims, totalPayouts, riskZones: Array(activeRiskZones).fill('Mocked Cluster'), totalLossPrevented, fraudAlerts, digitalTwinNodes, systemConfidence });
};

exports.toggleActivity = (req, res) => {
    const { userId, inactive } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.inactive = inactive;
    res.json({ message: 'User activity updated', inactive: user.inactive });
};
