import React, { useState } from "react";
import Modal from 'react-modal';

const MyAccount  = ({
    nftList, 
    handleAddNFT, 
    filterNftList,
    accountNft
}) => {

    const [modal, setModal] = useState({uri:'', id:'', bool:false})
   
    
    const openSellModal = (uri, id) => {
      setModal({uri: uri, id: id, bool:true})
    };
    const closeSellModal = () => {
      setModal({uri:'', id:'', bool:false});
    }
    const _onSubmit = (event) => {
      closeSellModal()
      handleAddNFT(event)
    }

    function alreadyOnSale(id, list) {
      let i;
      for (i = 0; i < list.length; i++) {
          if (list[i]['tokenId'] === id) {
              return true;
          }
      }
  
      return false;
  }

    const modalSell = (
        <div className="modalContent">
          <h2>Sell NFT</h2>
          <form className="modalForm" onSubmit={(event) => _onSubmit(event)}>
            <img src={modal.uri} alt={modal.id} className="modalImg"/>
            <h3>NFT{modal.id}</h3>
            <input type="value" value={modal.id} name="tokenId" onChange ={()=>{}} />
            <input type="text" placeholder="Price" name="tokenPrice" />
            <input className="formSubmit" type="submit" value="Sell NFT" />
          </form>
          <button onClick={closeSellModal}>Close</button>
        </div>
    )

    return (
    <div className="accountNft">
          {accountNft.length > 0 ?
          accountNft.map((obj) => 
              <div key={obj.tokenId} className="nft">
                  <img src={obj.tokenUri} alt={obj.tokenId}/>
                  <div className="nftDescription">
                    <h3>Happy NFT {obj.tokenId}</h3>
                    {nftList.length > 0 && alreadyOnSale(obj.tokenId, nftList) ?
                        <button onClick={() => filterNftList(obj.tokenId)}>Remove from sale</button>:
                        <button onClick={() => openSellModal(obj.tokenUri, obj.tokenId)}>Sell</button>}
                      </div>
              </div>
          ) :
          <h3>Mint your first NFT</h3>
        }
        <Modal className="modal" ariaHideApp={false} isOpen={modal.bool} onRequestClose={closeSellModal}>
          {modalSell}
        </Modal>
    </div> 
    )
}

export default MyAccount