import WebDriver from "./WebDriver";
import { Events } from "./events";

export default function cliReporter(driver: WebDriver) {
  const requestIdLength = 4;

  driver.on(Events.Session, (capabilities) => {
    console.log(`SESSION: ${JSON.stringify(capabilities)}`);
  });

  driver.on(Events.SessionSuccess, (sessionId) => {
    console.log(`SESSION START: ${sessionId}`);
  });

  driver.on(Events.SessionEnd, (sessionId) => {
    console.log(`SESSION END: ${sessionId}`);
  });

  driver.on(Events.Command, (requestId, { endpoint, method, body }) => {
    const requestIdHash = requestId.substring(0, requestIdLength);
    const log = `COMMAND  (${requestIdHash}): ${method} ${endpoint}`;
    const logBody = body ? `${JSON.stringify(body)}` : "";

    console.log(log, logBody);
  });

  driver.on(Events.CommandSuccess, (requestId, command, body) => {
    const requestIdHash = requestId.substring(0, requestIdLength);
    const log = `DATA     (${requestIdHash}): ${JSON.stringify(body)}`;

    console.log(log);
  });

  driver.on(Events.CommandFail, (requestId, command, error) => {
    const requestIdHash = requestId.substring(0, requestIdLength);
    const log = `ERROR    (${requestIdHash}): ${error.message}`;

    console.log(log);
  });

  driver.on(Events.CommandEnd, (requestId) => {
    const requestIdHash = requestId.substring(0, requestIdLength);
    const log = `END      (${requestIdHash})`;

    console.log(log);
  });

  driver.on(Events.DOMSnapshot, (requestId) => {
    const requestIdHash = requestId.substring(0, requestIdLength);
    console.log(`SNAPSHOT (${requestIdHash}): DOM`);
  });

  driver.on(Events.VisualSnapshot, (requestId) => {
    const requestIdHash = requestId.substring(0, requestIdLength);
    console.log(`SNAPSHOT (${requestIdHash}): Visual`);
  });
}
