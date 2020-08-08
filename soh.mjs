import kiddyPool from '/soh/kiddyPool.mjs';
// import http from 'http';
// import wordListPath from 'word-list';
// import fs from 'fs';
const children = 1;
// var open = Array.from({length: children}).map(()=>1);
class SOH {
  constructor(){
    this.kp = kiddyPool;
    this.got  = this.got.bind(this);
    this.failed = this.failed.bind(this);
    // this.getName = this.getName.bind(this);
    this.start = this.start.bind(this);
    this.trigger = this.trigger.bind(this);
    this.start();
    this.counter = 0;
  }
  got(thing1, thing2){
    this.counter += 1;
    this.trigger(thing1)
  }
  failed(thing1, thing2){
    console.log('failed', thing1, thing2);
    process.exit(1);
  }
  trigger(idx){
    // open[idx] = 0;
    this.kp.message(idx, null);
  }
  start(){
    this.pool = this.kp.createPool('fuck', Array.from({length: children}).map((u, i) => [i, 'curl -s http://localhost:80']), this.got, this.failed);
    // open.map((this.trigger);
      for(var i = 0; i < children; i++){
        this.trigger(i);
      }
    setInterval(()=>console.log(this.counter), 1000)
  }
}

new SOH();
process.on('uncaughtException', console.log);
