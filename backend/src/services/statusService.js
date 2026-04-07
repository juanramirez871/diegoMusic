const getStatus = () => {
  return {
    status: 'UP',
    timestamp: new Date().toISOString(),
    message: 'Server is running :)'
  };
};

export {
  getStatus
};
