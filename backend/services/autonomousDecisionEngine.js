const fraudService = require('./fraudService');
const behaviorService = require('./behaviorService');
const { calculatePayout } = require('./insuranceService');

exports.evaluateSimulation = (user, forecast, swarm) => {
    let confidence = 0.5;
    if (swarm.zoneStatus === 'CRITICAL') confidence += 0.3;
    if (forecast.avgProbability > 60) confidence += 0.2;
    
    const behavior = behaviorService.analyzeUserBehavior(user);
    if (!behavior.isBehaviorValid) confidence -= 0.4;
    
    confidence = Math.max(0.1, Math.min(1.0, confidence));
    
    let decision = 'MONITOR'; 
    if (confidence > 0.8 && user.inactive) {
        decision = 'AUTO_PAYOUT';
    } else if (forecast.avgProbability > 50) {
        decision = 'SUGGEST_ZONE';
    }
    
    return { decision, confidence, behavior };
};

exports.executePayoutDecision = (user, lostHours, condition, swarm, dbClaims, today) => {
    const fraud = fraudService.calculateFraudScore(user, swarm.isValid, dbClaims, today);
    
    if (fraud.action === 'BLOCK') {
        return { success: false, reason: 'BLOCKED by Fraud Engine', fraud };
    }
    if (fraud.action === 'DELAY') {
        return { success: false, reason: 'DELAYED for manual review', fraud };
    }
    
    let confidence = 0.8; 
    if (swarm.zoneStatus === 'CRITICAL') confidence += 0.2;
    
    const basePayout = calculatePayout(user.dailyEarnings, lostHours, condition);
    const finalAmount = basePayout * confidence;
    
    return { success: true, amount: finalAmount, confidence, fraud };
};
