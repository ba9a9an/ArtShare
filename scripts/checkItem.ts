import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const privateKey = "0xa...f80"; // Account #0
  const user1 = new ethers.Wallet(privateKey, provider);

  const artNFTAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
  //ABI
  const CheckNFT = new ethers.Contract(artNFTAddress, [
    "function check_rwa_PublicationPlace(uint256 itemId, uint8 placeKey) external view returns (string memory)"
  ], user1);

  console.log("Checking publication place...");

  try {
    const result = await CheckNFT.check_rwa_PublicationPlace(0, 0);
    console.log("✅ Publication place:", result);
  } catch (error) {
    console.error("Error calling function:", error);
    if (error.info && error.info.error) {
      console.log("Detailed error:", error.info.error);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
