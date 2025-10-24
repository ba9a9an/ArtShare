import hardhat from "hardhat";

async function main() {
  const { ethers } = hardhat;
  
  console.log("Testing contract...");
  
  // Get the contract
  const contract = await ethers.getContractAt(
    "MoyNFT", 
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  );
  
  console.log("✅ Contract loaded!");
  console.log("Owner:", await contract.owner());
  
  // Test minting
  console.log("Minting NFT...");
  const tx = await contract.mintItem(
    "https://example.com/token1.json",
    "My NFT",
    "Gallery A"
  );
  await tx.wait();
  console.log("✅ NFT minted!");
  
  console.log("Token name:", await contract.token_name(0));
}

main().catch(console.error);
