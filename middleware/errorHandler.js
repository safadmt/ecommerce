import logger from "../utils/logger.js";
function handleError(err, req, res, next) {
  logger.error(err.message ,err.stack)
  res.render("partials/message/pagenotfound", {
    status: 500,
    error: "Something went. wrong please try again later",
    role : "error"
  });
  next();
}

export { handleError };
