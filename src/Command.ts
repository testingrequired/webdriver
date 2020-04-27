export class Command {
  constructor(
    public readonly endpoint: string,
    public readonly method: string,
    public readonly body?: any,
    public readonly snapshot?: boolean
  ) {}

  static get(endpoint: string, body?: any, snapshot?: boolean) {
    return new Command(endpoint, "GET", body, snapshot);
  }

  static post(endpoint: string, body?: any, snapshot?: boolean) {
    return new Command(endpoint, "POST", body, snapshot);
  }

  static delete(endpoint: string, body?: any, snapshot?: boolean) {
    return new Command(endpoint, "DELETE", body, snapshot);
  }
}
