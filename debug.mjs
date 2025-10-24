import { ethers } from "hardhat";

async function main() {
  console.log("Debugging contract access...");
  
  // Check if contract exists at address
  const code = await ethers.provider.getCode("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  console.log("Contract code at address:", code !== "0x" ? "EXISTS" : "MISSING");
  
  if (code === "0x") {
    console.log("❌ No contract deployed at this address");
    return;
  }
  
  // Try to get contract
  try {
    const contract = await ethers.getContractAt("MoyNFT", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
    console.log("✅ Contract loaded successfully!");
    console.log("Owner:", await contract.owner());
  } catch (error) {
    console.log("❌ Contract loading failed:", error.message);
    
    // Try alternative contract names
    const alternatives = ["ArtNFT", "Counter", "MoyNFT"];
    for (const name of alternatives) {
      try {
        const altContract = await ethers.getContractAt(name, "0x5FbDB2315678afecb367f032d93F642f64180aa3");
        console.log(`✅ Success with contract name: ${name}`);
        console.log("Owner:", await altContract.owner());
        break;
      } catch (e) {
        console.log(`❌ Failed with ${name}: ${e.message}`);
      }
    }
  }
}

main().catch(console.error);
