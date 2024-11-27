import messagesListener from './messages';


export default ({ ws }) => {  
  const createListener = (callback) => (payload) => callback(payload);

  ws.on('ws', createListener(messagesListener.create));
};
