exports.calculatePremium = (dailyEarnings, riskScore, behaviorReliability) => {
    const baseRate = 0.005; 
    const demandVolatility = 1 + (Math.random() * 0.4); 
    
    const behaviorModifier = behaviorReliability > 0 ? (2 - behaviorReliability) : 1;
    const riskMultiplier = Math.max(1, riskScore / 20); 
    
    return dailyEarnings * baseRate * riskMultiplier * behaviorModifier * demandVolatility;
};
