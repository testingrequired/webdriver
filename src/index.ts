export { default as WebDriver } from "./WebDriver";
export { default as Browser } from "./Browser";
export { default as WebElement } from "./WebElement";
export { By } from "./By";

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
