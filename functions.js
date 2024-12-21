import { game } from "./main.js";

export const handleSavedData = (savedData, self) => {
  if (savedData) {
    Object.keys(self).forEach((key) => {
      if (savedData.hasOwnProperty(key)) {
        if (typeof self[key] === 'object' && !Array.isArray(self[key]) && savedData[key] !== null) {
          self[key] = { ...self[key], ...savedData[key] };
        } else {
          self[key] = savedData[key];
        }
      }
    });
  }
};


// Debugging

export function createDebugUI() {
  const indentPx = 10;
  const debugDiv = document.createElement('div');
  debugDiv.style.position = 'fixed';
  debugDiv.style.top = '0';
  debugDiv.style.left = '0';
  debugDiv.style.backgroundColor = 'black';
  debugDiv.style.color = 'white'; // For readability
  debugDiv.style.border = '1px solid black';
  debugDiv.style.padding = '10px';
  debugDiv.style.maxHeight = '100%';
  debugDiv.style.maxWidth = '350px';
  debugDiv.style.overflowY = 'scroll';
  debugDiv.style.zIndex = '9999';
  debugDiv.style.fontFamily = 'monospace';
  debugDiv.style.fontSize = '12px';
  document.body.appendChild(debugDiv);

  // Load saved expanded states
  const expandedState = new Map(JSON.parse(localStorage.getItem('debugUIState') || '[]'));

  // Save expanded state whenever it changes
  function saveExpandedState() {
    localStorage.setItem('debugUIState', JSON.stringify([...expandedState]));
  }

  // Helper function to render nested objects and arrays with spacing
  function renderObject(obj, parent, path = '', level = 0) {
    if (typeof obj !== 'object' || obj === null) {
      // Display primitive values
      const span = document.createElement('span');
      span.style.marginLeft = `${level * indentPx}px`; // Indentation for levels
      span.textContent = JSON.stringify(obj);
      parent.appendChild(span);
      return;
    }

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const fullPath = `${path}.${key}`;

        if (typeof value === 'object' && value !== null) {
          // Create expandable details for objects and arrays
          const details = document.createElement('details');
          details.style.marginLeft = `${level * indentPx}px`; // Indentation for levels

          // Preserve expansion state
          if (expandedState.has(fullPath)) {
            details.open = expandedState.get(fullPath);
          } else {
            details.open = true; // Default: Expanded
          }

          // Track changes to the expansion state
          details.addEventListener('toggle', () => {
            expandedState.set(fullPath, details.open);
            saveExpandedState();
          });

          const summary = document.createElement('summary');
          summary.textContent = key;
          summary.style.cursor = 'pointer';
          summary.style.fontWeight = 'bold';
          summary.style.color = 'orange';
          if (Array.isArray(value)) {
            summary.textContent = key + '[]';
            summary.style.color = 'yellow';
          }

          if (level === 0) {
            summary.style.fontSize = '18px';
            summary.style.color = '#00ff00';
          }

          details.appendChild(summary);

          // Recursively render child objects
          renderObject(value, details, fullPath, level + 1);
          parent.appendChild(details);
        } else {
          // Display primitive properties as plain text
          const span = document.createElement('span');
          span.style.marginLeft = `${(level + 1) * indentPx}px`; // Indentation for properties
          span.textContent = `${key}: ${JSON.stringify(value)}`;
          parent.appendChild(span);
          parent.appendChild(document.createElement('br'));
        }
      }
    }
  }

  // Function to update the UI
  function updateDebugUI() {
    debugDiv.innerHTML = ''; // Clear current UI

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      let value;

      if (key === 'debugUIState') continue;

      try {
        value = JSON.parse(localStorage.getItem(key));
      } catch {
        value = localStorage.getItem(key); // Non-JSON values
      }

      const fullPath = key;
      const details = document.createElement('details');

      // Preserve expansion state
      if (expandedState.has(fullPath)) {
        details.open = expandedState.get(fullPath);
      } else {
        details.open = true; // Default: Expanded
      }

      // Track changes to the expansion state
      details.addEventListener('toggle', () => {
        expandedState.set(fullPath, details.open);
      });

      const summary = document.createElement('summary');
      summary.textContent = key;
      details.appendChild(summary);

      // Render the nested object or value
      renderObject(value, details, fullPath, 0);
      debugDiv.appendChild(details);
    }
  }

  // Initial update and monitor changes
  updateDebugUI();
  setInterval(updateDebugUI, 1000);
  setInterval(game.saveGame, 1000);
}

