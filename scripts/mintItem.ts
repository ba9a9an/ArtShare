import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  
  const privateKey = "0xac..f80"; // Account #0
  const user1 = new ethers.Wallet(privateKey, provider);

  const artNFTAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
  
  // ABI 
  const ArtNFT = new ethers.Contract(artNFTAddress, [
    // mintItem function
    "function mintItem(string memory tokenURI, string memory name, string memory placed_loca) external returns (uint256)",
    // balanceOf function
    "function balanceOf(address owner) external view returns (uint256)"
  ], user1); // Connect directly to user1

  console.log("Minting NFT from:", user1.address);

  // tokenURI, name, placed_loca
  const tx = await ArtNFT.mintItem(
    "https://yellow-fascinating-seahorse-469.mypinata.cloud/ipfs/b.......y", 
    "CHINA-ART", 
    "Only NFT"
  );
  
  console.log("Transaction sent:", tx.hash);
  await tx.wait();

  console.log("NFT minted ok!");
  const balance = await ArtNFT.balanceOf(user1.address);
  console.log("User NFT balance:", balance.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
