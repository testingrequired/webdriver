import WebDriver, { WebdriverOptions } from "./WebDriver";
import { Events } from "./events";
import cliReporter from "./cliReporter";
import { Command } from "./Command";

describe("cliReporter", () => {
  const webdriverOptions: WebdriverOptions = {
    remoteUrl: "remoteUrl",
    desiredCapabilities: {},
  };

  let driver: WebDriver;
  let oldLog: any;

  beforeEach(async () => {
    driver = new WebDriver(webdriverOptions);

    cliReporter(driver);

    oldLog = console.log;
    console.log = jest.fn();
  });

  afterEach(() => {
    console.log = oldLog;
  });

  it("should log when session event emitted", () => {
    const expectedCapabilities = { key: "value" };

    driver.emit(Events.Session, expectedCapabilities);

    expect(console.log).toBeCalledWith(
      `SESSION: ${JSON.stringify(expectedCapabilities)}`
    );
  });

  it("should log when session success event emitted", () => {
    const expectedSessionId = "expectedSessionId";

    driver.emit(Events.SessionSuccess, expectedSessionId);

    expect(console.log).toBeCalledWith(`SESSION START: ${expectedSessionId}`);
  });

  it("should log when session end event emitted", () => {
    const expectedSessionId = "expectedSessionId";

    driver.emit(Events.SessionEnd, expectedSessionId);

    expect(console.log).toBeCalledWith(`SESSION END: ${expectedSessionId}`);
  });

  it("should log when command event emitted", () => {
    const expectedRequestId = "expectedRequestId";
    const expectedEndpoint = "expectedEndPoint";
    const expectedBody = "expectedBody";
    const expectedCommand = Command.post(expectedEndpoint, expectedBody);

    driver.emit(Events.Command, expectedRequestId, expectedCommand);

    expect(console.log).toBeCalledWith(
      `COMMAND  (expe): ${expectedCommand.method} ${expectedCommand.endpoint}`,
      `${JSON.stringify(expectedBody)}`
    );
  });

  it("should log when command success event emitted", () => {
    const expectedRequestId = "expectedRequestId";
    const expectedEndpoint = "expectedEndPoint";
    const expectedBody = "expectedBody";
    const expectedCommand = Command.post(expectedEndpoint, expectedBody);

    driver.emit(
      Events.CommandSuccess,
      expectedRequestId,
      expectedCommand,
      expectedBody
    );

    expect(console.log).toBeCalledWith(
      `DATA     (expe): ${JSON.stringify(expectedBody)}`
    );
  });

  it("should log when command success event emitted", () => {
    const expectedRequestId = "expectedRequestId";
    const expectedEndpoint = "expectedEndPoint";
    const expectedCommand = Command.post(expectedEndpoint);
    const expectedErrorMessage = "expectedErrorMessage";
    const expectedError = new Error(expectedErrorMessage);

    driver.emit(
      Events.CommandFail,
      expectedRequestId,
      expectedCommand,
      expectedError
    );

    expect(console.log).toBeCalledWith(
      `ERROR    (expe): ${expectedErrorMessage}`
    );
  });

  it("should register command end listener", () => {
    expect(driver.listenerCount(Events.CommandEnd)).toBe(1);
  });

  it("should log when command success event emitted", () => {
    const expectedRequestId = "expectedRequestId";

    driver.emit(Events.CommandEnd, expectedRequestId);

    expect(console.log).toBeCalledWith(`END      (expe)`);
  });

  it("should log when dom snapshot event emitted", () => {
    const expectedDOMSnapshot = "expectedDOMSnapshot";

    driver.emit(Events.DOMSnapshot, expectedDOMSnapshot);

    expect(console.log).toBeCalledWith(`SNAPSHOT (expe)`);
  });
});
