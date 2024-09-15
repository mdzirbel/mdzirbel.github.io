
// Shows the directions and location cards
function addCardForMarker(marker) {
  let data = marker.data;
  const googleMapsLink = `https://www.google.com/maps?q=${data.LatLon}`;
  const index = data.index;

  // Create a unique ID based on the marker's index
  const cardId = `marker-card-row-${index}`;

  // Prevent adding duplicate cards
  if (document.getElementById(cardId)) return;

  // Generate status class for styling
  const statusClass = 'status-' + data.Status.replace(/\s+/g, '-').toLowerCase();

  const card = `
      <div class="card ${statusClass}" id="${cardId}">
          <div class="card-section">
              <p id="status-text-${cardId}"><span class="highlight">Status:</span> ${data.Status}</p>
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
          <div class="card-section">
              <label for="status-select-${cardId}"><span class="highlight">Select Status:</span></label>
              <select id="status-select-${cardId}" class="status-select">
                  <option value="Dropped off">Mark delivered</option>
                  <option value="Refused">Mark refused</option>
              </select>
              <button onclick="sendStatus('${cardId}', ${index})">Send</button>
          </div>
      </div>
  `;

  document.getElementById('status-card-container').innerHTML += card;
  generateDirections(selectedMarkers);
}

function sendStatus(cardId, index) {
  console.log(`Sending status for index: ${index}`);

  const selectElement = document.getElementById(`status-select-${cardId}`);
  const selectedStatus = selectElement.value;

  const payload = JSON.stringify({
    newValue: selectedStatus,
    rowNumbers: [index],
  });

  fetch('https://script.google.com/macros/s/AKfycbyUYHiRtdlw4ZFhdut-mfw_4Adrg2Z3gh5Qpk7EaADuB69xa-lLPjbXJnt04Y9n2zC_/exec', {
    method: 'POST',
    mode: 'no-cors', // This makes CORS not delete our request, but prevents us from getting anything back
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload,
  });

  console.log('Sent:', payload);

  // Update the Status text
  document.getElementById(`status-text-${cardId}`).innerHTML = `<span class="highlight">Status:</span> ${selectedStatus}`;

  // Update the card's status class
  const cardElement = document.getElementById(cardId);
  const cardClassList = cardElement.classList;
  const oldStatusClass = Array.from(cardClassList).find(cls => cls.startsWith('status-'));
  const newStatusClass = 'status-' + selectedStatus.replace(/\s+/g, '-').toLowerCase();

  if (oldStatusClass) {
    cardClassList.remove(oldStatusClass);
  }
  cardClassList.add(newStatusClass);

  // Show a success toast
  Toastify({
    text: "Status updated successfully!",
    duration: 3000, // Duration in milliseconds
    close: true,    // Add a close button
    gravity: "top", // Top position
    position: "right", // Right position
    backgroundColor: "#4CAF50", // Success green color
    stopOnFocus: true, // Stops the timer when hovering
  }).showToast();
}

function removeCardForMarker(marker) {
  const cardId = `marker-card-row-${marker.data.index}`;
  const card = document.getElementById(cardId);
  if (card) {
    card.remove();
  }
  generateDirections(selectedMarkers);
}


function generateDirections(markers) {
  const maxStopsPerLink = 10; // Max stops Google Maps can handle per link (including current location and destination)
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
      directionsLink = `https://www.google.com/maps/dir/${markers[index - 1].data.LatLon}/`;
    }

    let endIndex = Math.min(index + maxStopsPerLink - 2, numMarkers - 1); // -2 because we already used the start point

    // Add all markers in the current batch to the directions URL
    for (let i = index; i <= endIndex; i++) {
      directionsLink += `${markers[i].data.LatLon}/`;
    }

    googleMapsLinks.push(directionsLink);
    index = endIndex + 1; // Move to the next batch
  }

  const cardContainer = document.createElement('div');
  cardContainer.className = 'card-container';

  const title = document.createElement('h3');
  title.innerText = 'Generated Directions';
  cardContainer.appendChild(title);

  const description = document.createElement('p');
  description.innerText = 'These links will guide you to travel between the selected addresses in the order you selected them. Click each link to get step-by-step directions.';
  cardContainer.appendChild(description);

  googleMapsLinks.forEach((link, idx) => {
    const linkElement = document.createElement('a');
    linkElement.href = link;
    linkElement.target = '_blank';
    linkElement.className = 'link-button';

    if (googleMapsLinks.length > 1) {
      linkElement.innerText = `Directions Link ${idx + 1}`;
    } else {
      linkElement.innerText = `Directions Link`;
    }

    cardContainer.appendChild(linkElement);
  });

  if (googleMapsLinks.length > 1) {
    const explanation = document.createElement('p');
    explanation.className = 'explanation';
    explanation.innerText = `The route was split into ${googleMapsLinks.length} segments because Google Maps can only handle up to ${maxStopsPerLink} stops per link, including your current location. Each new link starts from where the previous link ended.`;
    cardContainer.appendChild(explanation);
  }

  directionContainer.appendChild(cardContainer);
}
