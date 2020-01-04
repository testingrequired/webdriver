export default interface Capabilities {
  browserName?: string;
  browserVersion?: string;
  platformName?: string;
  acceptInsecureCerts?: boolean;
  pageLoadStrategy?: string;
  proxy?: Proxy;
  setWindowRect?: boolean;
  timeouts?: any;
  strictFileInteractability?: boolean;
  unhandledPromptBehavior?: string;
  chromeOptions?: {
    args?: Array<string>;
  };
}

export interface Proxy {
  proxyType: "pac" | "direct" | "autodetect" | "system" | "manual";
  proxyAutoconfigUrl?: string;
  ftpProxy?: string;
  httpProxy?: string;
  noProxy?: Array<string>;
  sslProxy?: string;
  socksProxy?: string;
  socksVersion?: number;
}
