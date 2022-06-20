import React, { Component, useState } from "react";
import "./App.css";
import { Radio } from "antd";
import Graph from "react-graph-network";
const { queries } = require("./utils/queries");
const { fetchQuery } = require("./utils/fetchQuery");

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
      hover: false,
      curNode: null,
      option: null,
    };

    this.run = this.run.bind(this);
    this.Node = this.Node.bind(this);
    this.display = this.display.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  display = (node) => {
    this.setState({
      curNode: node,
    });
  };

  Node = ({ node }) => {
    const fontSize = 14;
    const radius = 10;
    let color = node.start ? "red" : "black";
    if (!node.data) {
      color = "blue";
    }

    const sizes = {
      radius: radius,
      textSize: fontSize,
      textX: radius * 1.5,
      textY: radius / 2,
    };

    const hoverBox = () => {
      this.display(node);
    };

    return (
      <a
        id="node"
        onClick={() => {
          if (node.data) {
            hoverBox();
          } else {
            this.display(null);
          }
        }}
      >
        <circle fill={`${color}`} stroke="black" r={sizes.radius} />
        <g style={{ fontSize: sizes.textSize + "px" }}>
          <text x={sizes.radius + 7} y={sizes.radius / 2}>
            {node.name + "()"}
          </text>
        </g>
      </a>
    );
  };

  run() {
    var funcName = document.getElementById("func-name").value;
    funcName = "getAccessControlAllowCredentials";
    var numArgs = document.getElementById("num-args").value;
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
            data: this.state.data.get(key),
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

  onChange = (e) => {
    this.setState({
      option: e.target.value,
    });
  };

  selectOption = () => {
    if (!this.state.option) {
      alert("Please select an option");
      return;
    }
    // console.log(this.state.option);
    // TODO: write the remaining logic here after the user selects a match
    fetch("/api/expandgraph", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        option: JSON.stringify(this.state.option),
        adjList: JSON.stringify(Array.from(this.state.adjList.entries())),
        data: JSON.stringify(Array.from(this.state.data.entries())),
        registry: JSON.stringify(Array.from(this.state.registry.entries())),
        reverseReg: JSON.stringify(Array.from(this.state.reverseReg.entries())),
      }),
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
        });
        const nodes = {
          nodes: [],
          links: [],
        };
        this.state.adjList.forEach((value, key) => {
          nodes.nodes.push({
            id: key,
            name: this.state.reverseReg.get(key),
            data: this.state.data.get(key),
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
  };

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <div className="App-title">TraceTree</div>
        </div>
        <br></br>
        <label>Function name: </label>
        <input
          type="text"
          size={31}
          id="func-name"
          style={{ fontSize: "1.1em" }}
        />
        <br></br>
        <br></br>
        <label>Number of arguments: </label>
        <input
          type="text"
          size={4}
          id="num-args"
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
        <br></br>
        {!this.state.nodes ? null : (
          <div style={{ height: "80vh", display: "flex", width: "100%" }}>
            <div className="left-box">
              <Graph
                data={this.state.nodes}
                NodeComponent={this.Node}
                LineComponent={Line}
                nodeDistance={500}
                zoomDepth={0}
                hoverOpacity={0.3}
                enableDrag={true}
                pullIn={false}
              />
            </div>
            <div className="right-box">
              <div id="hover-box">
                <div style={{ fontSize: "1.2em" }}>
                  Select the correct reference
                </div>
                <div className="radio-buttons">
                  <br></br>
                  <Radio.Group onChange={this.onChange}>
                    {this.state.curNode
                      ? this.state.curNode.data.map((e) => {
                          return (
                            <div>
                              <Radio value={e}>File: {e.file}</Radio>
                              <div style={{ fontSize: "0.88em" }}>
                                <a href={e.url}>Line:</a> {e.preview}
                              </div>
                              <br></br>
                            </div>
                          );
                        })
                      : null}
                  </Radio.Group>
                  <br></br>
                  {this.state.curNode ? (
                    <div style={{ textAlign: "center" }}>
                      <button
                        onClick={this.selectOption}
                        style={{ fontSize: "1.2em" }}
                      >
                        Select
                      </button>
                      <br></br>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
        <br></br>
      </div>
    );
  }
}

export default App;
