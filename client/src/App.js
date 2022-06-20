import React, { Component } from "react";
import "./App.css";
import Graph from "react-graph-network";

const Node = ({ node }) => {
  const fontSize = 14;
  const radius = 10;
  const color = node.start ? "red" : "black";

  const sizes = {
    radius: radius,
    textSize: fontSize,
    textX: radius * 1.5,
    textY: radius / 2,
  };

  return (
    <a href={node.url}>
      <circle fill={`${color}`} stroke="black" r={sizes.radius} />
      <g style={{ fontSize: sizes.textSize + "px" }}>
        <text x={sizes.radius + 7} y={sizes.radius / 2}>
          {node.name + "()"}
        </text>
      </g>
    </a>
  );
};

const Line = ({ link, ...restProps }) => {
  return <line {...restProps} stroke="grey" />;
};

// getAccessControlAllowCredentials

class App extends Component {
  constructor() {
    super();
    this.state = {
      message: "",
      adjList: new Map(),
      registry: new Map(),
      data: new Map(),
      reverseReg: new Map(),
      start: null,
      nodes: null,
    };

    this.run = this.run.bind(this);
  }

  run() {
    const funcName = document.getElementById("func-name").value;
    if (funcName === "" || !funcName) {
      alert("Please enter a function name");
      return;
    }
    this.setState({
      message: "Please wait...",
    });
    fetch("/api/generategraph", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: funcName }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        this.setState({
          message:
            "Graph Generated. Click on the nodes to uncover more details.",
          adjList: new Map(JSON.parse(data.adjList)),
          registry: new Map(JSON.parse(data.registry)),
          data: new Map(JSON.parse(data.data)),
          reverseReg: new Map(JSON.parse(data.reverseReg)),
          start: data.start,
        });
        const nodes = {
          nodes: [],
          links: [],
        };
        this.state.adjList.forEach((value, key) => {
          nodes.nodes.push({
            id: key,
            name: this.state.reverseReg.get(key),
            url: this.state.data.get(key),
            start: this.state.start === key,
          });
          value.map((e) => {
            nodes.links.push({ source: key, target: e });
          });
        });
        this.setState({
          nodes: nodes,
        });
      });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <div className="App-title">TraceTree</div>
        </div>
        <br></br>
        <label>Enter function name: </label>
        <input
          type="text"
          size={31}
          id="func-name"
          style={{ fontSize: "1.1em" }}
        />
        <br></br>
        <br></br>
        <button style={{ fontSize: "1.1em" }} onClick={this.run}>
          Run
        </button>
        <br></br>
        <div style={{ textAlign: "center", fontSize: "1.2em" }}>
          {this.state.message}
        </div>
        {!this.state.nodes ? null : (
          <div style={{ height: "100vh" }}>
            <Graph
              data={this.state.nodes}
              NodeComponent={Node}
              LineComponent={Line}
              nodeDistance={500}
              zoomDepth={0}
              hoverOpacity={0.3}
              enableDrag={true}
              pullIn={false}
            />
          </div>
        )}
      </div>
    );
  }
}

export default App;
