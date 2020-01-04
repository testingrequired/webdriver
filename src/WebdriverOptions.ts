import Capabilities from "./Capabilities";

export default interface WebdriverOptions {
  remoteUrl: string;
  desiredCapabilities: Capabilities;
}
