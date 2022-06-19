//@ts-check

const { nanoid } = require("nanoid");
const { tracetree } = require("../utils/getBody");

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
    this.printTree();
  }

  async generateTree(funcName, parent = "", start = false, depth = 0) {
    if (depth > 2) {
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
    this.adjList?.set(id, [id]);
    let result = await tracetree(funcName);
    this.data?.set(id, result.url);
    for (var func of result.funcCalled) {
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
