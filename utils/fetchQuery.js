const fetch = require("node-fetch");

const fetchQuery = (query, variables) => {
    return fetch(`${process.env.SOURCEGRAPH_ENDPOINT}/.api/graphql`, {
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
