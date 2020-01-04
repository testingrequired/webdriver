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
  chromeOptions?: ChromeOptions;
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

export interface ChromeOptions {
  args?: Array<string>;
  binary?: string;
  extensions?: Array<string>;
  localState?: Record<string, any>;
  prefs?: Record<string, any>;
  detach?: boolean;
  debuggerAddress?: string;
  excludeSwitches?: Array<string>;
  minidumpPath?: string;
  mobileEmulation?: Record<string, any>;
  perfLoggingPrefs?: Record<
    | "enableNetwork"
    | "enablePage"
    | "traceCategories"
    | "bufferUsageReportingInterval",
    boolean | string | number
  >;
  windowTypes?: Array<string>;
}
