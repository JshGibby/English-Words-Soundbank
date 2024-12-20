const SESSIONSTORAGE_KEY = 'https://websim.ai'; // [1] Updated key to reflect the correct origin
  let isPlaying = false;
  let currentWad = null; // [1] Updated to use Wad instead of Audio
  let playbackRate = 1.0;

  // Function to fetch and save JSON content to SessionStorage
  // Assuming the JSON URL is correctly pointed to the websim.ai resource
  const JSON_URL = 'https://raw.githubusercontent.com/JshGibby/English-Words-Soundbank/refs/heads/main/Audio.txt'; // [1] Update this to the correct JSON URL
  async function saveJsonToSessionStorage() {
    try {
      const response = await fetch(JSON_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch JSON file.');
      }
      const jsonData = await response.json();
      sessionStorage.setItem(SESSIONSTORAGE_KEY, JSON.stringify(jsonData));
      console.log('JSON data saved to Session Storage.');
    } catch (error) {
      console.error('Error saving JSON to Session Storage:', error);
    }
  }

  // Initialize SessionStorage with JSON content if it doesn't exist
  if (!sessionStorage.getItem(SESSIONSTORAGE_KEY)) {
    saveJsonToSessionStorage();
  }

  function getRandomAudioKey() {
    return Math.floor(Math.random() * 500) + 1; // Random number between 1 and 500
  }

  function getAudioUrlFromSessionStorage(key) {
    const ghostboxData = sessionStorage.getItem(SESSIONSTORAGE_KEY);
    if (!ghostboxData) {
      console.warn('Session Storage data is not available.');
      return null;
    }

    const parsedData = JSON.parse(ghostboxData);
    return parsedData[key] || null; // Return the audio URL or null if key not found
  }

  async function playNextAudio() {
    if (!isPlaying) return;

    const randomKey = getRandomAudioKey();
    const audioUrl = getAudioUrlFromSessionStorage(randomKey);

    if (!audioUrl) {
      console.warn('No valid audio URL found for key:', randomKey);
      playNextAudio(); // Skip to the next audio if URL is invalid
      return;
    }

    // Using Wad to play the audio [1]
    if (currentWad) {
      currentWad.stop(); // Stop any currently playing audio
    }
    
    currentWad = new Wad({ source: audioUrl, playbackRate: playbackRate });
    currentWad.play().then(() => {
      // Play the next audio after the current one ends
      currentWad.on('ended', playNextAudio);
    }).catch(error => {
      console.warn('Error playing audio with Wad, skipping to next:', error);
      playNextAudio(); // Skip to the next audio if playing fails
    });
  }

  function updateGhostboxButton() {
    const button = document.getElementById('ghostbox-button');
    button.textContent = isPlaying? 'Stop Ghostbox' : '👻 Ghostbox';
  }

  document.getElementById('ghostbox-button').addEventListener('click', () => {
    if (!isPlaying) {
      isPlaying = true;
      playNextAudio();
    } else {
      isPlaying = false;
      if (currentWad) {
        currentWad.stop();
        currentWad = null;
      }
    }
    updateGhostboxButton();
  });

  document.getElementById('speed-slider').addEventListener('input', e => {
    playbackRate = parseFloat(e.target.value);
    document.getElementById('speed-value').textContent = playbackRate.toFixed(2);
    if (currentWad) {
      currentWad.playbackRate = playbackRate; // [1]
    }
  });
