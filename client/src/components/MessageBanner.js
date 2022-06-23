import React from "react";
import { X } from "phosphor-react";

const MessageBanner = (props) => {
  return (
    <div className={"message-banner"}>
      <div className="message-text">{props.message}</div>
      <div
        className="cross-button"
        onClick={() => {
          props.showMessage(false);
        }}
      >
        <X size={20} weight="duotone" />
      </div>
    </div>
  );
};

export default MessageBanner;
