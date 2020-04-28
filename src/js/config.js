const config = {
  name: 'PTT',
  url: 'wss://ws.ptt.cc/bbs',
  charset: 'big5',
  origin: 'app://pcman',
  protocol: 'websocket',
  timeout: 200,
  blobSize: 1024,
  preventIdleTimeout: 30,
  terminal: {
    columns: 80,
    rows: 24,
  },
  username: `${process.env.username}`,
  password: `${process.env.password}`,
};

export default config;
