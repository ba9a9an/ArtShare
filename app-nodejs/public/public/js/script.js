// ⚡ Import viem functions
import { defineChain, createPublicClient, createWalletClient, http, custom } from 'https://esm.sh/viem';

// ⚡ ABI
const ABI = [
  { "name": "token_name", "type": "function", "inputs": [{ "name": "itemId", "type": "uint256" }], "outputs": [{ "type": "string" }], "stateMutability": "view" },
  { "name": "ownerOf", "type": "function", "inputs": [{ "name": "tokenId", "type": "uint256" }], "outputs": [{ "type": "address" }], "stateMutability": "view" },
  { "name": "check_rwa_copies", "type": "function", "inputs": [{ "name": "itemId", "type": "uint256" }], "outputs": [{ "type": "uint8" }], "stateMutability": "view" },
  { "name": "token_price", "type": "function", "inputs": [{ "name": "itemId", "type": "uint256" }], "outputs": [{ "type": "uint256" }], "stateMutability": "view" },
  { "name": "tokenURI", "type": "function", "inputs": [{ "name": "tokenId", "type": "uint256" }], "outputs": [{ "name": "", "type": "string" }], "stateMutability": "view" },
  { "name": "buyNFT", "type": "function", "inputs": [{ "name": "tokenId", "type": "uint256" }], "outputs": [], "stateMutability": "payable" },
  { "name": "listNFT", "type": "function", "inputs": [{ "name": "tokenId", "type": "uint256" }, { "name": "price", "type": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "name": "delistNFT", "type": "function", "inputs": [{ "name": "tokenId", "type": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
  { "name": "check_rwa_PublicationPlace", "type": "function", "inputs": [{ "name": "itemId", "type": "uint256" }, { "name": "placeKey", "type": "uint8" }], "outputs": [{ "name": "", "type": "string" }], "stateMutability": "view" }
];

// ⚡ Contract address
const CONTRACT_ADDRESS = "0xae524792e12F2072CbE9Ffe1C852a3cb7c8CB4B4";

let publicClienttoNet;
let walletClient;
let sepolia;

// ⚡ Initialize RPC URL from server
async function initializeRPC() {
  try {
    console.log('Fetching RPC URL from server...');
    
    const response = await fetch('/api/rpc-url');
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.rpcUrl) {
      throw new Error('No RPC URL received from server');
    }
    
    const rpcUrl = data.rpcUrl;
    console.log('RPC URL received:', rpcUrl.substring(0, 30) + '...');
    
    // Define chain with the RPC URL from server
    sepolia = defineChain({
      id: 11155111,
      name: "Sepolia Testnet",
      nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
      rpcUrls: { default: { http: [rpcUrl] } },
      testnet: true
    });
    
    // Create public client
    publicClienttoNet = createPublicClient({
      chain: sepolia,
      transport: http(rpcUrl)
    });
    
    console.log('RPC initialized successfully');
    return true;
    
  } catch (error) {
    console.error('Failed to initialize RPC:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    // Try to get more details about the fetch error
    try {
      const healthResponse = await fetch('/api/health');
      const healthData = await healthResponse.json();
      console.log('Health check:', healthData);
    } catch (healthError) {
      console.error('Health check also failed:', healthError);
    }
    
    showNotification("Network connection failed. Please refresh the page.", "error");
    return false;
  }
}

// ⚡ List NFT function
async function listNFT(tokenId, priceEth) {
  if (!walletClient) {
    showNotification("Please connect wallet first", "error");
    return;
  }

  if (!tokenId || tokenId === "") {
    showNotification("Please enter token ID", "error");
    return;
  }

  if (!priceEth || priceEth <= 0) {
    showNotification("Please enter valid price", "error");
    return;
  }

  try {
    const priceWei = BigInt(Math.floor(Number(priceEth) * 1e18));
    const [address] = await walletClient.getAddresses();
    
    // Check if user owns the NFT
    const owner = await publicClienttoNet.readContract({ 
      address: CONTRACT_ADDRESS, 
      abi: ABI, 
      functionName: 'ownerOf', 
      args: [BigInt(tokenId)] 
    });
    
    if (owner.toLowerCase() !== address.toLowerCase()) {
      showNotification("You don't own this NFT", "error");
      return;
    }

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "listNFT",
      args: [BigInt(tokenId), priceWei],
      account: address
    });
    
    showNotification(`NFT #${tokenId} listed for ${priceEth} ETH! Transaction submitted.`, "success");
    console.log(`NFT #${tokenId} listed for ${priceEth} ETH`);
    console.log("Tx hash:", hash);
    
    // Wait a bit before reloading to show the notification
    setTimeout(() => window.location.reload(), 3000);
  } catch (err) {
    console.error("Listing failed:", err);
    showNotification("Listing failed: " + err.message, "error");
  }
}

// ⚡ Delist NFT function
async function delistNFT(tokenId) {
  if (!walletClient) {
    showNotification("Please connect wallet first", "error");
    return;
  }

  if (!tokenId || tokenId === "") {
    showNotification("Please enter token ID", "error");
    return;
  }

  try {
    const [address] = await walletClient.getAddresses();
    
    // Check if user owns the NFT
    const owner = await publicClienttoNet.readContract({ 
      address: CONTRACT_ADDRESS, 
      abi: ABI, 
      functionName: 'ownerOf', 
      args: [BigInt(tokenId)] 
    });
    
    if (owner.toLowerCase() !== address.toLowerCase()) {
      showNotification("You don't own this NFT", "error");
      return;
    }

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "delistNFT",
      args: [BigInt(tokenId)],
      account: address
    });
    
    showNotification(`NFT #${tokenId} delisted successfully!`, "success");
    console.log(`NFT #${tokenId} delisted`);
    console.log("Tx hash:", hash);
    
    // Wait a bit before reloading to show the notification
    setTimeout(() => window.location.reload(), 3000);
  } catch (err) {
    console.error("Delisting failed:", err);
    showNotification("Delisting failed: " + err.message, "error");
  }
}

// ⚡ Buy NFT function
async function buyNFT(tokenId, priceEth) {
  if (!walletClient) {
    showNotification("Please connect wallet first", "error");
    return;
  }

  const value = BigInt(Math.floor(Number(priceEth) * 1e18));
  try {
    const [address] = await walletClient.getAddresses();
    
    const owner_item_sell = await publicClienttoNet.readContract({ 
      address: CONTRACT_ADDRESS, 
      abi: ABI, 
      functionName: 'ownerOf', 
      args: [BigInt(tokenId)] 
    });
    
    if (owner_item_sell.toLowerCase() === address.toLowerCase()) {
      showNotification("You cannot buy this item from yourself, use Delist", "error");
      return;
    }

    const txHash = await walletClient.writeContract({ 
      address: CONTRACT_ADDRESS, 
      abi: ABI, 
      functionName: "buyNFT", 
      args: [BigInt(tokenId)], 
      account: address, 
      value: value 
    });
    
    console.log("Tx hash:", txHash);
    showNotification("Transaction submitted! Waiting for confirmation...", "success");
    
    // Wait a bit before reloading to show the notification
    setTimeout(() => window.location.reload(), 3000);
  } catch (err) {
    console.error(err);
    showNotification("Transaction failed: " + err.message, "error");
  }
}

// ⚡ Show notification
function showNotification(message, type = "info") {
  const container = document.getElementById("notification-container");
  if (!container) {
    console.log(`Notification: ${message}`);
    return;
  }
  
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  container.appendChild(notification);
  setTimeout(() => notification.remove(), 4000);
}

// ⚡ Wallet button connect
const walletBtn = document.querySelector('.wallet-btn');
if (walletBtn) {
  walletBtn.addEventListener('click', async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const selectedAddress = accounts[0];
        
        // Make sure chain is initialized before creating wallet client
        if (!sepolia) {
          const initialized = await initializeRPC();
          if (!initialized) {
            showNotification("Network not ready. Please try again.", "error");
            return;
          }
        }
        
        walletClient = createWalletClient({ 
          chain: sepolia, 
          transport: custom(window.ethereum) 
        });
        
        walletBtn.innerHTML = `Wallet: ${selectedAddress.slice(0, 6)}...${selectedAddress.slice(-4)}`;
        showNotification("Wallet connected successfully!", "success");
      } catch (err) {
        console.error("Connection error:", err);
        showNotification("Wallet connection failed", "error");
        walletBtn.innerHTML = "Wallet not connected";
      }
    } else {
      const dappUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
    }
  });
}

