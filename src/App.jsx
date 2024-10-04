"use client";
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ethers } from "ethers";
// import { NewNFT__factory, NewNFTMarket__factory } from "./typechain/index.ts";
import { NewNFT__factory } from "./typechain/factories/NewNFT__factory.ts";
import { NewNFTMarket__factory } from "./typechain/factories/NewNFTMarket__factory.ts";
import NftList from "./components/nftList"
import "./styles/styles.css"
import Header from "./components/header";
import MyAccount from "./components/myAccount";

const HARDHAT_NETWORK_ID = "0x89"
const NEW_NFT_ADDRESS = "0xb13640172190f09b9223b37d9D2425dEc916d829"
const MARKET_ADDRESS = "0xAe186d642c86748EAb57E251E542a8e968D93234"
const tg = window.Telegram.WebApp

console.log(tg.initData)

export default function Home() {
  const [txBeingSent, setTxBeingSent] = useState();
  const [transactionError, setTransactionError] = useState();
  const [networkError, setNetworkError] = useState();
  const [currentConnection, setCurrentConnection] =
    useState();
  const [currentBalance, setCurrentBalance] = useState();
  const [nftList, setNftList] = useState([]);
  const [accountNft, setAccountNft] = useState([])

  const _connectWallet = async () => {
    if (window.ethereum === undefined) {
      setNetworkError("Please install Metamask!");

      return;
    }

    if (!(await _checkNetwork())) {
      return;
    }

    const [selectedAccount] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    await _initialize(ethers.getAddress(selectedAccount));

    window.ethereum.on(
      "accountsChanged",
      async ([newAccount]) => {
        if (newAccount === undefined) {
          return _resetState();
        }

        await _initialize(ethers.getAddress(newAccount));
      }
    );

    window.ethereum.on("chainChanged", ([_networkId]) => {
      _resetState();
    });
  };

  const _initialize = async (selectedAccount) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner(selectedAccount);

    if(NEW_NFT_ADDRESS && MARKET_ADDRESS ) {
      setCurrentConnection({
        ...currentConnection,
        provider,
        signer,
        newNFT: NewNFT__factory.connect(NEW_NFT_ADDRESS, signer),
        market: NewNFTMarket__factory.connect(MARKET_ADDRESS, signer),
      })
    }
  }

  useEffect(() => {
    (async () => {
      const acc = []
      if (currentConnection?.newNFT && currentConnection.signer) {
        await (currentConnection?.newNFT.nftByAddress(currentConnection.signer.address)).then((arr) => arr.map((id) => 
          id > 0 ?
          _tokenUri(Number(id)).then((val) => acc.push({tokenId:id.toString(), tokenUri: val})) : null)
      )
      setAccountNft(acc)
    } else
      console.log("No connection")})()
  },[currentConnection, txBeingSent])

  const _checkNetwork = async () => {
    const chosenChainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    console.log(chosenChainId)

    if (chosenChainId === HARDHAT_NETWORK_ID) {
      return true;
    }

    setNetworkError("Please connect to Polygon Mainnet");

    return false;
  };
  const _getPrice = async (id) => {
    if (currentConnection?.market) {
      return (await currentConnection.market.getNft(id))
    }
    return ''
  }
  const getOnSale = async () => {
    const acc = []
    if (currentConnection?.market) {
      await (currentConnection?.market.getOnSale()).then((arr) => arr.map((id) => 
        id > 0 ?
        _getPrice(id).then((val) => acc.push({tokenId:id.toString(), tokenUrl: val[0], tokenPrice: val[1].toString()})) : null)
      )
    }
    setNftList(acc)
  }
  
  useEffect(() => {
    (async () => {
      if (currentConnection?.provider && currentConnection.signer) {
        setCurrentBalance(
          (
            await currentConnection.provider.getBalance(
              currentConnection.signer.address,
              await currentConnection.provider.getBlockNumber(),
            )
          ).toString()
        )
        getOnSale()
      } else {
        console.log("No balance")
      }
    })();
  }, [currentConnection, txBeingSent])

  const _resetState = () => {
    setNetworkError(undefined);
    setTransactionError(undefined);
    setTxBeingSent(undefined);
    setCurrentConnection({
      provider: undefined,
      signer: undefined,
      newNFT: undefined,
      market: undefined,
    });
    setCurrentBalance(undefined)
    setAccountNft([])
  };

  const _getRpcErrorMessage = (error) => {
    console.log(error);
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  };

  const _handleMintNFT = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const tokenUri = formData.get('tokenUri')?.toString();
    
    if (!currentConnection?.newNFT || !tokenUri) {
      return false;
    }
    
    const newNFT = currentConnection.newNFT;      
    try {
      const [selectedAccount] = 
        await window.ethereum.request({
          method: "eth_requestAccounts",
        })
      const addTx = await newNFT.safeMint(
        selectedAccount,
        tokenUri
      );
      setTxBeingSent(addTx.hash);
      await addTx.wait();
    } catch (err) {
      console.error(err);

      setTransactionError(err);
    } finally {
      setTxBeingSent(undefined);
    }
  }

  const _dismissNetworkError = () => {
    setNetworkError(undefined);
  };
  
  const _dismissTransactionError = () => {
      setTransactionError(undefined);
  };

  const _handleAddNFT = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const tokenId = formData.get('tokenId')?.toString();
    const tokenPrice = formData.get('tokenPrice')?.toString();
    const tokenUri = await _tokenUri(Number(tokenId))    

    if (!currentConnection?.market || !currentConnection?.newNFT || !tokenId || !tokenPrice || !tokenUri || !MARKET_ADDRESS) {
      return false;
    }

    try {
      const approveTx = await currentConnection.newNFT.approve(
        MARKET_ADDRESS, tokenId
      );        

      setTxBeingSent(approveTx.hash);

      await approveTx.wait();
      const addTx = await currentConnection.market.add(tokenId, tokenPrice);
      setTxBeingSent(addTx.hash);
      await addTx.wait();

    } catch (err) {
      console.error(err);

      setTransactionError(err);
    } finally {
      setTxBeingSent(undefined);
    }
  }

  const _handleBuyNFT = async (id, price) => {
    if (!currentConnection?.market) {
      return false;
    }
    try {
      const salePrice = ethers.parseUnits(price, 'ether')
      const buyTx = await currentConnection.market.buy(id, {value:salePrice});
      setTxBeingSent(buyTx.hash);
      await buyTx.wait();
      filterNftList(id)
    } catch (err) {
      console.error(err);

      setTransactionError(err);
    } finally {
      setTxBeingSent(undefined);
    }
  }

  const _tokenUri = async (tokenId) =>  {
    if (!currentConnection?.newNFT) {
      return ''
    }
    return await currentConnection.newNFT.tokenURI(tokenId)
  }
  const filterNftList = async (token) => {
    if (!currentConnection?.newNFT || !currentConnection?.market) {
      return false;
    }
    try {
      const removeTx = await currentConnection.newNFT.removeApprovals(token);
      setTxBeingSent(removeTx.hash)
      await removeTx.wait()
      setNftList(nftList.filter((item) => item.tokenId != token))
    } catch (err) {
      console.error(err);
      
      setTransactionError(err);
    } finally {
      await currentConnection?.market.deleteNft(token)
      setTxBeingSent(undefined);
    }
  }
  return (
    <BrowserRouter>
    <main className="body">
      <div className="mainPage">
        <Header 
          currentConnection={currentConnection}
          _connectWallet={_connectWallet}
          networkError={networkError}
          dismissNet={_dismissNetworkError}
          dismissTx={_dismissTransactionError}
          _getRpcErrorMessage={_getRpcErrorMessage}
          txBeingSent={txBeingSent}
          handleMintNft={_handleMintNFT}
          transactionError={transactionError}
          currentBalance={currentBalance}
        />
        <Routes>
          <Route path="/" 
          element={<NftList nftList={nftList} 
          _handleBuyNFT={_handleBuyNFT} 
          filterNftList={filterNftList} 
          />}/>
          <Route path='/account' element={<MyAccount 
          currentConnection={currentConnection}
          handleAddNFT={_handleAddNFT} 
          filterNftList={filterNftList}
          nftList={nftList}
          _tokenUri={_tokenUri}
          accountNft={accountNft}
          />}/>
        </Routes>
      </div>
      <div className="footer">
        <h4>NFT Marketplace Open Mind</h4>
        <p>For any questions: michael.goonner@gmail.com</p>
      </div>
    </main>
    </BrowserRouter>
  );
}
