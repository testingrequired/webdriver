export class Command {
  constructor(
    public readonly endpoint: string,
    public readonly method: string,
    public readonly body?: any
  ) {}

  static get(endpoint: string, body?: any) {
    return new Command(endpoint, "GET", body);
  }

  static post(endpoint: string, body?: any) {
    return new Command(endpoint, "POST", body);
  }

  static delete(endpoint: string, body?: any) {
    return new Command(endpoint, "DELETE", body);
  }
}
