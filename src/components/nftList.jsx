import React from "react";

const NftList = ({nftList, _handleBuyNFT}) => {        
    return (
        <div className="nftList">
        {nftList?.map((nft) => 
        <div className="nft" key={nft.tokenId} >
            <img src={nft.tokenUrl} alt={nft.tokenId}/>
            <div className="nftDescription">
                <h3>Happy NFT {nft.tokenId}</h3>
                <h4>Price: {nft.tokenPrice} POL</h4>
                <button onClick={() => _handleBuyNFT(nft.tokenId,nft.tokenPrice)}>Buy NFT</button>
            </div>
        </div>
        )}
    </div>
    )     
}

export default NftList