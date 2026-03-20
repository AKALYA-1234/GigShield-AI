exports.calculatePremium = (dailyEarnings, riskTier) => {
    let multiplier = 1;
    if (riskTier === 'Medium') multiplier = 1.5;
    if (riskTier === 'High') multiplier = 2;
    
    return dailyEarnings * 0.008 * multiplier;
}

exports.calculatePayout = (dailyEarnings, lostHours, condition) => {
    const hourlyRate = dailyEarnings / 8;
    let severity = 0.5; // fallback
    
    const c = condition.toLowerCase();
    if (c === 'heavy rain') severity = 0.8;
    else if (c === 'light rain') severity = 0.4;
    else if (c === 'flood' || c === 'curfew') severity = 1.0;
    else if (c === 'extreme heat' || c === 'heat') severity = 0.6;
    else if (c === 'pollution') severity = 0.7;

    return lostHours * hourlyRate * severity;
}