// ⚡ Sell button event listener
const sellBtn = document.querySelector('.sell-btn');
if (sellBtn) {
  sellBtn.addEventListener('click', async () => {
    const tokenInput = document.querySelector('.token-input');
    const priceInput = document.querySelector('.price-input');
    
    const tokenId = tokenInput.value.trim();
    const priceEth = priceInput.value.trim();
    
    await listNFT(tokenId, priceEth);
  });
}

// ⚡ Delist button event listener
const delistBtn = document.querySelector('.delist-btn');
if (delistBtn) {
  delistBtn.addEventListener('click', async () => {
    const delistTokenInput = document.getElementById('delist-token-id');
    const tokenId = delistTokenInput.value.trim();
    
    await delistNFT(tokenId);
  });
}

// ⚡ NFT container
const nftContainer = document.getElementById('nft-container');
const totalItemsSpan = document.getElementById('total-items');

// ⚡ Render NFTs
export async function renderNFTs(maxTokens = 100) {
  // Wait for RPC to be initialized
  if (!publicClienttoNet) {
    console.log('Initializing RPC before rendering NFTs...');
    const initialized = await initializeRPC();
    if (!initialized) {
      showNotification("Failed to connect to network. Please refresh the page.", "error");
      return;
    }
  }

  let total = 0;

  for (let i = 0; i < maxTokens; i++) {
    try {
      const name = await publicClienttoNet.readContract({ 
        address: CONTRACT_ADDRESS, 
        abi: ABI, 
        functionName: 'token_name', 
        args: [BigInt(i)] 
      });
      const owner = await publicClienttoNet.readContract({ 
        address: CONTRACT_ADDRESS, 
        abi: ABI, 
        functionName: 'ownerOf', 
        args: [BigInt(i)] 
      });
      const copies = await publicClienttoNet.readContract({ 
        address: CONTRACT_ADDRESS, 
        abi: ABI, 
        functionName: 'check_rwa_copies', 
        args: [BigInt(i)] 
      });
      const pictureURI = await publicClienttoNet.readContract({ 
        address: CONTRACT_ADDRESS, 
        abi: ABI, 
        functionName: 'tokenURI', 
        args: [BigInt(i)] 
      });
      
      let price;
      try {
        const rawPrice = await publicClienttoNet.readContract({ 
          address: CONTRACT_ADDRESS, 
          abi: ABI, 
          functionName: 'token_price', 
          args: [BigInt(i)] 
        });
        price = rawPrice === 0n ? "Not listed" : (Number(rawPrice) / 1e18).toFixed(4) + " ETH";
      } catch {
        price = "Not listed";
      }

      const card = document.createElement('section');
      card.className = 'nft-card';
      card.innerHTML = `
        <img class="nft-image" src="${pictureURI}" alt="NFT ${i}" onerror="this.style.display='none'">
        <div class="nft-info">
          <p><b>Name:</b> ${name}</p>
          <p><b>Offline copies:</b> ${copies}</p>
          <p><b>Owner:</b> ...${owner.slice(-7)}</p>
          <p><b>Price:</b> ${price}</p>
          <p><b>tokenId:</b> ${i}</p>
          <div class="check-section">
            <input type="text" placeholder="Check publication id: __">
            <button class="check-btn" data-id="${i}">Check</button>
            <span>{Link will be here}</span>
          </div>
        </div>
        <button class="buy-btn" data-id="${i}">Buy</button>
      `;
      nftContainer.appendChild(card);

      const buyBtn = card.querySelector('.buy-btn');
      const checkBtn = card.querySelector('.check-btn');
      const checkResult = card.querySelector('.check-section span');
      const checkInput = card.querySelector('.check-section input');

      if (price === "Not listed") {
        buyBtn.classList.add("disabled");
      } else {
        buyBtn.classList.add("active");
      }

      checkBtn.onclick = async () => {
        const placeKey = checkInput.value.trim();
        if (!placeKey) return showNotification("Please enter publication id (placeKey)");
        if (isNaN(placeKey)) return showNotification("Publication id must be a number");
        try {
          const result = await publicClienttoNet.readContract({ 
            address: CONTRACT_ADDRESS, 
            abi: ABI, 
            functionName: "check_rwa_PublicationPlace", 
            args: [BigInt(i), Number(placeKey)] 
          });
          checkResult.textContent = result || "No data found";
        } catch (err) {
          console.error(err);
          checkResult.textContent = "❌ Failed to fetch publication data";
        }
      };

      buyBtn.onclick = async () => {
        if (!walletClient) return showNotification("← Please connect wallet first");
        
        if (price === "Not listed") return showNotification("This item is not listed for sale");

        const priceEthValue = price.replace(" ETH", "");
        await buyNFT(i, priceEthValue);
      };

      total++;
    } catch (error) {
      console.log(`Stopped at token ${i}:`, error.message);
      break;
    }
  }

  if (totalItemsSpan) {
    totalItemsSpan.textContent = total;
  }
  
  if (total === 0) {
    showNotification("No NFTs found or network connection issue", "error");
  }
}

// ⚡ Run render on DOMContentLoaded - with RPC initialization
document.addEventListener("DOMContentLoaded", async () => {
  console.log('DOM loaded, initializing application...');
  
  // Initialize RPC first, then render NFTs
  try {
    await initializeRPC();
    await renderNFTs(100);
  } catch (error) {
    console.error("Initialization error:", error);
    showNotification("Failed to initialize application", "error");
  }
});