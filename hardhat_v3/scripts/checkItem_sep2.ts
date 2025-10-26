import { ethers } from "ethers";

async function main() {
  //const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/k....");
  const privateKey = "0xbc..."
  const user1 = new ethers.Wallet(privateKey, provider);

  const artNFTAddress = "0xae524792e12F2072CbE9Ffe1C852a3cb7c8CB4B4";
  //ABI
  const CheckNFT = new ethers.Contract(artNFTAddress, [
    "function check_rwa_PublicationPlace(uint256 itemId, uint8 placeKey) external view returns (string memory)"
  ], user1);
  const CheckNFT2 = new ethers.Contract(artNFTAddress, ["function token_name(uint256) external view returns (string memory)"], user1);
  console.log("Checking publication place...");

  try {
    //const result = await CheckNFT.check_rwa_PublicationPlace(0, 0);
    const result = await CheckNFT2.token_name(0);
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
