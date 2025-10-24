import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
export default buildModule("ArtNFTModule", (m) => {
  const counter = m.contract("ArtNFT");
  return { counter };
});

