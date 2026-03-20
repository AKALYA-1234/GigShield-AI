const db = {
    users: [], 
    claims: [], 
    fraudLogs: [],
    learningFeedback: {
        baseSeverity: 0.5,
        successRates: { "A": 0.8, "B": 0.9, "C": 0.6, "D": 0.7 }
    },
    digitalTwinNodes: [] 
};
module.exports = db;
