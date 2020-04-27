import { v4 as uuid } from "uuid";
import fetch from "node-fetch";
import { By } from "./By";
import { EventEmitter } from "events";
import { Events } from "./events";
import { Command } from "./Command";
import { Capabilities } from ".";

/**
 * Interacts directly with webdriver server
 */
export default class WebDriver extends EventEmitter {
  private _sessionId?: string;
  private _domSnapshots: Map<Command, string> = new Map();
  private _visualSnapshots: Map<Command, string> = new Map();

  constructor(
    private options: WebdriverOptions,
    public timeoutsConfig: TimeoutsConfig = {},
    ...registerHandlers: Array<(driver: WebDriver) => void>
  ) {
    super();

    registerHandlers.forEach((handler) => {
      handler.call(null, this);
    });
  }

  /**
   * Current session id if exists
   */
  get sessionId() {
    return this._sessionId;
  }

  /**
   * Desired capability of webdriver
   */
  get capabilities() {
    return this.options.desiredCapabilities;
  }

  /**
   * Get DOM snapshot, if any exists, for command
   * @param command Command to get snapshot for
   */
  getDOMSnapshotFromCommand(command: Command) {
    return this._domSnapshots.get(command);
  }

  /**
   * Get visual snapshot, if any exists, for command
   * @param command Command to get snapshot for
   */
  getVisualSnapshotFromCommand(command: Command) {
    return this._visualSnapshots.get(command);
  }

  /**
   * Send a command to the webdriver server
   * @param command Command object containing endpoint, method and body
   * @returns Response JSON body deserialized
   */
  async command<T extends CommandResponse>(
    command: Command,
    previousRequestId?: string
  ): Promise<T> {
    const requestId: string = previousRequestId || uuid();
    const { endpoint, method, body } = command;
    const url = `${this.options.remoteUrl}${endpoint}`;

    this.emit(Events.Command, requestId, command);

    if (this.options.snapshotDOM && command.snapshot) {
      const response = await fetch(
        `${this.options.remoteUrl}/session/${this.sessionId}/source`
      );

      const data = await response.json();

      const snapshot: string = data.value;

      this._domSnapshots.set(command, snapshot);

      this.emit(Events.DOMSnapshot, requestId, command, snapshot);
    }

    if (this.options.snapshotVisual && command.snapshot) {
      const response = await fetch(
        `${this.options.remoteUrl}/session/${this.sessionId}/screenshot`
      );

      const data = await response.json();

      const snapshot: string = data.value;

      this._visualSnapshots.set(command, snapshot);

      this.emit(Events.VisualSnapshot, requestId, command, snapshot);
    }

    const res = await fetch(url, { method, body: JSON.stringify(body) });

    if (!res.ok) {
      const error = new Error(await res.text());

      this.emit(Events.CommandFail, requestId, command, error, res);
      this.emit(Events.CommandEnd, requestId, command);

      throw error;
    }

    let responseData: T;

    try {
      responseData = await res.json();

      this.emit(Events.CommandSuccess, requestId, command, responseData);

      return responseData;
    } catch (e) {
      this.emit(Events.CommandFail, requestId, command, e, res);

      throw e;
    } finally {
      this.emit(Events.CommandEnd, requestId, command);
    }
  }

  /**
   * Send a command to the webdriver server using the current session
   * @param command Command object containing endpoint, method and body
   * @returns Response JSON body deserialized
   */
  sessionCommand<T extends CommandResponse>(command: Command) {
    return this.command<T>(
      new Command(
        `/session/${this.sessionId}${command.endpoint}`,
        command.method,
        command.body,
        command.snapshot
      )
    );
  }

  /**
   * Start a new session with the webdriver server
   * @returns Object containing session id
   */
  async newSession() {
    const { desiredCapabilities } = this.options;

    this.emit(Events.Session, desiredCapabilities);

    const result = await this.command<NewSessionResponse>(
      Command.post("/session", { desiredCapabilities })
    );

    if (!result.sessionId) {
      const error = new Error(
        `Error creating session: ${JSON.stringify(result)}`
      );

      this.emit(Events.SessionFail, error);

      throw error;
    }

    this._sessionId = result.sessionId;

    this.emit(Events.SessionSuccess, this.sessionId);

    await this.setTimeouts(this.timeoutsConfig);

    return result;
  }

  /**
   * End session with webdriver server
   */
  async deleteSession() {
    await this.command(Command.delete(`/session/${this.sessionId}`));

    this.emit(Events.SessionEnd, this.sessionId);

    delete this._sessionId;
  }

  /**
   * Navigate to url
   * @param url The url to navigate to
   */
  url(url: string) {
    return this.sessionCommand(Command.post(`/url`, { url }));
  }

  /**
   * Get source code for current page
   * @returns Source code for current page
   */
  async source() {
    const response = await this.sessionCommand<{ value: string }>(
      Command.get(`/source`)
    );

    return response.value;
  }

