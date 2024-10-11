import React from "react";
import NetworkErrorMessage from "./NetworkErrorMessage";


const ConnectWallet = ({
  connectWallet,
  networkError,
  dismiss,
}) => {
  return (
    <div>
      <div>
        {networkError && (
          <NetworkErrorMessage message={networkError} dismiss={dismiss} />
        )}
      </div>

      <p>Please connect your account...</p>
      <button type="button" onClick={connectWallet}>
        Connect wallet!!!
      </button>
    </div>
  );
};

export default ConnectWallet;