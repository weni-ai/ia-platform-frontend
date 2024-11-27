export default ({ ws, app }) => {
  const createListener = (callback) => (payload) => {
    callback(payload, {
      app,
    });
  };

  ws.on('ws', console.log('agent builder ws'));
};
