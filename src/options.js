import { game, getGlobals, hero } from './globals.js';
import { showConfirmDialog } from './ui/ui.js';
import { createModal } from './ui/modal.js';
import { apiFetch, loadGameData, saveGameData } from './api.js';
import { crypt } from './functions.js';

// Options class to store options and version (future-proof for migrations)
export class Options {
  constructor(data = {}) {
    this.version = data.version || '0.0.2'; // Set to latest version
    // Add more options fields as needed
  }

  /**
   * Main entry to initialize the Options tab UI.
   */
  initializeOptionsUI() {
    const optionsTab = document.getElementById('options');
    if (!optionsTab) return;
    optionsTab.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'options-container';
    container.appendChild(this._createCloudSaveBar());

    // --- Changelog & Upcoming buttons row ---
    const changelogRow = document.createElement('div');
    changelogRow.className = 'changelog-row';
    changelogRow.appendChild(this._createChangelogButton());
    changelogRow.appendChild(this._createUpcomingButton());
    container.appendChild(changelogRow);

    container.appendChild(this._createDiscordSection());
    container.appendChild(this._createResetButton());
    optionsTab.appendChild(container);

    this._initCloudSaveButtons();
  }

  /**
   * Creates the cloud save/load bar UI.
   */
  _createCloudSaveBar() {
    const bar = document.createElement('div');
    bar.className = 'cloud-save-bar';
    bar.innerHTML = `
      <span id="cloud-save-status">Checking login...</span>
      <button id="cloud-save-btn" disabled>Save to Cloud</button>
      <button id="cloud-load-btn" disabled>Load from Cloud</button>
    `;
    return bar;
  }

  /**
   * Creates the reset progress button and its logic.
   */
  _createResetButton() {
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-progress';
    resetButton.textContent = 'Reset All Progress';
    resetButton.onclick = async () => {
      try {
        const confirmed = await showConfirmDialog(
          'Are you sure you want to reset all progress? This cannot be undone!'
        );
        if (confirmed) {
          game.resetAllProgress();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error resetting progress:', error);
        alert('An error occurred while resetting progress.');
      }
    };
    return resetButton;
  }

  /**
   * Creates the changelog button and its modal logic.
   */
  _createChangelogButton() {
    const changelogBtn = document.createElement('button');
    changelogBtn.id = 'view-changelog';
    changelogBtn.textContent = 'View Changelog';
    changelogBtn.onclick = async () => {
      const { marked } = await import('marked');
      // Use Vite's import.meta.glob to dynamically import all changelog files
      const changelogModules = import.meta.glob('./changelog/*.md', { as: 'raw' });
      const entries = Object.entries(changelogModules)
        .map(([path, loader]) => {
          const match = path.match(/([\d.]+)\.md$/);
          return match ? { version: match[1], loader } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true, sensitivity: 'base' }));
      const changelogs = await Promise.all(
        entries.map(async (entry) => {
          try {
            const text = await entry.loader();
            return { ...entry, text };
          } catch {
            return { ...entry, text: '(Could not load changelog)' };
          }
        })
      );
      let content = `<div class="changelog-modal-content">`;
      content += `<button class="modal-close">X</button>`;
      content += `<h2>Changelog</h2>`;
      changelogs.forEach((entry, i) => {
        const expanded = i === 0 ? 'expanded' : '';
        // Add (current) to the latest version
        const versionLabel = i === 0 ? `Version ${entry.version} <span class="changelog-current">(current)</span>` : `Version ${entry.version}`;
        content += `
          <div class="changelog-entry ${expanded}">
            <div class="changelog-header" data-index="${i}">
              <span class="changelog-version">${versionLabel}</span>
              <span class="changelog-toggle">${expanded ? '▼' : '►'}</span>
            </div>
            <div class="changelog-body" style="display:${expanded ? 'block' : 'none'}">${
          entry.text ? marked.parse(entry.text) : ''
        }</div>
          </div>
        `;
      });
      content += `</div>`;
      const modal = createModal({
        id: 'changelog-modal',
        className: 'changelog-modal',
        content,
      });
      modal.querySelectorAll('.changelog-header').forEach((header) => {
        header.addEventListener('click', () => {
          const entry = header.parentElement;
          const body = entry.querySelector('.changelog-body');
          const toggle = entry.querySelector('.changelog-toggle');
          const expanded = entry.classList.toggle('expanded');
          if (expanded) {
            body.style.display = 'block';
            toggle.textContent = '▼';
          } else {
            body.style.display = 'none';
            toggle.textContent = '►';
          }
        });
      });
    };
    return changelogBtn;
  }

  /**
   * Creates the Upcoming Changes button and its modal logic.
   */
  _createUpcomingButton() {
    const upcomingBtn = document.createElement('button');
    upcomingBtn.id = 'view-upcoming';
    upcomingBtn.textContent = 'View Upcoming Changes';
    upcomingBtn.onclick = async () => {
      const { marked } = await import('marked');
      // Use Vite's import.meta.glob to dynamically import the upcoming file
      const upcomingModules = import.meta.glob('./upcomming.md', { as: 'raw' });
      const loader = upcomingModules['./upcomming.md'];
      let text = '';
      try {
        text = loader ? await loader() : '(No upcoming changes found)';
      } catch {
        text = '(Could not load upcoming changes)';
      }
      let content = `<div class="changelog-modal-content">`;
      content += `<button class="modal-close">X</button>`;
      content += `<h2>Upcoming Changes</h2>`;
      content += `<div class="changelog-body">${text ? marked.parse(text) : ''}</div>`;
      content += `</div>`;
      const modal = createModal({
        id: 'upcoming-modal',
        className: 'changelog-modal',
        content,
      });
    };
    return upcomingBtn;
  }

