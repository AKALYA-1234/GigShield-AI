const db = require('../database/db');

exports.getRankedZones = (currentArea, dailyEarnings) => {
    const zones = [
        { id: "A", name: "Downtown Sector", risk: 80, penalty: 1.5, baseDemand: 9 },
        { id: "B", name: "Westside Grid", risk: 25, penalty: 0.5, baseDemand: 7 },
        { id: "C", name: "Tech Park", risk: 45, penalty: 1.0, baseDemand: 6 },
        { id: "D", name: "North Hills", risk: 10, penalty: 0.2, baseDemand: 4 }
    ];
    
    const successRates = db.learningFeedback.successRates;

    const scoredZones = zones.map(zone => {
        const expectedEarnings = dailyEarnings * 0.05 * zone.baseDemand;
        const successRate = successRates[zone.id] || 0.8;
        
        const score = (expectedEarnings * successRate) - (zone.risk * zone.penalty);
        
        return {
            ...zone,
            score,
            successRate: Math.round(successRate * 100),
            expectedEarnings: Math.round(expectedEarnings),
            weatherStatus: zone.risk > 50 ? "CRITICAL" : zone.risk > 30 ? "RISK" : "SAFE",
        };
    });
    
    scoredZones.sort((a, b) => b.score - a.score);
    return scoredZones.slice(0, 2);
};
