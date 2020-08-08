/* 
   child_process.fork() is nice but do you really want to run more v8? more garbage collectors?
   no, so put a lil bash wrapper around your script with a little listener for IPC and
   save on all your spawn needs

   # usage ````
    // build a worker pool
    KiddyPool.createPool('test', [
      ['example worker thread', 'echo jammmmer'],
      ['another thread', 'echo foobar']],
      (res1, res2) => console.log('children returned:', res1, res2));

    // fire some requests to children
      KiddyPool.message('test', 'example worker thread', 'some message');
      KiddyPool.message('test', 'some other one', JSON.stringify({something: 'fun'}));
    ```
*/

import child_process from 'child_process';
import fs from 'fs';
import socketClient from '/soh/utils/socketClient.mjs';
import rimraf from 'rimraf';

// wrap the provided bashlet with a lil unix domain server
const filify = (filename, command) =>
  `#! /usr/bin/env bash
  while true; do nc -U -l -q0 ${filename}.sock <<< "$(${command} > /dev/null; echo $?;)" > /dev/null; done;`
  

class KiddyPool {
  constructor(){
    this.pools = {};
    this.createPool = this.createPool.bind(this);
    this.spawn = this.spawn.bind(this);
    this.message = this.message.bind(this);
    // this.nuke = this.nuke.bind(this);
    this.writeScript = this.writeScript.bind(this);
    this.writeAll = this.writeAll.bind(this);
  }
  writeScript(filename, command){
    rimraf.sync(`${filename}.sh`);
    fs.writeFileSync(`${filename}.sh`, filify(filename, command), {
      mode: '777',
      flag: 'wx'
    });
  }
  writeAll(pool, members, callback){
    members.map(m => {
      // todo: restart subprocs when files are written
      // m.sub.proc.kill('SIGTERM');
      const filename = `${this.dir}/tmp/${m[0]}`;
      this.writeScript(filename, m[1]);
    });
  }
  createPool(pool, members, caller, failer, context){
    console.log('INFO: creating worker thread pool for ', pool, members, context)
    this.dir = '/soh'; //global.config.sohRoot;
    this.failCatcher = code => failer.bind(filename, code);
    this.members = members.map(member => {
      const filename = `${this.dir}/tmp/${member[0]}`;
      const fileRef = member[0];
      this.writeScript(filename, member[1]);
      return {
        filename,
        fileRef,
        sub: this.spawn(filename),
        callback: (code) => caller(fileRef, code)
      };
    });
  }
  spawn(f){
    var proc = child_process.execFile(`${f}.sh`);
    proc.unref();
    proc = null;
    return {};
  }
  message(name, value){
    const filename = `${this.dir}/tmp/${name}`;
      socketClient({socketFile: `${filename}.sock`}, {timeout: 20, retry: 21})
        .then(e => this.members[name]
          .callback(e))
        .catch(console.log)
  }
}

export default new KiddyPool();
