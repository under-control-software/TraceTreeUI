import React, { Component, useState } from "react";
import "./App.css";
import { Radio } from "antd";
import Graph from "react-graph-network";
import footer from "./assets/footer.png";
import {
  MagnifyingGlass,
  TreeStructure,
  File,
  ArrowRight,
  CaretRight,
  CaretLeft,
  Tree,
  TreeEvergreen,
} from "phosphor-react";

const Line = ({ link, ...restProps }) => {
  return <line {...restProps} stroke="grey" />;
};

// getAccessControlAllowCredentials

class App extends Component {
  constructor() {
    super();
    this.myRef = React.createRef();
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
      displayBox: true,
      viewRight: false,
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
    // console.log(node);
    const fontSize = 14;
    const radius = 10;
    let color = node.start ? "red" : "black";
    if (!this.state.processed.includes(node.id)) {
      color = "yellow";
    }
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
          if (node.data.length === 1) {
            this.setState({
              option: node.data[0],
            });
          } else {
            this.setState({
              option: null,
            });
          }
          this.setState({
            displayBox: true,
          });
          if (node.data) {
            hoverBox();
          } else {
            this.display(null);
          }
          this.setState({
            viewRight: true,
          });
        }}
      >
        <circle fill={`${color}`} stroke="black" r={sizes.radius} />
        <g style={{ fontSize: sizes.textSize + "px" }}>
          <text x={sizes.radius + 7} y={sizes.radius / 2}>
            {node.name.funcName + "(" + node.name.paramCount + " arg(s))"}
          </text>
        </g>
      </a>
    );
  };
  scrollToMyRef = () =>
    window.scrollTo({ top: this.myRef.current.offsetTop, behavior: "smooth" });
  run() {
    var funcName = document.getElementById("func-name").value;
    // console.log(funcName);
    // funcName = "getAccessControlAllowCredentials";
    // funcName = "purgeUnreferencedEntries";
    // console.log(funcName);
    var numArgs = parseInt(document.getElementById("num-args").value);
    // console.log(numArgs);
    // console.log(typeof(numArgs));
    // numArgs = 0;
    // console.log(typeof(numArgs));
    if (funcName === "" || !funcName) {
      alert("Please enter a function name");
      return;
    }
    this.setState({
      message: "Please wait...",
      displayBox: false,
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
        console.log(res);
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
        this.scrollToMyRef();
      });
  }

  onChange = (e) => {
    console.log(e.target.value);
    this.setState({
      option: e.target.value,
    });
  };

  selectOption = () => {
    if (!this.state.option) {
      alert("Please select an option");
      return;
    }
    console.log("global option", this.state.curNode);
    let parentid;
    if (this.state.curNode.data.length === 1) {
      parentid = "";
    } else {
      this.state.adjList.forEach((value, key) => {
        if (value.includes(this.state.curNode.id)) {
          parentid = key;
        }
      });
    }
    console.log(this.state.curNode.id);
    console.log(parentid);
    console.log(this.state.registry);
    this.setState({
      displayBox: false,
      message: "Please wait...",
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
        start: this.state.start,
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
        <div className={`header-search ${this.state.nodes && "nav-search"}`}>
          <div className={`App-header ${this.state.nodes && "nav-App-header"}`}>
            <div className={`App-title ${this.state.nodes && "nav-App-title"}`}>
              Trace
              <span
                className={`header-icon ${
                  this.state.nodes && "nav-header-icon"
                }`}
              >
                <TreeEvergreen size={50} weight="duotone" />
              </span>
              ree
            </div>
            {!this.state.nodes && (
              <div className="sub-title">
                Search <ArrowRight size={14} /> Trace <ArrowRight size={14} />{" "}
                Debug
              </div>
            )}
          </div>

          <div
            className={`search-cont ${this.state.nodes && "nav-search-cont"}`}
          >
            {/* <label>
                Function name: <span style={{ color: "white" }}>..</span>
              </label> */}

            <input
              type="text"
              size={31}
              id="func-name"
              className={`name-search-bar ${
                this.state.nodes && "nav-name-search-bar"
              }`}
              placeholder="Search Function by Name"
            />

            {/* <label>
              Number of arguments: <span style={{ color: "white" }}>..</span>
            </label> */}
            <input
              type="number"
              size={8}
              id="num-args"
              className={`search-bar num-bar ${
                this.state.nodes && "nav-num-bar"
              }`}
              placeholder="Number of Arguments"
            />
            <button
              className={`run-button ${this.state.nodes && "nav-run-button"}`}
              onClick={this.run}
            >
              <TreeStructure size={25} weight="bold" />
            </button>
          </div>
          {!this.state.nodes && (
            <div className="footer-image-cont">
              <img src={footer} alt="footer" className="footer-image" />
            </div>
          )}
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
              <div className="index-box">
                <div className="index-item">
                  <div
                    className="index-item-icon"
                    style={{ backgroundColor: "red" }}
                  ></div>
                  <div className="index-item-text">Root-Node</div>
                </div>

                <div className="index-item">
                  <div
                    className="index-item-icon"
                    style={{ backgroundColor: "yellow" }}
                  ></div>
                  <div className="index-item-text">Expandable Nodes</div>
                </div>
                <div className="index-item">
                  <div
                    className="index-item-icon"
                    style={{ backgroundColor: "black" }}
                  ></div>
                  <div className="index-item-text">
                    Intermediate or Terminal Nodes
                  </div>
                </div>
                <div className="index-item">
                  <div
                    className="index-item-icon"
                    style={{ backgroundColor: "blue" }}
                  ></div>
                  <div className="index-item-text">
                    Function Declaration do not exist in repo.
                  </div>
                </div>
              </div>
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
            <div
              className="expander"
              onClick={() => {
                this.setState({
                  viewRight: !this.state.viewRight,
                });
              }}
            >
              {this.state.viewRight ? (
                <CaretRight size={15} weight="bold" />
              ) : (
                <CaretLeft size={15} weight="bold" />
              )}
            </div>

            <div
              className={`right-box ${
                !this.state.viewRight && "right-box-closed"
              }`}
            >
              <div style={{ fontSize: "1.2em", color: "white" }}>
                <b>Please select the correct reference</b>
              </div>
              {this.state.displayBox ? (
                <div>
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
                                  border:
                                    this.state.radioValue === e
                                      ? "2px solid white"
                                      : "",
                                  // add a glowing shadow
                                  boxShadow:
                                    this.state.radioValue === e
                                      ? "0px 0px 10px white"
                                      : "",
                                }}
                                className={`card card-${
                                  Math.floor(ind % 5) + 1
                                }`}
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
                                  <div className="file-name-cont">
                                    <File
                                      size={18}
                                      className="card__icon"
                                      weight="bold"
                                    />{" "}
                                    {/* trim the file to max of length 30 */}
                                    {e.file.substring(0, 30)}
                                  </div>
                                  <div className="file-link-cont">
                                    <span className="preview">
                                      {e.preview}...
                                    </span>
                                    <a
                                      className="code-prev"
                                      href={e.url}
                                      target="_blank"
                                    >
                                      <ArrowRight size={20} weight="bold" />
                                    </a>
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
              ) : null}
            </div>
          </div>
        )}
        <br></br>
        <div ref={this.myRef}></div>
      </div>
    );
  }
}

export default App;
