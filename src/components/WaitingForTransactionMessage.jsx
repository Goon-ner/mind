import React from "react";

const WaitingForTransactionMessage = ({ txHash }) => {
  return (
    <div>
      Waiting for transaction <strong>{txHash.slice(0,4)+ '...'+txHash.slice(39,42) }</strong>
    </div>
  );
};

export default WaitingForTransactionMessage;