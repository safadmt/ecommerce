import winston, { createLogger, format, transports } from "winston";
const { combine, timestamp, label, printf } = format;


const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
      timestamp(),
      myFormat
    ),
    transports: [
      new transports.File({ filename: 'combined.log' }),
      new transports.File({filename: 'error.log', level: 'error'})
    ]
    
});

  //In production, you might want to log to a file as well
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: format.simple(),
    }));
  }

  logger.on('error', (err)=> {
    console.log("logger error", err)
  })
export default logger;