// Initialize the map centered on Gdansk
const map = L.map('map').setView([54.352, 18.6466], 12);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Sample data for indicators (in real application, this would come from a backend)
const sampleLocations = {
    populationDensity: [
        { lat: 54.352, lng: 18.6466, value: 85 },
        { lat: 54.360, lng: 18.6566, value: 65 },
        { lat: 54.348, lng: 18.6366, value: 75 }
    ],
    competition: [
        { lat: 54.353, lng: 18.6476, value: 40 },
        { lat: 54.358, lng: 18.6526, value: 60 },
        { lat: 54.345, lng: 18.6396, value: 30 }
    ],
    publicTransport: [
        { lat: 54.351, lng: 18.6456, value: 90 },
        { lat: 54.357, lng: 18.6546, value: 80 },
        { lat: 54.349, lng: 18.6376, value: 70 }
    ]
};

// Handle slider updates
const sliders = {
    population: document.getElementById('population'),
    competition: document.getElementById('competition'),
    transport: document.getElementById('transport')
};

Object.keys(sliders).forEach(key => {
    const slider = sliders[key];
    const valueDisplay = document.getElementById(`${key}Value`);
    
    slider.addEventListener('input', () => {
        valueDisplay.textContent = `${slider.value}%`;
        validateTotalWeight();
    });
});

// Ensure weights sum to 100%
function validateTotalWeight() {
    const total = parseInt(sliders.population.value) +
                 parseInt(sliders.competition.value) +
                 parseInt(sliders.transport.value);
    
    document.getElementById('analyze').disabled = total !== 100;
    return total === 100;
}

// Analysis function
document.getElementById('analyze').addEventListener('click', () => {
    if (!validateTotalWeight()) {
        alert('Weights must sum to 100%');
        return;
    }

    // Clear existing markers
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Calculate weighted scores for each location
    const scores = calculateScores();
    
    // Display results
    displayResults(scores);
});

function calculateScores() {
    const weights = {
        population: parseInt(sliders.population.value) / 100,
        competition: parseInt(sliders.competition.value) / 100,
        transport: parseInt(sliders.transport.value) / 100
    };

    // Combine all locations and calculate weighted scores
    const locations = sampleLocations.populationDensity.map((loc, index) => {
        const score = 
            loc.value * weights.population +
            (100 - sampleLocations.competition[index].value) * weights.competition +
            sampleLocations.publicTransport[index].value * weights.transport;

        return {
            lat: loc.lat,
            lng: loc.lng,
            score: Math.round(score * 100) / 100
        };
    });

    return locations.sort((a, b) => b.score - a.score);
}

function displayResults(scores) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h3>Top Locations:</h3>';

    scores.forEach((location, index) => {
        // Add marker to map
        const marker = L.marker([location.lat, location.lng])
            .bindPopup(`Location ${index + 1}<br>Score: ${location.score}`)
            .addTo(map);

        // Add to results list
        resultsDiv.innerHTML += `
            <p>Location ${index + 1}: Score ${location.score}</p>
        `;
    });
}

// Initial validation
validateTotalWeight();