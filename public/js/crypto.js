async function getCryptoDetails() {
    const params = new URLSearchParams(window.location.search);
    const cryptoId = params.get('id');
    const response = await fetch(`https://api.coincap.io/v2/assets/${cryptoId}`);
    const data = await response.json();

    const detailsDiv = document.getElementById('cryptoDetails');
    const crypto = data.data;
    detailsDiv.innerHTML = `
        <h2>${crypto.name} (${crypto.symbol})</h2>
        <p><strong>Rank:</strong> ${crypto.rank}</p>
        <p><strong>Price (USD):</strong> $${parseFloat(crypto.priceUsd).toFixed(2)}</p>
        <p><strong>Market Cap:</strong> $${parseFloat(crypto.marketCapUsd).toFixed(2)}</p>
        <p><strong>24h Volume:</strong> $${parseFloat(crypto.volumeUsd24Hr).toFixed(2)}</p>
        <p><strong>Supply:</strong> ${parseFloat(crypto.supply).toFixed(2)} ${crypto.symbol}</p>
    `;
}

getCryptoDetails();

async function getCryptoHistory(id) {
    // Fetch the historical data from the API
    const response = await fetch(`https://api.coincap.io/v2/assets/${id}/history?interval=d1`);
    const data = await response.json();

    // Parse the JSON and filter the last 6 months of data
    const allData = data.data;

    // Calculate the date for 6 months ago from the latest date in the data
    const latestDate = new Date(allData[allData.length - 1].date);
    const sixMonthsAgo = new Date(latestDate);
    sixMonthsAgo.setMonth(latestDate.getMonth() - 6); // Subtract 6 months

    // Filter data to include only entries from the last 6 months
    const filteredData = allData.filter(entry => new Date(entry.date) >= sixMonthsAgo);

    // Prepare data for the chart
    const dates = filteredData.map(entry => entry.date.split('T')[0]); // Extract only the date
    const prices = filteredData.map(entry => parseFloat(entry.priceUsd).toFixed(2)); // Format prices

    renderChart(dates, prices); // Render the chart
}

let chartInstance; // Global variable to store the chart instance

function renderChart(dates, prices) {
    const ctx = document.getElementById('priceChart').getContext('2d');

    // Destroy the previous chart instance if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Convert dates to months (e.g., 'Jan', 'Feb', etc.)
    const months = dates.map(date => {
        const options = { month: 'short' }; // Display abbreviated month names
        return new Date(date).toLocaleDateString('en-US', options);
    });

    // Create the chart with months as labels on the x-axis
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months, // Use months as labels
            datasets: [{
                label: 'Price (USD) - Last 6 Months',
                data: prices,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                pointRadius: 3,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Month', // Update the title to "Month"
                    },
                    ticks: {
                        maxTicksLimit: 6, // Limit to a maximum of 6 months
                        autoSkip: true,
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price (USD)',
                    },
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

// Function to show the modal and render the chart
function showModal() {
    const modal = document.getElementById('graphModal');
    modal.classList.remove('hidden'); // Show the modal

    // Fetch the historical data and render the chart in the modal
    const params = new URLSearchParams(window.location.search);
    const cryptoId = params.get('id');
    getCryptoHistory(cryptoId); // Render the chart on the modal canvas
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('graphModal');
    modal.classList.add('hidden'); // Hide the modal
}

// Add event listener to the button
document.addEventListener('DOMContentLoaded', () => {
    const graphButton = document.getElementById('showGraphButton');
    graphButton.addEventListener('click', showModal); // Attach click event
});

// Get the crypto ID from the URL and fetch the historical data
const params = new URLSearchParams(window.location.search);
const cryptoId = params.get('id');
getCryptoHistory(cryptoId);