  /**
   * Close the current window
   */
  closeWindow() {
    return this.sessionCommand(Command.delete(`/window`));
  }

  /**
   * Execute javascript in the current window's context
   * @param script Javascript to execute
   * @param args Arguments available to script
   */
  executeScript(script: string, ...args: Array<string>) {
    return this.sessionCommand(Command.post(`/execute/sync`, { script, args }));
  }

  /**
   * Execute function in the current window's context
   * @param fn Function to execute
   * @param args Arguments passed to function when executed
   */
  executeFunction(fn: Function, ...args: Array<string>) {
    return this.executeScript(
      `return (${fn.toString()}).apply(null, arguments)`,
      ...args
    );
  }

  /**
   * Configure webdriver timeout's for current session
   * @param config Timeouts and values to configure
   */
  setTimeouts(config: TimeoutsConfig) {
    return this.sessionCommand(Command.post(`/timeouts`, config));
  }

  /**
   * Find element
   * @param by Selector strategy and value to find element
   * @returns {string} Element id if element is found
   */
  async findElement(by: By): Promise<string | undefined> {
    this.emit(Events.FindElement, by);

    const result = await this.sessionCommand<CommandResponse<ElementIdValue>>(
      Command.post(`/element`, by, true)
    );

    if (!result.value) {
      this.emit(Events.FindElementFail, by);
      return;
    }

    const elementId = result.value.ELEMENT;

    this.emit(Events.FindElementSuccess, by, elementId);

    return elementId;
  }

  /**
   * Find element within a parent element
   * @param fromElementId Parent element id
   * @param by Selector strategy and value to find element
   * @returns {string} Element id if element is found
   */
  async findElementFromElement(
    fromElementId: string,
    by: By
  ): Promise<string | undefined> {
    this.emit(Events.FindElementFromElement, fromElementId, by);

    const result = await this.sessionCommand<CommandResponse<ElementIdValue>>(
      Command.post(`/element/${fromElementId}/element`, by, true)
    );

    if (!result.value) {
      this.emit(Events.FindElementFromElementFail, fromElementId, by);
      return;
    }

    const elementId = result.value.ELEMENT;

    this.emit(
      Events.FindElementFromElementSuccess,
      fromElementId,
      by,
      elementId
    );

    return elementId;
  }

  /**
   * Find one or more elements
   * @param by Selector strategy and value to find elements
   * @returns {string[]} Element ids if element/s are found
   */
  async findElements(by: By): Promise<Array<string>> {
    this.emit(Events.FindElements, by);

    const result = await this.sessionCommand<
      CommandResponse<Array<ElementIdValue>>
    >(Command.post(`/elements`, by, true));

    if (!result.value) {
      this.emit(Events.FindElementsFail, by);
      return [];
    }

    const elementIds = result.value.map((v) => v.ELEMENT);

    this.emit(Events.FindElementsSuccess, by, elementIds);

    return elementIds;
  }

  /**
   * Find one or more elements within a parent element
   * @param by Selector strategy and value to find elements
   * @param fromElementId Parent element id
   * @returns {string[]} Element ids if element/s are found
   */
  async findElementsFromElement(
    by: By,
    fromElementId: string
  ): Promise<Array<string>> {
    this.emit(Events.FindElementsFromElement, by, fromElementId);

    const result = await this.sessionCommand<
      CommandResponse<Array<ElementIdValue>>
    >(Command.post(`/element/${fromElementId}/elements`, by, true));

    if (!result.value) {
      this.emit(Events.FindElementsFromElementFail, fromElementId, by);
      return [];
    }

    const elementIds = result.value.map((v) => v.ELEMENT);

    this.emit(
      Events.FindElementsFromElementSuccess,
      fromElementId,
      by,
      elementIds
    );

    return elementIds;
  }

  /**
   * Get text from element
   * @param elementId Target element id
   * @returns Text from element
   */
  async elementText(elementId: string) {
    const result = await this.sessionCommand<CommandResponse<string>>(
      Command.get(`/element/${elementId}/text`, undefined, true)
    );

    return result.value;
  }

  /**
   * Click element
   * @param elementId Target element id
   */
  clickElement(elementId: string) {
    return this.sessionCommand(
      Command.post(`/element/${elementId}/click`, undefined, true)
    );
  }

  sendKeysElement(elementId: string, text: string) {
    return this.sessionCommand(
      Command.post(
        `/element/${elementId}/value`,
        {
          text,
          value: text.split(""),
        },
        true
      )
    );
  }
}

export interface WebdriverOptions {
  remoteUrl: string;
  desiredCapabilities: Capabilities;
  snapshotDOM?: boolean;
  snapshotVisual?: boolean;
}

export interface TimeoutsConfig {
  script?: number;
  pageLoad?: number;
  implicit?: number;
}

interface ElementIdValue {
  ELEMENT: string;
}

interface NewSessionResponse extends CommandResponse {
  sessionId: string;
}

interface CommandResponse<T = any> {
  value: T | null;
}