  /**
   * Creates the Discord section.
   */
  _createDiscordSection() {
    const section = document.createElement('div');
    section.className = 'options-section';
    section.innerHTML = `
      <a
        href="https://discord.gg/pvCxff4s"
        target="_blank"
        rel="noopener noreferrer"
        class="discord-link"
        aria-label="Join our Discord"
      >
        <span>Join our Discord</span>
      </a>
    `;
    return section;
  }

  _initCloudSaveButtons() {
    // Cloud Save UI logic
    const cloudSaveStatus = document.getElementById('cloud-save-status');
    const cloudSaveBtn = document.getElementById('cloud-save-btn');
    const cloudLoadBtn = document.getElementById('cloud-load-btn');
    let lastCloudSave = null;
    let userSession = null;
    const isLocal = import.meta.env.VITE_IS_LOCAL === 'true';
    const gameName = import.meta.env.VITE_GAME_NAME || 'endless';

    async function checkSession() {
      try {
        const res = await apiFetch(`/user/session`, { credentials: 'include' });
        if (!res.ok) throw new Error('Not logged in');
        userSession = (await res.json()).user;

        // Fetch cloud save and compare with local
        let cloudInfo = null;
        let updatedAt = null;
        try {
          const cloudResult = await loadGameData(userSession.id, userSession.token);

          cloudInfo = cloudResult?.data?.hero;
          updatedAt = cloudResult?.updated_at || cloudResult?.data?.updated_at;
        } catch (e) {
          console.error('Failed to load cloud data:', e);
        }

        const localHero = hero;
        let statusMsg = 'Ready to save to cloud';
        const formatDateWithTimezone = (dateStr) => {
          if (!dateStr) return 'unknown';
          const date = new Date(dateStr);
          const options = {
            year: 'numeric',
            month: 'short', // e.g., "May"
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          };
          return date.toLocaleString(undefined, options);
        };
        if (cloudInfo && (cloudInfo.exp !== localHero.exp || cloudInfo.gold !== localHero.gold)) {
          statusMsg = `Last save: ${formatDateWithTimezone(updatedAt)}`;
        } else if (updatedAt) {
          statusMsg = `Last save: ${formatDateWithTimezone(updatedAt)}`;
        } else if (!updatedAt) {
          statusMsg = 'Ready to save';
        }

        cloudSaveStatus.textContent = statusMsg;
        cloudSaveStatus.className = '';
        cloudSaveBtn.disabled = false;
        cloudSaveBtn.classList.remove('disabled');
        cloudLoadBtn.disabled = false;
        cloudLoadBtn.classList.remove('disabled');
      } catch (error) {
        console.error('Not logged in or session expired:', error);

        userSession = null;
        let loginUrl = '/login';
        if (isLocal) {
          loginUrl = 'http://localhost:5173/login';
        }
        cloudSaveStatus.innerHTML =
          '<span class="login-status">Not logged in</span><div><a href="' +
          loginUrl +
          '" class="login-link" target="_blank">Log in</a></div>';
        cloudSaveStatus.className = 'not-logged-in';
        cloudSaveBtn.disabled = true;
        cloudSaveBtn.classList.add('disabled');
        cloudLoadBtn.disabled = true;
        cloudLoadBtn.classList.add('disabled');
      }
    }

    // Save
    cloudSaveBtn.addEventListener('click', async () => {
      if (!userSession) return;
      cloudSaveBtn.disabled = true;
      cloudSaveStatus.textContent = 'Saving...';
      cloudSaveStatus.className = 'saving';
      try {
        await saveGameData(
          userSession.id,
          {
            data_json: crypt.encrypt(JSON.stringify(getGlobals())),
            game_name: gameName,
          },
          userSession.token
        );
        lastCloudSave = Date.now();
        cloudSaveStatus.textContent = `Last cloud save: ${new Date(lastCloudSave).toLocaleTimeString()}`;
      } catch (e) {
        console.error('Cloud save failed:', e);
        cloudSaveStatus.textContent = 'Cloud save failed';
        cloudSaveStatus.className = 'failed';
      } finally {
        cloudSaveBtn.disabled = !userSession;
      }
    });

    // Load
    cloudLoadBtn.addEventListener('click', async () => {
      if (!userSession) return;
      cloudLoadBtn.disabled = true;
      cloudLoadBtn.textContent = 'Loading...';
      try {
        const { data: cloudData } = await loadGameData(userSession.id, userSession.token);

        if (!cloudData) throw new Error('No cloud save found');
        // Extract info for confirmation
        const info = cloudData.hero || {};
        const msg = `Cloud Save Info:\n\nLevel: ${info.level || 1}\nGold: ${info.gold || 0}\nCrystals: ${
          info.crystals || 0
        }\nSouls: ${
          info.souls || 0
        }\n\nAre you sure you want to overwrite your local save with this cloud save? This cannot be undone.`;
        const confirmed = await showConfirmDialog(msg);
        if (confirmed) {
          localStorage.setItem('gameProgress', JSON.stringify({ ...cloudData, lastUpdated: Date.now() }));
          window.location.reload();
        }
      } catch (e) {
        console.error('Failed to load from cloud:', e);
      } finally {
        cloudLoadBtn.disabled = !userSession;
        cloudLoadBtn.textContent = 'Load from Cloud';
      }
    });

    // Check session on load and every 60m
    checkSession();
    setInterval(checkSession, 60000 * 60); // 60 minutes
  }
}
