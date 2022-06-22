import React, { Component, Fragment } from "react";
import "./App.css";
import { Radio, Switch } from "antd";
import Graph from "react-graph-network";
import footer from "./assets/footer.png";
import Tree from "react-d3-tree";
import LoadingSpin from "react-loading-spin";
import {
  MagnifyingGlass,
  TreeStructure,
  File,
  ArrowRight,
  CaretRight,
  CaretLeft,
  TreeEvergreen,
  Graph as GraphIcon,
  Tree as TreeIcon,
  X,
} from "phosphor-react";

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
      hover: false,
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

    this.run = this.run.bind(this);
    this.Node = this.Node.bind(this);
    this.display = this.display.bind(this);
    this.displayTreeNode = this.displayTreeNode.bind(this);
    this.onChange = this.onChange.bind(this);
    this.changeNode = this.changeNode.bind(this);
  }

  changeNode = (e) => {
    console.log(e);
    const data = this.state.data.get(e._id);
    console.log(data);
    if (
      (e.attributes && e.attributes.Branch) ||
      (e.attributes && e.attributes.Definition)
    ) {
      this.setState({
        option: null,
      });
      this.setState({
        displayBox: false,
      });
      this.setState({
        viewRight: false,
      });
    } else {
      if (data.length === 1) {
        this.setState({
          option: data[0],
        });
      } else {
        this.setState({
          option: null,
        });
      }
      this.setState({
        displayBox: true,
      });
      if (data) {
        this.displayTreeNode(e);
      } else {
        this.display(null);
      }
      this.setState({
        viewRight: true,
      });
      const int = setInterval(() => {
        if (data.length === 1 && !this.state.processed.includes(e._id)) {
          this.selectOption();
          clearInterval(int);
        }
      }, 300);
    }
  };

  displayTreeNode = (e) => {
    const node = {
      id: e._id,
      data: this.state.data.get(e._id),
    };
    this.display(node);
  };

  display = (node) => {
    if (!node) {
      this.setState({
        curNode: null,
      });
      return;
    }
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
            this.display(node);
          } else {
            this.display(null);
          }
          this.setState({
            viewRight: true,
          });
          const int = setInterval(() => {
            if (
              node.data.length === 1 &&
              !this.state.processed.includes(node.id)
            ) {
              this.selectOption();
              clearInterval(int);
            }
          }, 300);
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
    // funcName = "getAccessControlAllowCredentials";
    funcName = "purgeUnreferencedEntries";
    var numArgs = parseInt(document.getElementById("num-args").value);
    numArgs = 0;
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
          treeStructure: JSON.parse(data.treeStructure),
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
        this.setState({
          viewRight: false,
        });
        this.scrollToMyRef();
        console.log(this.state.nodes);
      });
  }

  onChange = (e) => {
    console.log(e.target.value);
    this.setState({
      option: e.target.value,
    });
  };

  selectOption = (opt = null) => {
    if (!this.state.option && !opt) {
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

    this.setState({
      displayBox: false,
      message: "Please wait...",
    });

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
        this.setState({
          message:
            "Graph Generated. Click on the nodes to uncover more details.",
          adjList: new Map(JSON.parse(data.adjList)),
          registry: new Map(JSON.parse(data.registry)),
          data: new Map(JSON.parse(data.data)),
          reverseReg: new Map(JSON.parse(data.reverseReg)),
          processed: JSON.parse(data.processed),
          treeStructure: JSON.parse(data.treeStructure),
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
        this.setState({
          viewRight: false,
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
                placeholder="Function Name"
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

          {!this.state.nodes && (
            <div className="footer-image-cont">
              <img src={footer} alt="footer" className="footer-image" />
            </div>
          )}
        </div>

        {this.state.nodes && this.state.messageShowing && (
          <div className={"message-banner"}>
            <div className="message-text">{this.state.message}</div>
            <div
              className="cross-button"
              onClick={() => {
                this.setState({
                  messageShowing: false,
                });
              }}
            >
              <X size={20} weight="duotone" />
            </div>
          </div>
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

            <div
              style={{
                height: "80vh",
                display: "flex",
                width: "100%",
                gap: "0",
              }}
            >
              {this.state.displayGraph ? (
                <div
                  className="left-box"
                  style={{
                    fontSize: "0.8em",
                    fontWeight: "lighter",
                    letterSpacing: "1px",
                  }}
                >
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
                    zoomDepth={2}
                    hoverOpacity={0.3}
                    enableDrag={true}
                    pullIn={false}
                  />
                </div>
              ) : (
                <div
                  className="left-box"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "14px",
                    fontWeight: "100",
                    letterSpacing: "1px",
                  }}
                >
                  <Tree
                    data={this.state.treeStructure}
                    orientation="vertical"
                    circleRadius="10"
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
                {this.state.displayBox ? (
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
          </div>
        )}
        <br></br>
        <div ref={this.myRef}></div>
      </div>
    );
  }
}

export default App;
