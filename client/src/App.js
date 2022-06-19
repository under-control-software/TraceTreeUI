import React, { Component } from "react";
import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {
      message: "Click on the button to initiate",
    };
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">TraceTree</h1>
        </header>
        <br></br>
        <br></br>
        <button
          onClick={() => {
            this.setState({
              message: "Please wait...",
            });
            fetch("/api/generategraph")
              .then((res) => res.json())
              .then((data) => {
                this.setState({
                  message: data.response,
                });
              });
          }}
        >
          Run
        </button>
        <br></br>
        <br></br>
        <div style={{ textAlign: "center", fontSize: "1.2em" }}>
          {this.state.message}
        </div>
      </div>
    );
  }
}

export default App;
