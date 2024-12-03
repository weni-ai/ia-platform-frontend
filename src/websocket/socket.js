export default class Socket {
  /**
   * @type {WebSocket}
   */
  #ws;

  ws;

  #handlers = [];

  constructor(url) {
    this.#ws = new WebSocket(url);
    this.ws = this.#ws;
    this.#createOnMessageListener();
    this.#eventPong();
  }

  #createOnMessageListener() {
    this.#ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.pongData = data;
      if (!data.message) return;
      const { type } = data;

      this.#handlers.forEach(({ message, callback }) => {
        if (message === type) callback(data.message);
      });
    };
  }

  #eventPong() {
    this.#ws.onPong = this.pongData;
  }

  on(message, callback) {
    const handler = {
      message,
      callback,
    };
    this.#handlers.push(handler);
  }

  send(message) {
    this.ws.send(JSON.stringify(message));
  }
}
