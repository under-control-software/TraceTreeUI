import React from "react";
import { File, ArrowRight } from "phosphor-react";
import { Radio } from "antd";

const Options = (props) => {
  return (
    <div
      style={{
        border: props.radioValue === props.e ? "2px solid white" : "",
        // add a glowing shadow
        boxShadow: props.radioValue === props.e ? "0px 0px 10px white" : "",
      }}
      className={`card card-${Math.floor(props.ind % 5) + 1}`}
    >
      <Radio
        value={props.e}
        style={{ cursor: "pointer" }}
        onClick={() => {
          props.setOption(props.e);
        }}
      >
        {" "}
        <div className="file-name-cont">
          <File size={18} className="card__icon" weight="bold" />{" "}
          {/* trim the file to max of length 30 */}
          {props.e.file.substring(0, 30)}
        </div>
        <div className="file-link-cont">
          <span className="preview">{props.e.preview}...</span>
          <a className="code-prev" href={props.e.url} target="_blank">
            <ArrowRight size={20} weight="bold" />
          </a>
        </div>
      </Radio>
    </div>
  );
};

export default Options;
