let map;
let selectedMarkers = [];
let markersByStatus = {};

const statusColors = {
  "Dropped off": "green",
  "Wait to drop off": "orange",
  "Dropoff time needs review": "blue",
  "Ready to drop off": "lightgreen",
  "Not SoCo": "gray",
  "Delivery Assigned": "purple"
};

async function initMap() {
  const position = { lat: 38.5780, lng: -122.9888 };
  
  const { Map } = await google.maps.importLibrary("maps");
  const { PinElement, AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  map = new Map(document.getElementById("map"), {
    zoom: 9,
    center: position,
    mapId: "DEMO_MAP_ID",
  });

  await addMarkersFromAPI(AdvancedMarkerElement, PinElement);

  document.querySelectorAll('.status-filter').forEach(checkbox => {
    checkbox.addEventListener('change', filterMarkersByStatus);
  });

  filterMarkersByStatus();
}

async function addMarkersFromAPI(AdvancedMarkerElement, PinElement) {
  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbypdIso2CLqw1qIGmiA7BAvxwzpeMz-cFS04PV38fycccrgJurRK25arVye2XbQ4sto/exec');
    const data = await response.json();

    data.forEach((row) => {
      const latLon = row.LatLon.split(",");
      const lat = parseFloat(latLon[0]);
      const lng = parseFloat(latLon[1]);

      const markerColor = statusColors[row.Status] || "red";

      const pinElement = new PinElement({
        background: markerColor,
        borderColor: "black",
        glyphColor: "transparent",
        scale: .7,
      });

      const markerPosition = { lat: lat, lng: lng };
      const marker = new AdvancedMarkerElement({
        position: markerPosition,
        map: map,
        content: pinElement.element,
        title: row.Status || "Unknown",
      });

      marker.pinElement = pinElement;
      marker.data = row

      if (!markersByStatus[row.Status]) {
        markersByStatus[row.Status] = [];
      }
      markersByStatus[row.Status].push(marker);

      pinElement.element.addEventListener('click', function() {
        toggleMarkerSelection(marker, pinElement);
      });
    });

    updateMarkerCounts();

  } catch (error) {
    console.error("Error fetching or parsing API data:", error);
  }
}

function toggleMarkerSelection(marker, pinElement) {
  const index = selectedMarkers.indexOf(marker);

  if (index === -1) {
    selectMarker(marker, pinElement);
  } else {
    deselectMarker(marker, pinElement);
  }

  console.log("Selected markers:", selectedMarkers);
}

function selectMarker(marker, pinElement) {
  selectedMarkers.push(marker);
  pinElement.borderColor = 'gold';
  pinElement.glyphColor = 'blue';
  pinElement.element.style.transform = 'scale(1.3)';
  addCardForMarker(marker);
}

function deselectMarker(marker, pinElement) {
  const index = selectedMarkers.indexOf(marker);
  if (index !== -1) {
    selectedMarkers.splice(index, 1);
    pinElement.borderColor = 'black';
    pinElement.glyphColor = 'transparent';
    pinElement.element.style.transform = 'scale(1)';
    removeCardForMarker(marker);
  }
}

function clearSelectedMarkers() {
  selectedMarkers.slice().forEach(marker => {
    const pinElement = marker.pinElement;
    deselectMarker(marker, pinElement);
  });

  selectedMarkers = [];

  console.log("All markers deselected.");
}

function addCardForMarker(marker) {
  let data = marker.data;
  const googleMapsLink = `https://www.google.com/maps?q=${data.LatLon}`;
  const card = `
      <div class="card">
          <div class="card-section">
              <p><span class="highlight">Status:</span> ${data.Status}</p>
              <p><span class="highlight">Name:</span> ${data["First Name"]} ${data["Last Name"]}</p>
              <p><span class="highlight">What they want:</span> ${data["What they want"]}</p>
              <p><span class="highlight">Notes:</span> ${data.Notes}</p>
              <p><span class="highlight">Source:</span> ${data.Source}</p>
          </div>
          <div class="card-section">
              <p><span class="highlight">City:</span> ${data.City}</p>
              <p><span class="highlight">Address:</span> ${data.Address}</p>
              <p><span class="highlight">Zipcode:</span> ${data.Zipcode}</p>
              <p><span class="highlight">LatLon:</span> ${data.LatLon}</p>
              <p><a href="${googleMapsLink}" target="_blank">View on Google Maps</a></p>
          </div>
      </div>
  `;

  document.getElementById('status-card-container').innerHTML += card;

  generateDirections(selectedMarkers);
}

