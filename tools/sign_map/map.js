let map;
let selectedMarkers = [];
let markersByStatus = {};

const statusColors = {
  "Dropped off": "green",
  "Wait to drop off": "orange",
  "Dropoff time needs review": "blue",
  "Ready to drop off": "lightgreen",
  "Not SoCo": "gray",
  "Delivery Assigned": "purple",
  "Refused": "red",
};

// Save the checkbox states to localStorage
function saveCheckboxState() {
  const checkboxes = document.querySelectorAll('.status-filter');
  checkboxes.forEach(checkbox => {
    localStorage.setItem(checkbox.value, checkbox.checked);
  });
}

// Load the checkbox states from localStorage
function loadCheckboxState() {
  const checkboxes = document.querySelectorAll('.status-filter');
  checkboxes.forEach(checkbox => {
    const savedState = localStorage.getItem(checkbox.value);
    if (savedState !== null) {
      checkbox.checked = savedState === 'true';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadCheckboxState();
  filterMarkersByStatus();
});

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

    data.forEach((row, index) => {
      console.log(row, index)
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
      marker.data["index"] = index

      if (!markersByStatus[row.Status]) {
        markersByStatus[row.Status] = [];
      }
      markersByStatus[row.Status].push(marker);

      pinElement.element.addEventListener('pointerdown', function(event) {
        event.preventDefault();
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
    deleteTableEntry(marker);
  }
}

function clearSelectedMarkers() {
  // Deselect all markers
  selectedMarkers.slice().forEach(marker => {
    const pinElement = marker.pinElement;
    deselectMarker(marker, pinElement);
  });

  // Clear the selectedMarkers array
  selectedMarkers = [];

  // Clear all cards
  document.getElementById('status-card-container').innerHTML = '';

  console.log("All markers deselected.");
}

function filterMarkersByStatus() {
  const selectedStatuses = Array.from(document.querySelectorAll('.status-filter:checked')).map(checkbox => checkbox.value);

  saveCheckboxState();

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




