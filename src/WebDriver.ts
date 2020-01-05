import fetch from "node-fetch";
import { By } from "./By";
import Capabilities from "./Capabilities";
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
    const result = await this.command<NewSessionResult>("/session", "POST", {
      desiredCapabilities: this.options.desiredCapabilities
    });

    this._sessionId = result.sessionId;

    await this.setTimeouts(this.timeoutsConfig);

    return result;
  }

  async deleteSession() {
    await this.command(`/session/${this.sessionId}`, "DELETE");

    delete this._sessionId;
  }

  async command<T>(command: string, method: string, body?: any): Promise<T> {
    const url = `${this.options.remoteUrl}${command}`;
    const res = await fetch(url, { method, body: JSON.stringify(body) });

    console.log(
      [method, command, ...(body ? [JSON.stringify(body)] : [])].join(": ")
    );

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data: T = await res.json();

    console.log(`DATA: ${JSON.stringify(data)}`);

    return data;
  }

  async sessionCommand<T = void>(
    command: string,
    method: string,
    body?: any
  ): Promise<CommandResponse<T>> {
    return await this.command(
      `/session/${this.sessionId}${command}`,
      method,
      body
    );
  }

  async findElement(by: By): Promise<string | undefined> {
    const result = await this.sessionCommand<ElementResult>(
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
    const result = await this.sessionCommand<ElementResult>(
      `/element/${fromElementId}/element`,
      "POST",
      by
    );

    if (!result.value) return;

    return result.value.ELEMENT;
  }

  async findElements(by: By): Promise<Array<string>> {
    const result = await this.sessionCommand<Array<ElementResult>>(
      "/elements",
      "POST",
      by
    );

    if (!result.value) return [];

    return result.value.map(v => v.ELEMENT);
  }

  async findElementsFromElement(
    by: By,
    fromElementId: string
  ): Promise<Array<string>> {
    const result = await this.sessionCommand<Array<ElementResult>>(
      `/element/${fromElementId}/elements`,
      "POST",
      by
    );

    if (!result.value) return [];

    return result.value.map(v => v.ELEMENT);
  }

  async elementText(elementId: string) {
    const result = await this.sessionCommand<string>(
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

interface ElementResult {
  ELEMENT: string;
}

interface NewSessionResult {
  sessionId: string;
  capabilities: Capabilities;
}

interface CommandResponse<T> {
  value: T | null;
}
