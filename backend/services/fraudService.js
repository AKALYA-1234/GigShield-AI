exports.calculateFraudScore = (user, isSwarmValid, claimsDb, today) => {
    let fraudScore = 0;
    const flags = [];
    
    const dailyClaims = claimsDb.filter(c => c.userId === user.id && c.date === today);
    if (dailyClaims.length > 0) {
        fraudScore += 50 * dailyClaims.length;
        flags.push("High claim frequency.");
    }
    
    if (!isSwarmValid) {
        fraudScore += 30;
        flags.push("Swarm mismatch (Isolated event).");
    }
    
    if (Math.random() < 0.1) { 
        fraudScore += 25;
        flags.push("Location anomaly / Behavior mismatch.");
    }
    
    let action = 'PASS';
    if (fraudScore > 90) action = 'BLOCK';
    else if (fraudScore > 70) action = 'DELAY';

    return { fraudScore, action, flags };
};
