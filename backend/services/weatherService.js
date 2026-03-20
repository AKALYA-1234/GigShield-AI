const axios = require('axios');
const API_KEY = process.env.WEATHER_API_KEY || '02b59378470573c54b2f3ed6ec37a45d';

exports.getWeather = async (city) => {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = response.data;
        const main = data.weather[0].main;
        const temp = data.main.temp;
        const rain = data.rain ? (data.rain['1h'] || 0) : 0;
        return { main, temp, rain };
    } catch (error) {
        console.error("Error fetching weather:", error.message);
        throw error;
    }
}

exports.calculateRisk = (weather) => {
    let riskScore = 0;
    let riskTier = 'Low';
    
    if (weather.rain > 10 || weather.temp > 35) {
        riskScore = 90;
        riskTier = 'High';
    } else if (weather.rain > 2 || weather.temp > 30) {
        riskScore = 60;
        riskTier = 'Medium';
    } else {
        riskScore = 20;
    }
    return { riskScore, riskTier };
}
