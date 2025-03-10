let balance = 1000;
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let lastBurnTime = localStorage.getItem("lastBurn") || null;
const BURN_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
let priceInterval;

// Update Balance & History Function
function updateUI() {
    document.getElementById("balance").innerText = balance.toFixed(2);
    document.getElementById("last-burn").innerText = lastBurnTime ? new Date(parseInt(lastBurnTime)).toLocaleString() : "Not yet";
    document.getElementById("transaction-history").innerHTML = transactions.map(t => `<li>${t}</li>`).join('');
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Navigate Between Sections
function navigate(section) {
    document.getElementById("home").style.display = section === "home" ? "block" : "none";
    document.getElementById("wallet").style.display = section === "wallet" ? "block" : "none";
}

// Generate QR Code
function generateQRCode() {
    const qrcodeDiv = document.getElementById("qrcode");
    qrcodeDiv.innerHTML = "";
    const qrcode = new QRCode(qrcodeDiv, {
        text: `ChikuCoin:${balance}`,
        width: 128,
        height: 128,
    });
}

// Send ChikuCoin
function sendChikuCoin() {
    const recipient = document.getElementById("recipient").value;
    const amount = parseFloat(document.getElementById("amount").value);

    if (!recipient || isNaN(amount) || amount <= 0 || amount > balance) {
        showPopup("Invalid transaction!");
        return;
    }

    balance -= amount;
    transactions.push(`Sent: ${amount} CHK to ${recipient}`);
    updateUI();
    showPopup(`Successfully sent ${amount} CHK to ${recipient}`);
}

// Burn 1% CHK
function burnCoins() {
    const now = new Date().getTime();
    if (lastBurnTime && now - lastBurnTime < BURN_COOLDOWN) {
        showPopup(`You can only burn coins once every 24 hours. Next burn available in ${Math.ceil((BURN_COOLDOWN - (now - lastBurnTime)) / (1000 * 60 * 60))} hours.`);
        return;
    }

    const burnAmount = balance * 0.01;
    if (confirm(`Are you sure you want to burn ${burnAmount.toFixed(2)} CHK?`)) {
        balance -= burnAmount;
        lastBurnTime = now;
        localStorage.setItem("lastBurn", lastBurnTime);
        transactions.push(`Burned: ${burnAmount.toFixed(2)} CHK`);
        updateUI();
        showPopup(`Burned ${burnAmount.toFixed(2)} CHK`);
    }
}

// AI Prediction
function predictCoin() {
    const predictions = ["Up", "Down", "Stable", "High Volatility"];
    const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    document.getElementById("prediction").innerText = randomPrediction;
}

// Fetch Live Prices using CoinGecko API
async function fetchPrices() {
    const button = document.getElementById("update-prices-button");
    const buttonText = document.getElementById("update-prices-text");
    const spinner = document.getElementById("update-prices-spinner");

    button.disabled = true;
    buttonText.style.display = "none";
    spinner.style.display = "inline";

    try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,dogecoin&vs_currencies=usd");
        const data = await response.json();

        document.getElementById("btc-price").innerText = `$${data.bitcoin.usd}`;
        document.getElementById("eth-price").innerText = `$${data.ethereum.usd}`;
        document.getElementById("doge-price").innerText = `$${data.dogecoin.usd}`;
        document.getElementById("chiku-price").innerText = `$${(Math.random() * (1.5 - 0.8) + 0.8).toFixed(4)}`;
    } catch (error) {
        console.error("Error fetching prices:", error);
        showPopup("Failed to fetch prices. Please try again.");
    } finally {
        button.disabled = false;
        buttonText.style.display = "inline";
        spinner.style.display = "none";
    }
}

// Show Confirmation Popup
function showPopup(message) {
    document.getElementById("popup-message").innerText = message;
    document.getElementById("confirmation-popup").style.display = "flex";
}

// Close Confirmation Popup
function closePopup() {
    document.getElementById("confirmation-popup").style.display = "none";
}

// Toggle Dark/Light Mode
function toggleTheme() {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme", document.body.classList.contains("light-mode") ? "light" : "dark");
}

// Initialize on Load
window.onload = function() {
    updateUI();
    fetchPrices();
    predictCoin();

    // Set theme from localStorage
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.classList.toggle("light-mode", savedTheme === "light");

    // Auto-refresh prices every 60 seconds
    priceInterval = setInterval(fetchPrices, 60000);
};

// Clear interval on page unload
window.onunload = function() {
    clearInterval(priceInterval);
};