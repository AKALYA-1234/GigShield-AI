exports.getRiskForecast = (currentWeather) => {
    const timeline = [];
    let cumulativeRisk = 0;
    
    let baseProb = (currentWeather.rain > 5 || currentWeather.temp > 33) ? 60 : 15;
    
    for(let i=1; i<=3; i++) {
        let futureRisk = Math.min(100, Math.max(0, baseProb + (Math.random() * 40 - 10)));
        timeline.push({
            hourOffset: i,
            disruptionProbability: futureRisk,
            status: futureRisk > 75 ? 'CRITICAL' : futureRisk > 40 ? 'RISK' : 'SAFE'
        });
        cumulativeRisk += futureRisk;
        baseProb = futureRisk; // Trend continuation
    }
    
    const avgProbability = Math.round(cumulativeRisk / 3);
    const expectedLoss = Math.floor(avgProbability * 0.01 * 800); 
    
    return {
        avgProbability,
        expectedLoss,
        timeline,
        alertMessage: avgProbability > 60 ? "High risk expected in next 2 hours." : "Weather conditions remain stable."
    };
};
