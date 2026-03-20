const db = require('../database/db');
const weatherService = require('../services/weatherService');
const { calculatePremium } = require('../services/insuranceService');

exports.register = async (req, res) => {
  try {
    const { name, platform, location, dailyEarnings, workingHours } = req.body;
    
    if (db.users.find(u => u.name === name)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    let weather;
    try {
        weather = await weatherService.getWeather(location);
    } catch (e) {
        // Fallback for demo if API fails
        weather = { main: 'Clear', rain: 0, temp: 28 };
    }
    const { riskScore, riskTier } = weatherService.calculateRisk(weather);
    const premium = calculatePremium(dailyEarnings, riskTier);

    const newUser = {
      id: String(db.users.length + 1),
      name,
      platform,
      location,
      dailyEarnings: Number(dailyEarnings),
      workingHours: Number(workingHours),
      riskScore,
      riskTier,
      premium,
      coverageActive: true,
      inactive: false,
      wallet: 0 
    };

    db.users.push(newUser);
    res.status(201).json({ message: 'Registration successful', user: newUser });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = (req, res) => {
  const { name } = req.body;
  const user = db.users.find(u => u.name === name);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'Login successful', user });
};

exports.getUser = (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const claims = db.claims.filter(c => c.userId === user.id);
  res.json({ user, claims });
};
