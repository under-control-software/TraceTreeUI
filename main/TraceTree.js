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
      this.processed = [];
      this.start = null;
    } else {
      this.adjList = new Map(JSON.parse(obj["adjList"]));
      this.registry = new Map(JSON.parse(obj["registry"]));
      this.data = new Map(JSON.parse(obj["data"]));
      this.reverseReg = new Map(JSON.parse(obj["reverseReg"]));
      this.processed = JSON.parse(obj["processed"]);
      this.start = obj['start'];
    }
  }

  returnData() {
    const treeStructure = this.generateTreeStructure(this.start, []);
    return {
      adjList: JSON.stringify(Array.from(this.adjList.entries())),
      data: JSON.stringify(Array.from(this.data.entries())),
      registry: JSON.stringify(Array.from(this.registry.entries())),
      reverseReg: JSON.stringify(Array.from(this.reverseReg.entries())),
      processed: JSON.stringify(this.processed),
      start: this.start,
      treeStructure: JSON.stringify(treeStructure)
    };
  }

  generateTreeStructure(node, visited) {
    const res = {name: node};
    if (visited.includes(node)) {
      res['attributes'] = {
        recursion : true
      }
      return res;
    }
    if (this.adjList?.get(node).length !== 0) {
      visited.push(node);
      res['children'] = this.adjList?.get(node).map(value => {
        this.generateTreeStructure(value, visited);
      });
      visited.pop();
    }
    return res;
  }

  async run(funcName, paramCount) {
    await this.generateTree(funcName, paramCount, "", true);
    return this.returnData();
  }

  async expand(funcName, paramCount, funcObj, parent) {
    // parent -> '' means single match
    const regobj = {
      funcName,
      paramCount,
      parent: "",
      fileUrl: funcObj.fileUrl,
      lineNumber: funcObj.lineNumber,
    };
    let oldRegobj;
    if (parent !== "") {
      oldRegobj = { funcName, paramCount, parent, fileUrl: "", lineNumber: -1 };
    } else {
      oldRegobj = {
        funcName,
        paramCount,
        parent: "",
        fileUrl: funcObj.fileUrl,
        lineNumber: funcObj.lineNumber,
      };
    }

    if (!this.registry?.get(JSON.stringify(oldRegobj))) {
      console.log("error");
      return { err: "Not Found" };
    }

    if (
      this.registry?.get(JSON.stringify(regobj)) &&
      this.processed.includes[this.registry?.get(JSON.stringify(regobj))]
    ) {
      if (parent !== "") {
        const newid = this.registry?.get(JSON.stringify(regobj));
        const oldid = this.registry?.get(JSON.stringify(oldRegobj));
        this.adjList.get(parent).forEach((value, ind) => {
          if (value === oldid) {
            this.adjList.get(parent)[ind] = newid;
          }
        });
        this.registry?.delete(JSON.stringify(oldRegobj));
        this.reverseReg?.delete(oldid);
        this.adjList?.delete(oldid);
        this.data?.delete(oldid);
      }
      return this.returnData();
    }

    let id = this.registry.get(JSON.stringify(oldRegobj));
    this.registry?.delete(JSON.stringify(oldRegobj));
    this.registry?.set(JSON.stringify(regobj), id);
    this.reverseReg?.set(id, regobj);
    this.data?.set(id, [funcObj]);

    const funcCalled = getFunctionCalled(funcObj);
    this.processed.push(id);
    for (var func of funcCalled) {
      await this.generateTree(func.funcName, func.paramCount, id, false, 1);
    }

    return this.returnData();
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

    let results = await getBody(funcName, paramCount);

    const id = nanoid();
    if (start) {
      this.start = id;
    }
    parent && this.adjList?.get(parent).push(id);

    if (!results || results.length === 0) {
      // no match case
      const regobj = {
        funcName,
        paramCount,
        parent,
        fileUrl: "",
        lineNumber: -1,
      };
      this.registry?.set(JSON.stringify(regobj), id);
      this.reverseReg?.set(id, regobj);
      this.adjList?.set(id, []);
      this.data?.set(id, []);
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

    if (dataObj.length > 1) {
      // multiple matches
      const regobj = {
        funcName,
        paramCount,
        parent,
        fileUrl: "",
        lineNumber: -1,
      };
      this.registry?.set(JSON.stringify(regobj), id);
      this.reverseReg?.set(id, regobj);
      this.adjList?.set(id, []);
      this.data?.set(id, dataObj);
      return;
    }

    // single match
    const regobj = {
      funcName,
      paramCount,
      parent: "",
      fileUrl: dataObj[0].fileUrl,
      lineNumber: dataObj[0].lineNumber,
    };
    // check if already visited
    if (this.registry?.get(JSON.stringify(regobj))) {
      let oldId = this.registry.get(JSON.stringify(regobj));
      if (parent && !this.adjList?.get(parent).includes(oldId)) {
        this.adjList?.get(parent).push(oldId);
      }
      return;
    }

    this.registry?.set(JSON.stringify(regobj), id);
    this.reverseReg?.set(id, regobj);
    this.adjList?.set(id, []);
    this.data?.set(id, dataObj);

    if (depth >= 2) {
      return;
    }
    const funcCalled = getFunctionCalled(dataObj[0]);
    this.processed.push(id);
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
funcName
-> Use api for funcname

-> no match
  funcName,paramCount,parent-id '', -1,

->single match
  funcname,paramCount,parent-id:'',fileName,lineno.

->multiple match
  funcname,paramCount, parent-id, '', -1
*/
