const fetch = require("node-fetch");

const fetchQuery = (query, variables) => {
  return fetch("http://127.0.0.1:7080/.api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `token ${process.env.ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
  }).then((res) => res.json());
};

exports.fetchQuery = fetchQuery;
