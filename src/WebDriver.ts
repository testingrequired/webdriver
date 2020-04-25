import fetch from "node-fetch";
import { By } from "./By";
import WebdriverOptions from "./WebdriverOptions";
import { EventEmitter } from "events";
import { Events } from "./events";

export interface TimeoutsConfig {
  script?: number;
  pageLoad?: number;
  implicit?: number;
}

export default class WebDriver extends EventEmitter {
  private _sessionId?: string;

  constructor(
    private options: WebdriverOptions,
    private timeoutsConfig: TimeoutsConfig = {},
    registerHandlers?: (driver: WebDriver) => void
  ) {
    super();

    if (registerHandlers) {
      registerHandlers(this);
    }
  }

  get sessionId() {
    return this._sessionId;
  }

  get capabilities() {
    return this.options.desiredCapabilities;
  }

  async command<T extends CommandResponse>(
    command: string,
    method: string,
    body?: any
  ): Promise<T> {
    const url = `${this.options.remoteUrl}${command}`;

    this.emit(Events.Command, url, method, body);

    const res = await fetch(url, { method, body: JSON.stringify(body) });

    if (!res.ok) {
      const error = new Error(await res.text());

      this.emit(Events.CommandFail, error, res);
      this.emit(Events.CommandEnd, res, url, method);

      throw error;
    }

    const data: T = await res.json();

    this.emit(Events.CommandSuccess, data, res, url, method);
    this.emit(Events.CommandEnd, res, url, method);

    return data;
  }

  sessionCommand<T extends CommandResponse>(
    command: string,
    method: string,
    body?: any
  ) {
    return this.command<T>(
      `/session/${this.sessionId}${command}`,
      method,
      body
    );
  }

  async newSession() {
    const { desiredCapabilities } = this.options;

    this.emit(Events.Session, desiredCapabilities);

    const result = await this.command<NewSessionResponse>("/session", "POST", {
      desiredCapabilities,
    });

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

  async deleteSession() {
    await this.command(`/session/${this.sessionId}`, "DELETE");

    this.emit(Events.SessionEnd, this.sessionId);

    delete this._sessionId;
  }

  url(url: string) {
    return this.sessionCommand("/url", "POST", { url });
  }

  closeWindow() {
    return this.sessionCommand("/window", "DELETE");
  }

  executeScript(script: string, ...args: Array<string>) {
    return this.sessionCommand(`/execute/sync`, "POST", { script, args });
  }

  executeFunction(fn: Function, ...args: Array<string>) {
    return this.executeScript(
      `return (${fn.toString()}).apply(null, arguments)`,
      ...args
    );
  }

  setTimeouts(config: TimeoutsConfig) {
    return this.sessionCommand("/timeouts", "POST", config);
  }

  async findElement(by: By): Promise<string | undefined> {
    this.emit(Events.FindElement, by);

    const result = await this.sessionCommand<CommandResponse<ElementIdValue>>(
      "/element",
      "POST",
      by
    );

    if (!result.value) {
      this.emit(Events.FindElementFail, by);
      return;
    }

    const elementId = result.value.ELEMENT;

    this.emit(Events.FindElementSuccess, by, elementId);

    return elementId;
  }

  async findElementFromElement(
    fromElementId: string,
    by: By
  ): Promise<string | undefined> {
    this.emit(Events.FindElementFromElement, fromElementId, by);

    const result = await this.sessionCommand<CommandResponse<ElementIdValue>>(
      `/element/${fromElementId}/element`,
      "POST",
      by
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

  async findElements(by: By): Promise<Array<string>> {
    this.emit(Events.FindElements, by);

    const result = await this.sessionCommand<
      CommandResponse<Array<ElementIdValue>>
    >("/elements", "POST", by);

    if (!result.value) {
      this.emit(Events.FindElementsFail, by);
      return [];
    }

    const elementIds = result.value.map((v) => v.ELEMENT);

    this.emit(Events.FindElementsSuccess, by, elementIds);

    return elementIds;
  }

  async findElementsFromElement(
    by: By,
    fromElementId: string
  ): Promise<Array<string>> {
    this.emit(Events.FindElementsFromElement, by, fromElementId);

    const result = await this.sessionCommand<
      CommandResponse<Array<ElementIdValue>>
    >(`/element/${fromElementId}/elements`, "POST", by);

    if (!result.value) {
      this.emit(Events.FindElementsFromElementFail, by);
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

  async elementText(elementId: string) {
    const result = await this.sessionCommand<CommandResponse<string>>(
      `/element/${elementId}/text`,
      "GET"
    );

    return result.value;
  }

  clickElement(elementId: string) {
    return this.sessionCommand(`/element/${elementId}/click`, "POST");
  }

  sendKeysElement(elementId: string, text: string) {
    return this.sessionCommand(`/element/${elementId}/value`, "POST", {
      text,
      value: text.split(""),
    });
  }
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
