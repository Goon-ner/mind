import React, { useState } from "react";
import { ethers } from "ethers";
import { NavLink } from 'react-router-dom';
import Modal from 'react-modal';
import ConnectWallet from "./ConnectWallet";
import WaitingForTransactionMessage from "./WaitingForTransactionMessage";
import TransactionErrorMessage from "./TransactionErrorMessage";


const Header = ({
    currentConnection,
    _connectWallet,
    networkError,
    dismissNet,
    dismissTx,
    txBeingSent,
    handleMintNft,
    transactionError,
    currentBalance
  }) => {

    const [mintModal, setMintModal] = useState(false)

    
    const openMint = () => {
      setMintModal(true);
    };
    const closeMint = () => {
      setMintModal(false);
      
    }
    const _onSubmit = (event) => {
      closeMint()
      handleMintNft(event)
    }

    const _getRpcErrorMessage = (error) => {
      console.log(error);
      if (error.data) {
        return error.data.code;
      }
  
      return error.code;
    };

    const mintModalContent = (
        <div className="modalContent">
          <h2>Mint NFT</h2>
          <form className="modalForm" onSubmit={(event) => _onSubmit(event)}>
            <input type="text" placeholder="Paste image URL" name="tokenUri" />
            <input className="formSubmit" type="submit" value="Mint NFT" />
          </form>
          <button onClick={closeMint}>Close</button>
        </div>
      );

    return (
      <div className="header">
        {!currentConnection?.signer && (
          <div className="header-not-connect">
            <NavLink to='/' className="header-not-connect-title">
              <h2>Open mind</h2>
              <h3>The easiest way<p>to mint NFT</p></h3>
            </NavLink>
            <ConnectWallet
            connectWallet={_connectWallet}
            networkError={networkError}
            dismiss={dismissNet}
            />
          </div>
        )}
          {currentConnection?.signer && (
          <div className="header-connected">
              <NavLink to='/' className="header-connected-title">
                <h2>Open mind</h2>
                <h3>The easiest way<p>to mint NFT</p></h3>
              </NavLink>
            <div className="header-main">
              <div className="headerButtons">
                <div>
                  <button className="headerMint" onClick={openMint}>Mint NFT</button>
                </div>
                <NavLink to="/account"><button className="headerAcc">My Account</button></NavLink>
              </div>
              <div className="wallet">
                <div>Your address: {currentConnection.signer.address.slice(0,4)+'...'+currentConnection.signer.address.slice(39,42)}</div>
                {currentBalance && (
                  <div>Your balance: {Number((ethers.formatEther(currentBalance))).toFixed(4)} POL</div>
                )}
                {txBeingSent && <WaitingForTransactionMessage txHash={txBeingSent} />}
                {transactionError && (
                  <TransactionErrorMessage
                  message={_getRpcErrorMessage(transactionError)}
                  dismiss={dismissTx}
                  />
              )}
              </div>
            </div>
          </div>
          )}
          <Modal className="modal" ariaHideApp={false} isOpen={mintModal} onRequestClose={closeMint}>
            {mintModalContent}
          </Modal>
      </div>
    )
}
export default Header