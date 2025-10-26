import * as dotenv from "dotenv";
dotenv.config();
import "@nomicfoundation/hardhat-ignition-ethers";
import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatLocalNode: {
      type: "http",
      url: "http://localhost:8545",  // Local node URL
      chainId: 31337,                // Chain ID
      // Optional: accounts configuration
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [],
      chainId: 11155111, // Sepolia chain ID
      type: "http",
    },
    //sepolia: {
    //  type: "http",
    //  chainType: "l1",
    //  url: configVariable("SEPOLIA_RPC_URL"),
    //  accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    //},
  },
};

export default config;
