/**
 * Centralized Application Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Server Error] ${req.method} ${req.url}:`, err);

  // MySQL Duplicate Key Error
  if (err.code === 'ER_DUP_ENTRY' || (err.message && err.message.includes('Duplicate entry'))) {
    return res.status(409).json({
      success: false,
      message: 'A record with this unique information already exists.'
    });
  }

  // MySQL Foreign Key Constraint Error
  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Database relational constraint violation. Cannot complete operation.'
    });
  }

  // Validation / Custom Error
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error. Please try again later.'
  });
};

module.exports = errorHandler;
