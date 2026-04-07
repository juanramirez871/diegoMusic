const statusService = require('../services/statusService');

const getStatus = (req, res) => {
  try {
    const status = statusService.getStatus();
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getStatus
};
