import React, { Component, useState } from "react";
import "./App.css";
import { Radio } from "antd";
import Graph from "react-graph-network";
import { MagnifyingGlass } from "phosphor-react";

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
      selectValid: true,
      radioValue: "",
      processed: [],
    };

    this.run = this.run.bind(this);
    this.Node = this.Node.bind(this);
    this.display = this.display.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  display = (node) => {
    this.setState({
      curNode: node,
      selectValid:
        node.data.length === 0 || this.state.processed.includes(node.id)
          ? false
          : true,
      radioValue: node.data && node.data.length == 1 ? node.data[0] : "",
    });
  };

  Node = ({ node }) => {
    const fontSize = 14;
    const radius = 10;
    let color = node.start ? "red" : "black";
    if (!node.data || node.data.length === 0) {
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
        style={{ cursor: "pointer" }}
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
            {node.name.funcName + "()"}
          </text>
        </g>
      </a>
    );
  };

  run() {
    var funcName = document.getElementById("func-name").value;
    funcName = "getAccessControlAllowCredentials";
    // funcName = "purgeUnreferencedEntries";
    var numArgs = document.getElementById("num-args").value;
    numArgs = 0;
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
      body: JSON.stringify({ name: funcName, paramCount: numArgs }),
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
          processed: JSON.parse(data.processed),
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
    let parentid;
    this.state.adjList.forEach((value, key) => {
      if (value.includes(this.state.curNode.id)) {
        parentid = key;
      }
    });

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
        processed: JSON.stringify(this.state.processed),
        paramCount: this.state.reverseReg.get(this.state.curNode.id).paramCount,
        parent: parentid,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data.adjList);
        this.setState({
          message:
            "Graph Generated. Click on the nodes to uncover more details.",
          adjList: new Map(JSON.parse(data.adjList)),
          registry: new Map(JSON.parse(data.registry)),
          data: new Map(JSON.parse(data.data)),
          reverseReg: new Map(JSON.parse(data.reverseReg)),
          processed: JSON.parse(data.processed),
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
        <div className="header-search">
          <div className="App-header">
            <div className="App-title">
              <b>TraceTree</b>
            </div>
          </div>

          <div className="search-cont">
            {/* <label>
                Function name: <span style={{ color: "white" }}>..</span>
              </label> */}

            <input
              type="text"
              size={31}
              id="func-name"
              className="name-search-bar"
              placeholder="Search Function by Name"
            />

            {/* <label>
              Number of arguments: <span style={{ color: "white" }}>..</span>
            </label> */}
            <input
              type="number"
              size={8}
              id="num-args"
              className="search-bar num-bar"
              placeholder="Number of Arguments"
            />
            <button className="run-button" onClick={this.run}>
              Run
            </button>
          </div>
        </div>
        <br></br>
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
              <div style={{ fontSize: "1.2em" }}>
                <b>Please select the correct reference</b>
              </div>
              <div className="radio-buttons">
                <br></br>
                <Radio.Group
                  onChange={this.onChange}
                  value={this.state.radioValue}
                >
                  {this.state.curNode
                    ? this.state.curNode.data.map((e, ind) => {
                        return (
                          <div
                            style={{
                              backgroundColor: ind % 2 ? "#408ffd3a" : "white",
                              padding: "0.2rem",
                              border:
                                this.state.radioValue === e
                                  ? "2px solid #408efd"
                                  : "",
                              borderRadius: "5px",
                            }}
                          >
                            <Radio
                              value={e}
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                this.setState({
                                  radioValue: e,
                                });
                              }}
                            >
                              {" "}
                              File: {e.file}
                              <div
                                style={{
                                  fontSize: "0.88em",
                                  marginTop: "3px",
                                  marginLeft: "28px",
                                  paddingBottom: "8px",
                                }}
                              >
                                <a
                                  className="code-prev"
                                  href={e.url}
                                  target="_blank"
                                >
                                  Line
                                </a>
                                : {e.preview}...
                              </div>
                            </Radio>
                          </div>
                        );
                      })
                    : null}
                </Radio.Group>
                <br></br>
                {this.state.curNode && this.state.selectValid ? (
                  <div style={{ textAlign: "center" }}>
                    <button
                      className="select-button"
                      onClick={this.selectOption}
                    >
                      Select
                    </button>
                    <br></br>
                  </div>
                ) : null}
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
