function errorHandler(err, req, res, _next) {
  console.error('[Error]', err.message);

  if (err.response) {
    // Axios error from GHL/Vapi API
    return res.status(err.response.status || 502).json({
      error: 'Upstream API error',
      details: err.response.data,
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
}

module.exports = errorHandler;
