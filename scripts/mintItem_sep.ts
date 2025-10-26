import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/kJ...");
  const privateKey = "0xbc....";
  const user1 = new ethers.Wallet(privateKey, provider);

  const artNFTAddress = "0xae524792e12F2072CbE9Ffe1C852a3cb7c8CB4B4";

  const ArtNFT = new ethers.Contract(artNFTAddress, [
    "function mintItem(string memory tokenURI, string memory name, string memory placed_loca) external returns (uint256)"
  ], user1);

  const nftsToMint = [
    {
      uri: "https://yellow-fascinating-seahorse-469.mypinata.cloud/ipfs/bafybeifwe4kt56g6oj34soctb3fk3rb4n5vmb2la4rwu6dy43eoarkzi5y",
      name: "CHINA-Art",
      location: "Only NFT"
    },
    {
      uri: "https://yellow-fascinating-seahorse-469.mypinata.cloud/ipfs/bafkreibgp6vtdqiwg57f5cddsvpcqjf64sjodiya5zl6wu4yt7gqy4meci",
      name: "Round",
      location: "Only NFT"
    },
    {
      uri: "https://yellow-fascinating-seahorse-469.mypinata.cloud/ipfs/bafkreigy3tax3r4yy7zyhd5wgufkltreexrpxamyz4b56pkz2knq4z6k3m",
      name: "Faces",
      location: "Only NFT"
    },
  
    {
      uri: "https://yellow-fascinating-seahorse-469.mypinata.cloud/ipfs/bafybeibruue3soauz3q4ahq7vtdkxb7swzjzstjk4nfjnwavmqy2auu4wa",
      name: "Tibet",
      location: "Only NFT"
    },
    {
      uri: "https://yellow-fascinating-seahorse-469.mypinata.cloud/ipfs/bafkreicps6wbvmxfr6fthn44lhf63mm4bwemyoi4l4c2c562rl7z4ljyga",
      name: "Girl",
      location: "Only NFT"
    }

  ];

  for (const nft of nftsToMint) {
    console.log("Minting NFT:", nft.name);
    const tx = await ArtNFT.mintItem(nft.uri, nft.name, nft.location);
    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("NFT minted:", nft.name);
  }

  const balance = await ArtNFT.balanceOf(user1.address);
  console.log("User NFT balance:", balance.toString());
}

main().catch(console.error);
