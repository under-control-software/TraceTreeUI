const { fetchQuery } = require("./fetchQuery");
const { queries } = require("./queries");

async function getBody(funcName, paramCount) {
  if (!/^[a-zA-Z_]+$/.test(funcName) || paramCount < 0) {
    return [];
  }

  query = `
    context:global repo:^github.com/spring-projects/spring-framework$ 
    :[~\\s]${funcName}(...) {...}
    -file:.*test.*
    patternType:structural lang:Java case:yes count:all
    `;

  res = await fetchQuery(queries[1], { query: query });
  res = res.data.search.results.results;
  res = res.filter((match) => {
    return paramCheck(match.lineMatches[0].preview, paramCount, funcName);
  });
  return res;
}

function paramCheck(line, paramCount, funcName) {
  line = line.substring(line.indexOf(funcName) + funcName.length);
  let cnt = 0;
  let enclose = 0;
  let nonspace = false;
  let check = false;
  for (let ch of line) {
    if (check && ch === ")") {
      break;
    }
    if (check) {
      if (ch === "<") {
        enclose++;
      }
      if (ch === ">") {
        enclose--;
      }
      if (ch === "," && enclose === 0) {
        cnt++;
      }
      if (ch !== " ") {
        nonspace = true;
      }
    }
    if (!check && ch === "(") {
      check = true;
    }
  }

  if (!(cnt === 0 && nonspace === false)) {
    cnt++;
  }

  return cnt === paramCount;
}

function getFunctionCalled(funcBody) {
  if (!funcBody) {
    return [];
  }

  // referencing funcBody itself (not a copy)
  const value = funcBody.code;
  value.shift();
  calledFunctions = value.map((line) => {
    const codeLine = line.trim();
    return parseLine(codeLine);
  });
  const result = [].concat(...calledFunctions);
  return [...new Set(result)];
}

function parseLine(codeLine) {
  const res = [];
  const openingBrackets = [];
  for (let i = 0; i < codeLine.length; i++) {
    let ch = codeLine[i];
    if (ch === "(") {
      openingBrackets.push(i);
    } else if (ch === ")") {
      if (openingBrackets.length != 0) {
        let word = wordEndingAt(codeLine, openingBrackets.at(-1));
        let paramCount = paramInFunc(codeLine, openingBrackets.at(-1), i);
        if (word !== "") {
          res.push({ funcName: word, paramCount: paramCount });
        }
        openingBrackets.pop();
      }
    }
  }
  return [...new Set(res.filter((func) => /^[a-zA-Z_]+$/.test(func.funcName)))];
}

function paramInFunc(codeLine, start, end) {
  let cnt = 0;
  let enclose = false;
  let nonspace = false;
  for (let i = start + 1; i < end; i++) {
    if (codeLine[i] === "," && enclose === false) {
      cnt++;
    }
    if (codeLine[i] === '"') {
      enclose = !enclose;
    }
    if (codeLine[i] !== " ") {
      nonspace = true;
    }
  }
  if (!(cnt === 0 && nonspace === false)) {
    cnt++;
  }
  return cnt;
}

function wordEndingAt(str, index) {
  for (let i = index - 1; i >= 0; i--) {
    if (str[i] === " " || str[i] === "." || str[i] === "(") {
      return str.substring(i + 1, index);
    }
  }
  return str.substring(0, index);
}

exports.getFunctionCalled = getFunctionCalled;
exports.getBody = getBody;
