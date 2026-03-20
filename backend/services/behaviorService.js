exports.analyzeUserBehavior = (user) => {
    // A simple mock for typical working hours checking
    // Assume shift starts at 9 AM
    const currentHour = new Date().getHours();
    const startHour = 9;
    const endHour = startHour + user.workingHours;
    
    // If inactive during their expected shift -> valid potential disruption
    const isShiftTime = currentHour >= startHour && currentHour <= endHour;
    
    return {
        isBehaviorValid: isShiftTime && user.inactive,
        reason: isShiftTime ? "Inactive during expected working hours" : "Inactive outside working hours",
        shiftDetails: { startHour, endHour, currentHour }
    };
};
