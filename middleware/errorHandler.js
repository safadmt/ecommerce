import logger from "../utils/logger.js";
function handleError(err, req, res, next) {
  
  res.render("partials/message/pagenotfound", {
    status: 500,
    error: "Something went. wrong please try again later",
    role : "error"
  });
  logger.info(err.stack || err.message)
  next();
}

export { handleError };
