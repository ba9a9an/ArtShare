// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface INFTMarketplace {
    function mintItem(string memory tokenURI, string memory name, string memory placed_loca) external returns (uint256);
    function check_rwa_PublicationPlace(uint256 itemId, uint256 placeKey) external view returns (string memory);
    function check_rwa_PublicationPlaceCount(uint256 itemId) external view returns (uint8);
    function check_rwa_copies(uint256 itemId ) external view returns (uint8);
    function token_name(uint256) external view returns (string memory);
    function token_price(uint256) external view returns (uint256);
    function share_revenue(address _itemowner) external payable;
    function listNFT(uint256 tokenId, uint256 price) external;
    function buyNFT(uint256 tokenId) external payable;
    function delistNFT(uint256 tokenId) external;
}

contract ArtNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    
    error Failed(address owner);
    
    struct Item_metadata {
        string name;
        uint8 rwa_copies_count;
        mapping (uint8 => string) publication_place;
    }
    
    mapping (uint256 => Item_metadata) public itemId_to_metadata;
    mapping(uint256 => uint256) public tokenPrices;
    mapping(uint256 => bool) public isListed;

    event NFTListed(uint256 indexed tokenId, uint256 price, address seller);
    event NFTPurchased(uint256 indexed tokenId, uint256 price, address buyer, address seller);

    constructor() ERC721("MoyNFT", "MNFT") Ownable(msg.sender) {}

    // Mint a new NFT
    function mintItem(string memory tokenURI, string memory name, string memory placed_loca) public returns (uint256) {
        uint256 newItemId = _tokenIds;
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        _tokenIds++;
        
        itemId_to_metadata[newItemId].name = name;
        itemId_to_metadata[newItemId].rwa_copies_count = 0;
        itemId_to_metadata[newItemId].publication_place[0] = placed_loca;
        
        return newItemId;
    }

    function updatePublicationPlace(uint256 tokenId, uint8 placeKey, string memory place) public onlyOwner {
        if (_ownerOf(tokenId) == address(0)) {
            revert("Token does not exist");
        }
        itemId_to_metadata[tokenId].publication_place[placeKey] = place;
        itemId_to_metadata[tokenId].rwa_copies_count += 1;
    }

    function check_rwa_PublicationPlace(uint256 itemId, uint8 placeKey) public view returns (string memory) {
        return itemId_to_metadata[itemId].publication_place[placeKey];  
    }

    function check_rwa_copies(uint256 itemId ) public view returns (uint8) {
        return itemId_to_metadata[itemId].rwa_copies_count;  
    }

    function token_name(uint256 itemId) public view returns (string memory) {
        return itemId_to_metadata[itemId].name;  
    }

    function token_price(uint256 itemId) public view returns (uint256) {
        return tokenPrices[itemId];  
    }

    function share_revenue (address _itemowner) public payable {
        (bool sent, ) = payable(_itemowner).call{value: msg.value}("");
        require(sent,"Failed to send revenue");
    }

    // List an NFT for sale
    function listNFT(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can list this NFT");
        require(price > 0, "Price must be greater than zero");
        require(!isListed[tokenId], "NFT is already listed");

        // Approve the contract to transfer this NFT
        approve(address(this), tokenId);
        require(getApproved(tokenId) == address(this), "Failed to set approval for contract");

        tokenPrices[tokenId] = price;
        isListed[tokenId] = true;

        emit NFTListed(tokenId, price, msg.sender);
    }

    // Buy an NFT
    function buyNFT(uint256 tokenId) public payable {
        require(isListed[tokenId], "NFT is not listed for sale");
        require(msg.value >= tokenPrices[tokenId], "Insufficient payment");
        address seller = ownerOf(tokenId);
        require(seller != msg.sender, "Cannot buy your own NFT");
        require(getApproved(tokenId) == address(this), "Contract not approved to transfer NFT");

        // Transfer the payment to the seller
        address receiver = ownerOf(tokenId);
        (bool sent, ) = payable(receiver).call{value: msg.value}("");
        require(sent, "Payment failed");

        // Transfer the NFT to the buyer
        isListed[tokenId] = false;
        tokenPrices[tokenId] = 0;
        
        // Transfer NFT from seller to buyer
        _transfer(seller, msg.sender, tokenId);

        // Clear approval after transfer - FIXED: use approve instead of _approve
        approve(address(0), tokenId);

        emit NFTPurchased(tokenId, msg.value, msg.sender, seller);
    }

    // Allow the owner to delist their NFT
    function delistNFT(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can delist this NFT");
        require(isListed[tokenId], "NFT is not listed");

        isListed[tokenId] = false;
        tokenPrices[tokenId] = 0;
        
        // Clear approval - FIXED: use approve instead of _approve
        approve(address(0), tokenId);

        emit NFTListed(tokenId, 0, msg.sender);
    }

    // Function to retrieve the contract's balance
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool sent, ) = payable(owner()).call{value: balance}("");
        require(sent, "Withdrawal failed");
    }

    // Get current token count
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIds;
    }
}
