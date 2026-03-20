const db = require('../database/db');

exports.learnFromClaim = (claimRecord) => {
    db.learningFeedback.baseSeverity = Math.min(1.0, db.learningFeedback.baseSeverity + 0.005);
    
    if (claimRecord.acceptedZoneId) {
        const currentRate = db.learningFeedback.successRates[claimRecord.acceptedZoneId] || 0.8;
        db.learningFeedback.successRates[claimRecord.acceptedZoneId] = Math.max(0.1, currentRate - 0.05);
    }
    return db.learningFeedback;
};

exports.rewardZoneSuccess = (zoneId) => {
    const currentRate = db.learningFeedback.successRates[zoneId] || 0.8;
    db.learningFeedback.successRates[zoneId] = Math.min(1.0, currentRate + 0.02);
};
