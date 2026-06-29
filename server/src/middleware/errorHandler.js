module.exports = (err, req, res, next) => {
  console.error("ERROR:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    msg: process.env.NODE_ENV === "production" ? "Something went wrong" : message
  });
};
