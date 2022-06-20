//@ts-check

const { nanoid } = require("nanoid");
const { getBody, getFunctionCalled } = require("../utils/getBody");

class TraceTree {
  constructor() {
    this.adjList = new Map();
    this.data = new Map();
    this.registry = new Map();
    this.reverseReg = new Map();
    this.start = null;
    this.x = 0;
  }

  async run(funcName) {
    await this.generateTree(funcName, "", true);
    return {
      adjList: JSON.stringify(Array.from(this.adjList.entries())),
      data: JSON.stringify(Array.from(this.data.entries())),
      registry: JSON.stringify(Array.from(this.registry.entries())),
      reverseReg: JSON.stringify(Array.from(this.reverseReg.entries())),
      start: this.start,
    };
  }

  async generateTree(funcName, parent = "", start = false, depth = 0) {
    if (depth > 1) {
      return;
    }
    if (this.registry?.get(funcName)) {
      let oldId = this.registry.get(funcName);
      if (parent && !this.adjList?.get(parent).includes(oldId)) {
        this.adjList?.get(parent).push(oldId);
      }
      return;
    }
    // console.log(funcName);
    const id = nanoid();
    if (start) {
      this.start = id;
    }
    parent && this.adjList?.get(parent).push(id);
    this.registry?.set(funcName, id);
    this.reverseReg?.set(id, funcName);
    this.adjList?.set(id, [id]); // TODO: why [id] instead of [] ?

    let results = await getBody(funcName);
    // console.log(results);
    if (!results || results.length === 0) {
      return ;
    }
    const url =
    "http://localhost:7080" +
    results[0].file.url +
    "?L" +
    (results[0].lineMatches[0].lineNumber + 1);
    const funcCalled = getFunctionCalled(results);
    
    this.data?.set(id, url);
    for (var func of funcCalled) {
      await this.generateTree(func, id, false, depth + 1);
    }
  }

  printTree() {
    this.adjList.forEach((value, key) => {
      console.log(this.reverseReg.get(key));
      console.log("Data: " + this.data.get(key));
      value.map((e) => console.log(this.reverseReg.get(e)));
      console.log();
    });
  }
}

exports.TraceTree = TraceTree;

/*
function a(){
    ...
    c=b();
    d=e();
    x=b();
    a();
}

function b(){
    s=e();
}

adj[a]=b
*/
