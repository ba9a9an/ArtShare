// Use the global ethers object that Hardhat provides
async function main() {
  console.log("Testing with direct ethers access...");
  
  // Get the contract using the global ethers object
  const contract = await ethers.getContractAt(
    "MoyNFT", 
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  );
  
  console.log("✅ Contract loaded!");
  console.log("Owner:", await contract.owner());
  console.log("Address:", await contract.getAddress());
  
  // Test minting
  console.log("Minting NFT...");
  const tx = await contract.mintItem(
    "https://example.com/token1.json",
    "Direct Test NFT",
    "Test Location"
  );
  await tx.wait();
  console.log("✅ NFT minted!");
  
  console.log("Token name:", await contract.token_name(0));
}

main().catch(console.error);
