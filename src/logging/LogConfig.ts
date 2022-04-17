import { appendFile, existsSync, mkdirSync } from "fs";
import { LogLevel, LogMessage } from "typescript-logging";
import {CategoryProvider, Category} from "typescript-logging-category-style";

function writeToLog(logMessage: LogMessage) {
  // Get UTC date and time
  const start = new Date(Date.now());
  
  let logName = start.toISOString().split('T')[0] + ".log";

  let eStr = logMessage.error ? "\nError: " + logMessage.error : "";
  appendFile("logs/" + logName, logMessage.message + eStr + "\n", (err) => {
    if (err) {
      console.log("Error writing to log file! Error: %o", err);
    }
  });
}

const provider = CategoryProvider.createProvider("main", {
  level: LogLevel.Debug,
  channel: {
    type: "LogChannel",
    write: (logMessage) => writeToLog(logMessage),
  }
});

export function getLogger(name: string): Category {
  return provider.getCategory(name);
}

if(!existsSync("logs")) {
  mkdirSync("logs");
}