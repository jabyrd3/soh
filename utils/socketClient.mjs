import net from 'net';
export default (oconfig, options) => {
  let count = options.retry;
  const timeout = options.timeout;
  return new Promise((res, rej) => {
    let buffer = '';
    const looper = () => {
      const client = net.createConnection(oconfig ?
        oconfig.socketFile :
        global.config.socketFile, () => {
          // console.log('INFO: connected to server socket');
        });
      client.on('data', data => {
        const response = data.toString()[0];
        client.end();
        client.destroy();
        if(response === '0'){
          return res(response);
        }
        return rej(response)
      });
      client.on('end', (e) => {
        console.log(`foo`);
        client.destroy();
      })
      client.on('error', (e) => {
        // console.log(`bar`, e);
        // console.log('INFO: socket server not ready, falling back');
        client.end();
        client.destroy();
        count--;
        if (count === 0){
          rej(e);
        } else {
          setTimeout(looper, timeout);
        }
      });
      client.write('0');
    };
    looper();
  });
};
