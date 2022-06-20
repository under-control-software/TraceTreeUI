const { fetchQuery } = require("./fetchQuery");
const { queries } = require("../queries");

// async function tracetree(funcName) {
//   const res = await getBody(funcName);
//   // console.log("in trace", res);
//   const results = res.data.search.results.results;
//   if (!results || results.length === 0) {
//     return { url: "", funcCalled: [] };
//   }
//   const url =
//     "http://localhost:7080" +
//     results[0].file.url +
//     "?L" +
//     (results[0].lineMatches[0].lineNumber + 1);
//   const funcCalled = getFunctionCalled(results);
//   return { url, funcCalled };
// }

async function getBody(funcName) {
  // getFirst(:[~[\s*\w*\s*]+]) {...}
  query = `
    context:global repo:^github.com/spring-projects/spring-framework$ 
    :[~\\s]${funcName}(...) {...} count:all
    patternType:structural case:yes
    `;

  const res = await fetchQuery(queries[1], { query: query });
  return res.data.search.results.results;
}

function getFunctionCalled(funcBody) {
  if (!funcBody || funcBody.length === 0) {
    return [];
  }
  // using only first match
  const value = funcBody[0];
  value.lineMatches.shift();
  calledFunctions = value.lineMatches.map((line, _) => {
    const codeLine = line.preview.trim();
    return parseLine(codeLine);
  });
  return [].concat(...calledFunctions);
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
        if (word !== "") {
          res.push(word);
        }
        openingBrackets.pop();
      }
    }
  }
  return [... new Set(res.filter(name => /^[a-zA-Z_]+$/.test(name)))];
}

function wordEndingAt(str, index) {
  for (let i = index - 1; i >= 0; i--) {
    if (str[i] === " " || str[i] === "." || str[i] === "(") {
      return str.substring(i + 1, index);
    }
  }
  return str.substring(0, index);
}

// exports.tracetree = tracetree;
exports.getFunctionCalled = getFunctionCalled;
exports.getBody = getBody;
