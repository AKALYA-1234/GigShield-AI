exports.swarmValidation = (area) => {
    const workerCount = Math.floor(Math.random() * 10) + 10; 
    let inactiveCount = 0; 
    
    for(let i=0; i<workerCount; i++) {
        if (Math.random() > 0.4) inactiveCount++; 
    }
    
    const inactivePercentage = (inactiveCount / workerCount) * 100;
    let zoneStatus = 'SAFE';
    if (inactivePercentage > 60) zoneStatus = 'CRITICAL';
    else if (inactivePercentage > 30) zoneStatus = 'RISK';
    
    return {
        isValid: zoneStatus === 'CRITICAL' || zoneStatus === 'RISK',
        zoneStatus,
        inactivePercentage,
        activeWorkers: workerCount - inactiveCount,
        inactiveWorkers: inactiveCount
    };
};
