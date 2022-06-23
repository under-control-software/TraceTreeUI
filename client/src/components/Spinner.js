import React from "react";
import LoadingSpin from "react-loading-spin";

const Spinner = () => {
  return (
    <div className="spinner-left">
      <LoadingSpin
        primaryColor={"#408efd"}
        secondaryColor={"hsl(191, 75%, 60%)"}
      />
    </div>
  );
};

export default Spinner;
