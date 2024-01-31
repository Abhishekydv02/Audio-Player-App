import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const AudioPlayer = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    // Load playlist and last playing track from localStorage on page load
    const storedPlaylist = JSON.parse(localStorage.getItem('playlist')) || [];
    const lastPlayingIndex = parseInt(localStorage.getItem('lastPlayingIndex')) || 0;

    setPlaylist(storedPlaylist);
    setCurrentTrackIndex(lastPlayingIndex);
  }, []);

  useEffect(() => {
    // Save playlist and last playing track to localStorage
    localStorage.setItem('playlist', JSON.stringify(playlist));
    localStorage.setItem('lastPlayingIndex', currentTrackIndex.toString());
  }, [playlist, currentTrackIndex]);

  useEffect(() => {
    // Play next track automatically when the current track ends
    if (isPlaying && audioRef.current && audioRef.current.ended) {
      handleNext();
    }
  }, [isPlaying, currentTrackIndex]);

  const handleFileChange = (e) => {
    const files = e.target.files;
    const newPlaylist = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setPlaylist([...playlist, ...newPlaylist]);
  };

  const handlePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      audioRef.current.play();
    } else {
      setIsPlaying(false);
      audioRef.current.pause();
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
    setIsPlaying(true);
  
    // Pause and reset currentTime before playing the next track
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  
    // Load the next track
    audioRef.current.src = playlist[currentTrackIndex]?.url;
  
    // Wait for the audio to be fully loaded before playing
    audioRef.current.addEventListener('canplaythrough', () => {
      audioRef.current.play();
    });
  
    // Note: You may want to remove the event listener if the component unmounts
  };
  
  
  

  const handleSelectTrack = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    audioRef.current.currentTime = seekTime;
  };

  const handleEnded = () => {
    // Auto play next track when the current track ends
    handleNext();
    setIsPlaying(true); // Pause after the track ends
  };

  return (
    <div className="audio-container" >
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <audio
        ref={audioRef}
        src={playlist[currentTrackIndex]?.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      <div>
        <h2>Playlist</h2>
        <ul>
          {playlist.map((track, index) => (
            <li key={index}>
              <button onClick={() => handleSelectTrack(index)}>
                {index === currentTrackIndex ? (
                  <strong>{track.name}</strong>
                ) : (
                  <span>{track.name}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Now Playing</h2>
        <p>{playlist[currentTrackIndex]?.name || 'No track playing'}</p>
        <div>
          <button onClick={handlePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
          <button onClick={handleNext}>Next</button>
        </div>
        <input
          type="range"
          value={currentTime}
          max={audioRef.current?.duration || 0}
          onChange={handleSeek}
        />
        <p>{formatTime(currentTime)}</p>
      </div>
    </div>
  );
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  return `${formattedMinutes}:${formattedSeconds}`;
};

function App() {
  return (
    <div className="app-container">
      <h1 className="app-title">Audio Player App</h1>
      <AudioPlayer />
    </div>
  );
}

export default App;
