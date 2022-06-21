//@ts-check

const { nanoid } = require("nanoid");
const { getBody, getFunctionCalled } = require("../utils/getBody");

class TraceTree {
  constructor(obj = null) {
    if (!obj) {
      this.adjList = new Map();
      this.data = new Map();
      this.registry = new Map();
      this.reverseReg = new Map();
      // this.processed = [];
      this.start = null;
    } else {
      this.adjList = new Map(JSON.parse(obj['adjList']));
      this.registry = new Map(JSON.parse(obj['registry']));
      this.data = new Map(JSON.parse(obj['data']));
      this.reverseReg = new Map(JSON.parse(obj['reverseReg']));
      // this.processed = JSON.parse(obj['processed']);
      // this.start = obj['start'];
    }
  }

  async run(funcName, paramCount) {
    await this.generateTree(funcName, paramCount, "", true);
    return {
      adjList: JSON.stringify(Array.from(this.adjList.entries())),
      data: JSON.stringify(Array.from(this.data.entries())),
      registry: JSON.stringify(Array.from(this.registry.entries())),
      reverseReg: JSON.stringify(Array.from(this.reverseReg.entries())),
      start: this.start,
    };
  }

  async expand(funcName, paramCount, funcObj) {
    let id = this.registry.get(funcName)
    this.data?.set(id, [funcObj]);
    const funcCalled = getFunctionCalled(funcObj);
    console.log(funcCalled);
    for (var func of funcCalled) {
      await this.generateTree(func.funcName, func.paramCount, id, false, 1);
    }
    return {
      adjList: JSON.stringify(Array.from(this.adjList.entries())),
      data: JSON.stringify(Array.from(this.data.entries())),
      registry: JSON.stringify(Array.from(this.registry.entries())),
      reverseReg: JSON.stringify(Array.from(this.reverseReg.entries())),
      start: this.start, // we can get rid of start    -- ? then how to figure out start nano id in front end
    };
  }

  async generateTree(
    funcName,
    paramCount,
    parent = "",
    start = false,
    depth = 0
  ) {
    if (depth > 2) {
      return;
    }
    // TODO: need to be check after api call
    if (this.registry?.get(funcName)) {
      let oldId = this.registry.get(funcName);
      if (parent && !this.adjList?.get(parent).includes(oldId)) {
        this.adjList?.get(parent).push(oldId);
      }
      return;
    }

    // let results = await getBody(funcName, paramCount);

    const id = nanoid();
    if (start) {
      this.start = id;
    }
    parent && this.adjList?.get(parent).push(id);
    this.registry?.set(funcName, id);
    this.reverseReg?.set(id, funcName);
    this.adjList?.set(id, []);

    let results = await getBody(funcName, paramCount);
    // console.log(funcName, results);
    if (!results || results.length === 0) {
      return;
    }

    const dataObj = [];
    results.forEach((value) => {
      dataObj.push({
        url:
          "http://localhost:7080" +
          value.file.url +
          "?L" +
          (value.lineMatches[0].lineNumber + 1),
        preview: value.lineMatches[0].preview,
        file: value.file.name,
        fileUrl: "http://localhost:7080" + value.file.url,
        funcName: funcName,
        lineNumber: value.lineMatches[0].lineNumber,
        code: value.lineMatches.map((line) => line.preview),
      });
    });

    this.data?.set(id, dataObj);
    if (dataObj.length > 1) {
      return;
    }

    const funcCalled = getFunctionCalled(dataObj[0]);

    for (var func of funcCalled) {
      await this.generateTree(
        func.funcName,
        func.paramCount,
        id,
        false,
        depth + 1
      );
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
