import fetch from "node-fetch";
import { By } from "./By";
import WebdriverOptions from "./WebdriverOptions";

export interface TimeoutsConfig {
  script?: number;
  pageLoad?: number;
  implicit?: number;
}

export default class WebDriver {
  private _sessionId?: string;

  constructor(
    private options: WebdriverOptions,
    private timeoutsConfig: TimeoutsConfig = {}
  ) {}

  get sessionId() {
    return this._sessionId;
  }

  async executeScript(script: string, ...args: Array<string>) {
    await this.sessionCommand(`/execute/sync`, "POST", { script, args });
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

  async newSession() {
    const result = await this.command<NewSessionResponse>("/session", "POST", {
      desiredCapabilities: this.options.desiredCapabilities
    });

    if (!result.sessionId) {
      throw new Error(`Error creating session: ${JSON.stringify(result)}`);
    }

    this._sessionId = result.sessionId;

    await this.setTimeouts(this.timeoutsConfig);

    return result;
  }

  async deleteSession() {
    await this.command(`/session/${this.sessionId}`, "DELETE");

    delete this._sessionId;
  }

  async command<T extends CommandResponse>(
    command: string,
    method: string,
    body?: any
  ): Promise<T> {
    const url = `${this.options.remoteUrl}${command}`;
    const res = await fetch(url, { method, body: JSON.stringify(body) });

    console.log(
      [method, command, ...(body ? [JSON.stringify(body)] : [])].join(": ")
    );

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data: T = await res.json();

    debugger;

    console.log(`DATA: ${JSON.stringify(data)}`);

    return data;
  }

  async sessionCommand<T extends CommandResponse>(
    command: string,
    method: string,
    body?: any
  ) {
    return await this.command<T>(
      `/session/${this.sessionId}${command}`,
      method,
      body
    );
  }

  async findElement(by: By): Promise<string | undefined> {
    const result = await this.sessionCommand<CommandResponse<ElementIdValue>>(
      "/element",
      "POST",
      by
    );

    if (!result.value) return;

    return result.value.ELEMENT;
  }

  async findElementFromElement(
    fromElementId: string,
    by: By
  ): Promise<string | undefined> {
    const result = await this.sessionCommand<CommandResponse<ElementIdValue>>(
      `/element/${fromElementId}/element`,
      "POST",
      by
    );

    if (!result.value) return;

    return result.value.ELEMENT;
  }

  async findElements(by: By): Promise<Array<string>> {
    const result = await this.sessionCommand<
      CommandResponse<Array<ElementIdValue>>
    >("/elements", "POST", by);

    if (!result.value) return [];

    return result.value.map(v => v.ELEMENT);
  }

  async findElementsFromElement(
    by: By,
    fromElementId: string
  ): Promise<Array<string>> {
    const result = await this.sessionCommand<
      CommandResponse<Array<ElementIdValue>>
    >(`/element/${fromElementId}/elements`, "POST", by);

    if (!result.value) return [];

    return result.value.map(v => v.ELEMENT);
  }

  async elementText(elementId: string) {
    const result = await this.sessionCommand<CommandResponse<string>>(
      `/element/${elementId}/text`,
      "GET"
    );

    return result.value;
  }

  async clickElement(elementId: string) {
    await this.sessionCommand(`/element/${elementId}/click`, "POST");
  }

  async url(url: string) {
    await this.sessionCommand("/url", "POST", { url });
  }

  async closeWindow() {
    await this.sessionCommand("/window", "DELETE");
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
