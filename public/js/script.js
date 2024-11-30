const apiURL = 'https://api.coincap.io/v2/assets';
let selectedCrypto = localStorage.getItem('selectedCrypto') || '';
const defaultSuggestionsLimit = 10; // Default number of suggestions

// Pre-fills the search field with the last selected value, if it exists
document.getElementById('cryptoSearch').value = selectedCrypto;

async function fetchSuggestions() {
    const input = document.getElementById('cryptoSearch').value.toLowerCase();
    
    // Fetches the list of all cryptocurrencies
    const response = await fetch(apiURL);
    const data = await response.json();

    const suggestionsList = document.getElementById('suggestions');
    suggestionsList.innerHTML = ''; // Clears previous suggestions

    // Filters suggestions based on user input or uses the default set
    const filteredData = input
        ? data.data.filter(crypto =>
            crypto.name.toLowerCase().includes(input) ||
            crypto.symbol.toLowerCase().includes(input)
          )
        : data.data.slice(0, defaultSuggestionsLimit); // Shows the first 'n' cryptos as default

    // Adds the suggestions to the suggestions list element
    filteredData.forEach(crypto => {
        const listItem = document.createElement('li');
        listItem.textContent = `${crypto.name} (${crypto.symbol})`;
        listItem.onclick = () => selectCrypto(crypto.id); // Sets the selected cryptocurrency when clicked
        suggestionsList.appendChild(listItem);
    });
}

// Function to select a cryptocurrency
function selectCrypto(id) {
    selectedCrypto = id; // Sets the selected cryptocurrency
    localStorage.setItem('selectedCrypto', id); // Saves the selection in localStorage
    document.getElementById('suggestions').innerHTML = ''; // Clears suggestions
    document.getElementById('cryptoSearch').value = id; // Updates the search field
}

// Function called when the "Search" button is clicked
async function showCrypto() {
    const input = document.getElementById('cryptoSearch').value.toLowerCase();

    // Fetches all cryptocurrencies to validate the input
    const response = await fetch(apiURL);
    const data = await response.json();

    // Checks if the input matches a valid cryptocurrency ID, name, or symbol
    const crypto = data.data.find(
        crypto =>
            crypto.id.toLowerCase() === input ||
            crypto.name.toLowerCase() === input ||
            crypto.symbol.toLowerCase() === input
    );

    if (crypto) {
        // If the cryptocurrency is valid, redirects to the details page
        window.location.href = `crypto.html?id=${crypto.id}`;
    } else {
        // Displays a notification if the input is invalid
        showNotification('Choose a Crypto that exists');
    }
}

// Function to show a notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message; // Sets the notification message
    notification.classList.remove('hidden');
    notification.classList.add('show');

    // Removes the notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hidden');
    }, 3000);
}
