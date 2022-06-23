const queries = [
  // get username and repository name
  `
    query getDetails($numRepo: Int){
      currentUser {
        username
        url
      }
      repositories(first: $numRepo) {
        nodes {
          name
        }
      }
    }
  `,
  // get search results with regexp (version: V2) or literal (version: V1)
  `
    query ($query: String!) {
        search(query: $query, version: V2) {
          results {
            results {
              __typename
              ... on FileMatch {
                ...FileMatchFields
              }
            }
            matchCount
          }
        }
      }
      
      fragment FileMatchFields on FileMatch {
        repository {
          name
          url
        }
        file {
          name
          path
          url
        }
        lineMatches {
          preview
          lineNumber
          offsetAndLengths
        }
      }
    `,
];

exports.queries = queries;
