import { Request, Response, NextFunction } from "express";
import { createLogger, format, transports } from "winston";
const { combine, timestamp, label, printf, metadata, colorize } = format;

import SlackTransport from "winston-slack-webhook-transport";
//Logger output Format for file(error messages)
const logFormat = printf(({ level, label, timestamp, ...meta }) => {
  return `[${level}] ${timestamp} ${label}: ${JSON.stringify(meta)}`;
});
//Logger output Format for console(info,warn,error messages)
const consoleFormat = printf(({ level, label, timestamp, message }) => {
  return `[${level}] ${timestamp} ${label}: ${message}`;
});
export const prodLogger = createLogger({
  transports: [
    new transports.Console({
      format: combine(
        colorize({ all: <boolean>false, level: <boolean>true }),
        consoleFormat
      ),
    }),
    new SlackTransport({
      webhookUrl: <string>process.env.SLACK_WEBHOOK_URL,
      channel: "restaurant-application" as string,
      username: "Burgerito Bot" as string,
      level: "error" as string,
      iconEmoji: ":robot:",
      formatter: (info) => ({
        text: <string>(
          `${info.timestamp}\n*[${info.level.toUpperCase()}]:*\n>${
            info.message
          }`
        ),
        attachments: [
          {
            text: `${JSON.stringify(info.metadata)}`,
          },
        ],
      }),
    }),
  ],
  format: combine(
    label({ label: "Burgerito-Logger" }),
    timestamp({ format: "YY-MM-DD HH:mm:ss" }),
    metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
    logFormat
  ),
});

export const log = (req: Request, res: Response, next: NextFunction) => {
  //Log every Request made to an endpoint
  const logData = `${req.method} ${req.originalUrl} ${res.statusCode} ${res.statusMessage}`;
  res.on("finish", () => {
    if (res.statusCode < 400) {
      prodLogger.info(logData);
    } else if (res.statusCode >= 400 && res.statusCode < 500) {
      prodLogger.warn(logData);
    } else {
      prodLogger.error(logData);
    }
  });
  next();
};