function removeCardForMarker(marker) {
  const cardId = `marker-card-${marker.position.lat}-${marker.position.lng}`;
  const card = document.getElementById(cardId);
  if (card) {
    card.remove();
  }
  
  generateDirections(selectedMarkers);
}

function filterMarkersByStatus() {
  const selectedStatuses = Array.from(document.querySelectorAll('.status-filter:checked')).map(checkbox => checkbox.value);

  for (const status in markersByStatus) {
    const markers = markersByStatus[status];
    markers.forEach(marker => {
      if (selectedStatuses.includes(status)) {
        marker.map = map;
      } else {
        marker.map = null;
        const index = selectedMarkers.indexOf(marker);
        if (index !== -1) {
          const pinElement = marker.pinElement;
          deselectMarker(marker, pinElement);
        }
      }
    });
  }

  console.log("Selected statuses:", selectedStatuses);
}

function updateMarkerCounts() {
  for (const status in markersByStatus) {
    const count = markersByStatus[status].length;
    const sanitizedStatus = status.replace(/\s+/g, '-');
    const countElement = document.getElementById(`${sanitizedStatus}-count`);
    if (countElement) {
      countElement.textContent = count;
    }
  }
}

function generateDirections(markers) {
    const maxStopsPerLink = 10;  // Max stops Google Maps can handle per link (including current location and destination)
    const directionContainer = document.getElementById('direction-container');
    directionContainer.innerHTML = ''; // Clear the container

    if (markers.length === 0) {
        directionContainer.innerHTML = '<p>No locations selected.</p>';
        return;
    }

    let googleMapsLinks = [];
    let numMarkers = markers.length;
    let index = 0;

    while (index < numMarkers) {
        let directionsLink = '';

        if (index === 0) {
            // First segment starts at the user's current location
            directionsLink = "https://www.google.com/maps/dir/current+location/";
        } else {
            // Subsequent segments start at the end of the previous segment
            directionsLink = `https://www.google.com/maps/dir/${markers[index - 1].LatLon}/`;
        }

        // Calculate the end index of this segment
        let endIndex = Math.min(index + maxStopsPerLink - 2, numMarkers - 1);  // -2 because we already used the start point

        // Add all markers in the current batch to the directions URL
        for (let i = index; i <= endIndex; i++) {
            directionsLink += `${markers[i].LatLon}/`;
        }

        // Add the link to the array
        googleMapsLinks.push(directionsLink);
        index = endIndex + 1;  // Move to the next batch
    }

    // Create a card-like container to hold the links
    const cardContainer = document.createElement('div');
    cardContainer.className = 'card-container';

    // Add a title and description
    const title = document.createElement('h3');
    title.innerText = 'Generated Directions';
    cardContainer.appendChild(title);

    const description = document.createElement('p');
    description.innerText = 'These links will guide you to travel between the selected addresses in the order you selected them. Click each link to get step-by-step directions.';
    cardContainer.appendChild(description);

    // Add the links to the container
    googleMapsLinks.forEach((link, idx) => {
        const linkElement = document.createElement('a');
        linkElement.href = link;
        linkElement.target = '_blank';
        linkElement.className = 'link-button';

        // Only add "Link 1", "Link 2", etc. if there are multiple links
        if (googleMapsLinks.length > 1) {
            linkElement.innerText = `Directions Link ${idx + 1}`;
        } else {
            linkElement.innerText = `Directions Link`;
        }

        cardContainer.appendChild(linkElement);
    });

    // If there were multiple links, add an explanation
    if (googleMapsLinks.length > 1) {
        const explanation = document.createElement('p');
        explanation.className = 'explanation';
        explanation.innerText = `The route was split into ${googleMapsLinks.length} segments because Google Maps can only handle up to ${maxStopsPerLink} stops per link, including your current location. Each new link starts from where the previous link ended.`;
        cardContainer.appendChild(explanation);
    }

    // Add the card container to the direction container
    directionContainer.appendChild(cardContainer);
}

