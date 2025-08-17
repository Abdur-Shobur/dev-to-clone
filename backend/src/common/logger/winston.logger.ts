// src/common/logger/winston.logger.ts
import { utilities as nestWinston } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

// check production
const isProduction = process.env.NODE_ENV === 'production';

// create transports for error
const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/%DATE%-error.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxFiles: '7d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});

// create transports for warn
const warnFileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/%DATE%-warn.log',
  datePattern: 'YYYY-MM-DD',
  level: 'warn',
  maxFiles: '7d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});

// create transports for combined
const combinedFileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/%DATE%-combined.log',
  datePattern: 'YYYY-MM-DD',
  level: 'info',
  maxFiles: '7d',
  format: winston.format.combine(
    // filter out errors in combined
    winston.format((info) => (info.level === 'error' ? false : info))(),
    winston.format.timestamp(),
    winston.format.json(),
  ),
});

// create transports for console
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp(),
    nestWinston.format.nestLike('App', {
      prettyPrint: true,
    }),
  ),
});

// winston logger options
export const winstonLoggerOptions: winston.LoggerOptions = {
  level: isProduction ? 'warn' : 'debug',
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    errorFileTransport,
    warnFileTransport,
    !isProduction && combinedFileTransport,
    !isProduction && consoleTransport,
  ].filter(Boolean),
};
