import React, { Component } from "react";
import "./App.css";
import Graph from "react-graph-network";
import Tree from "react-d3-tree";
import LoadingSpin from "react-loading-spin";
import { Radio } from "antd";
import {
  TreeStructure,
  ArrowRight,
  CaretRight,
  CaretLeft,
  TreeEvergreen,
  Graph as GraphIcon,
  Tree as TreeIcon,
} from "phosphor-react";
import MessageBanner from "./components/MessageBanner";
import Legend from "./components/Legend";
import Footer from "./components/Footer";
import Spinner from "./components/Spinner";
import Options from "./components/Options";

const Line = ({ link, ...restProps }) => {
  return <line {...restProps} stroke="grey" />;
};

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
      curNode: null,
      option: null,
      selectValid: true,
      radioValue: "",
      processed: [],
      displayBox: true,
      viewRight: false,
      treeStructure: null,
      displayGraph: false,
      messageShowing: true,
    };

    this.onChangeRadio = this.onChangeRadio.bind(this);
    this.displayTreeNode = this.displayTreeNode.bind(this);
    this.setInterval = this.setInterval.bind(this);
    this.display = this.display.bind(this);
    this.run = this.run.bind(this);
    this.changeNode = this.changeNode.bind(this);
    this.fetchCall = this.fetchCall.bind(this);
  }

  Node = ({ node }) => {
    let color = node.start ? "red" : "black";
    if (!this.state.processed.includes(node.id)) {
      color = "yellow";
    }
    if (!node.data || node.data.length === 0) {
      color = "blue";
    }

    const sizes = {
      radius: 10,
      textSize: 14,
    };

    return (
      <a
        style={{ cursor: "pointer" }}
        id="node"
        onClick={() => {
          this.setState({
            option: node.data.length === 1 ? node.data[0] : null,
            displayBox: true,
            viewRight: true,
          });
          this.display(node);
          this.setInterval(node.data, node.id);
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

  onChangeRadio = (e) => {
    this.setState({
      option: e.target.value,
    });
  };

  displayTreeNode = (e) => {
    const node = {
      id: e._id,
      data: this.state.data.get(e._id),
    };
    this.display(node);
  };

  setInterval = (data, id) => {
    const int = setInterval(() => {
      if (data.length === 1 && !this.state.processed.includes(id)) {
        this.selectOption();
        clearInterval(int);
      }
    }, 300);
  };

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

  changeNode = (e) => {
    const data = this.state.data.get(e._id);
    if (e.attributes && (e.attributes.Branch || e.attributes.Definition)) {
      this.setState({
        option: null,
        displayBox: false,
        viewRight: false,
      });
    } else {
      this.setState({
        option: data.length === 1 ? data[0] : null,
        displayBox: true,
        viewRight: true,
      });
      this.displayTreeNode(e);
      this.setInterval(data, e._id);
    }
  };

  run() {
    var funcName = document.getElementById("func-name").value;
    // funcName = "getAccessControlAllowCredentials";
    // funcName = "purgeUnreferencedEntries";
    var numArgs = parseInt(document.getElementById("num-args").value);
    // numArgs = 0;
    if (funcName === "" || !funcName) {
      alert("Please enter a function name");
      return;
    }
    if (isNaN(numArgs) || numArgs < 0) {
      alert("Please enter valid number of arguments for the function");
      return;
    }
    const body = { name: funcName, paramCount: numArgs };
    this.fetchCall(body, "/api/generategraph");
  }

  fetchCall = (body, url) => {
    this.setState({
      displayBox: false,
      message: "Please wait...",
    });

    fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          message:
            "Graph Generated. Click on the nodes to uncover more details.",
          adjList: new Map(JSON.parse(data.adjList)),
          registry: new Map(JSON.parse(data.registry)),
          data: new Map(JSON.parse(data.data)),
          reverseReg: new Map(JSON.parse(data.reverseReg)),
          processed: JSON.parse(data.processed),
          treeStructure: JSON.parse(data.treeStructure),
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
          viewRight: false,
        });
        this.scrollToMyRef();
      });
  };

  selectOption = () => {
    if (!this.state.option) {
      alert("Please select an option");
      return;
    }

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

    const body = {
      option: JSON.stringify(this.state.option),
      adjList: JSON.stringify(Array.from(this.state.adjList.entries())),
      data: JSON.stringify(Array.from(this.state.data.entries())),
      registry: JSON.stringify(Array.from(this.state.registry.entries())),
      reverseReg: JSON.stringify(Array.from(this.state.reverseReg.entries())),
      processed: JSON.stringify(this.state.processed),
      paramCount: this.state.reverseReg.get(this.state.curNode.id).paramCount,
      start: this.state.start,
      parent: parentid,
    };
    this.fetchCall(body, "/api/expandgraph");
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
                <TreeEvergreen size={55} weight="duotone" />
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
          <div>
            <div
              className={`search-cont ${this.state.nodes && "nav-search-cont"}`}
            >
              <input
                type="text"
                size={31}
                id="func-name"
                className={`name-search-bar ${
                  this.state.nodes && "nav-name-search-bar"
                }`}
                placeholder="Function Name"
              />

              <input
                type="number"
                size={8}
                id="num-args"
                className={`search-bar num-bar ${
                  this.state.nodes && "nav-num-bar"
                }`}
                placeholder="Num Args"
              />
              <button
                className={`run-button ${this.state.nodes && "nav-run-button"}`}
                onClick={this.run}
              >
                <TreeStructure size={25} weight="bold" />
              </button>
            </div>
            <div
              style={{
                opacity: this.state.message === "Please wait..." ? 1 : 0.00001,
              }}
            >
              {" "}
              {!this.state.nodes && (
                <LoadingSpin
                  primaryColor={"#408efd"}
                  secondaryColor={"hsl(191, 75%, 60%)"}
                />
              )}
            </div>
          </div>

          {!this.state.nodes && <Footer />}
        </div>

        {this.state.nodes && this.state.messageShowing && (
          <MessageBanner
            message={this.state.message}
            showMessage={(value) => {
              this.setState({
                messageShowing: value,
              });
            }}
          />
        )}

        {!this.state.nodes ? null : (
          <div>
            <div
              className="selecter"
              onClick={() => {
                this.setState({
                  displayGraph: this.state.displayGraph ? false : true,
                });
              }}
            >
              <div
                className={`selecter-button ${
                  this.state.displayGraph && "selecter-selected"
                }`}
              >
                <GraphIcon size={20} />
              </div>
              <div
                className={`selecter-button ${
                  !this.state.displayGraph && "selecter-selected"
                }`}
              >
                <TreeIcon size={20} />
              </div>
            </div>

            <div className="above-left-box">
              {this.state.displayGraph ? (
                <div
                  className="left-box"
                  style={{
                    fontSize: "0.8em",
                    fontWeight: "lighter",
                    letterSpacing: "1px",
                  }}
                >
                  <Legend />
                  {this.state.message === "Please wait..." ? (
                    <Spinner />
                  ) : (
                    <Graph
                      data={this.state.nodes}
                      NodeComponent={this.Node}
                      LineComponent={Line}
                      nodeDistance={500}
                      zoomDepth={2}
                      hoverOpacity={0.3}
                      enableDrag={true}
                      pullIn={false}
                    />
                  )}
                </div>
              ) : (
                <div
                  className="left-box"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "14px",
                    fontWeight: "100",
                    letterSpacing: "1px",
                  }}
                >
                  {this.state.message === "Please wait..." ? (
                    <Spinner />
                  ) : (
                    <Tree
                      data={this.state.treeStructure}
                      orientation="vertical"
                      onClick={this.changeNode}
                      collapsible={false}
                      separation={{
                        siblings: 1,
                        nonSiblings: 1,
                      }}
                      translate={{
                        x: 500,
                        y: 100,
                      }}
                    />
                  )}
                </div>
              )}

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

                {this.state.displayBox &&
                  this.state.message !== "Please wait..." && (
                    <div>
                      <p style={{ color: "white" }}>
                        <i>
                          {this.state.reverseReg.get(this.state.curNode.id)
                            .funcName +
                            "(" +
                            this.state.reverseReg.get(this.state.curNode.id)
                              .paramCount +
                            ")"}
                        </i>
                      </p>
                      <div className="radio-buttons">
                        <br></br>
                        <Radio.Group
                          onChange={this.onChangeRadio}
                          value={this.state.radioValue}
                        >
                          {this.state.curNode
                            ? this.state.curNode.data.map((e, ind) => {
                                return (
                                  <Options
                                    radioValue={this.state.radioValue}
                                    e={e}
                                    ind={ind}
                                    setOption={(opt) => {
                                      this.setState({
                                        radioValue: opt,
                                      });
                                    }}
                                  />
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
                  )}
                {this.state.message === "Please wait..." && <Spinner />}
              </div>
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
