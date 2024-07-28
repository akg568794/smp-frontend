import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('https://smp-backend.onrender.com');

const MusicPlayer = () => {
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audioPlayer = audioRef.current;
    if (!audioPlayer) return;

    const handleSync = (data) => {
      if (audioPlayer) {
        const timeDifference = Math.abs(audioPlayer.currentTime - data.currentTime);
        if (timeDifference > 1) {
          audioPlayer.currentTime = data.currentTime;
        }
        if (data.action === 'play') {
          audioPlayer.play().catch(error => console.error('Error playing audio:', error));
        } else if (data.action === 'pause') {
          audioPlayer.pause();
        }
      }
    };

    socket.on('sync', handleSync);

    const updateProgress = () => {
      if (audioPlayer) {
        setCurrentTime(audioPlayer.currentTime);
        setProgress((audioPlayer.currentTime / audioPlayer.duration) * 100);
        if (audioPlayer.duration) {
          setDuration(audioPlayer.duration);
        }
      }
    };

    const handleAudioError = (error) => {
      console.error('Audio playback error:', error);
    };

    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('error', handleAudioError);
    audioPlayer.addEventListener('canplaythrough', () => {
      console.log('Audio can play through');
    });

    return () => {
      socket.off('sync', handleSync);
      if (audioPlayer) {
        audioPlayer.removeEventListener('timeupdate', updateProgress);
        audioPlayer.removeEventListener('error', handleAudioError);
      }
    };
  }, []);

  const handlePlay = () => {
    const audioPlayer = audioRef.current;
    if (audioPlayer) {
      audioPlayer.play().catch(error => console.error('Error playing audio:', error));
      socket.emit('sync', { action: 'play', currentTime: audioPlayer.currentTime });
    }
  };

  const handlePause = () => {
    const audioPlayer = audioRef.current;
    if (audioPlayer) {
      console.log('Pause button clicked');
      audioPlayer.pause();
      socket.emit('sync', { action: 'pause', currentTime: audioPlayer.currentTime });
    }
  };

  const handleSeeked = () => {
    const audioPlayer = audioRef.current;
    if (audioPlayer) {
      socket.emit('sync', { action: 'seek', currentTime: audioPlayer.currentTime });
    }
  };

  const handlePlaybackRateChange = (event) => {
    const audioPlayer = audioRef.current;
    const rate = parseFloat(event.target.value);
    setPlaybackRate(rate);
    if (audioPlayer) {
      audioPlayer.playbackRate = rate;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs w-full">
        <img
          src="https://images.pexels.com/photos/9653900/pexels-photo-9653900.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Album Art"
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
        <h1 className="text-xl font-bold mb-1">Finer Things</h1>
        <p className="text-gray-600 mb-4">Casey Veggies & Rockie Fresh</p>
        <audio
          ref={audioRef}
          className="hidden"
          onSeeked={handleSeeked}
        >
          <source src="/Krishna-Flute.mp3" type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePlay}
            className="px-4 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
          >
            &#9654;
          </button>
          <button
            onClick={handlePause}
            className="px-4 py-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
          >
            &#10074;&#10074;
          </button>
        </div>
        <div className="w-full mb-4">
          <div className="w-full bg-gray-300 h-1 rounded-lg">
            <div
              className="bg-blue-600 h-1 rounded-lg"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="mb-4">
          <label className="text-gray-600 mr-2">Playback Speed:</label>
          <select
            value={playbackRate}
            onChange={handlePlaybackRateChange}
            className="px-2 py-1 border border-gray-300 rounded-lg"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
