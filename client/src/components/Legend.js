import React from "react";

const Legend = () => {
  return (
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
        <div className="index-item-text">Intermediate or Terminal Nodes</div>
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
  );
};

export default Legend;
