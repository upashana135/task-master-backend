function handleBigInt(obj) {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

function successResponse(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: handleBigInt(data),
  });
}

function errorResponse(res, message = 'Something went wrong', statusCode = 500, data = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    data: handleBigInt(data),
  });
}

module.exports = {
  successResponse,
  errorResponse,
};
