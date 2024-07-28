import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Like from './Like';

const socket = io('https://smp-backend.onrender.com');

const MusicPlayer = () => {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audioPlayer = audioRef.current;
    if (!audioPlayer) return;

    const handleSync = (data) => {
      if (audioPlayer) {
        if (data.action === 'play') {
          console.log('Playing audio at', data.currentTime);
          audioPlayer.currentTime = data.currentTime;
          audioPlayer.play().catch(error => console.error('Error playing audio:', error));
          setIsPlaying(true);
        } else if (data.action === 'pause') {
          console.log('Pausing audio at', data.currentTime);
          audioPlayer.pause();
          setIsPlaying(false);
        }
      }
    };

    socket.on('sync', handleSync);

    const updateProgress = () => {
      if (audioPlayer && !isDragging) {
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

    return () => {
      socket.off('sync', handleSync);
      if (audioPlayer) {
        audioPlayer.removeEventListener('timeupdate', updateProgress);
        audioPlayer.removeEventListener('error', handleAudioError);
      }
    };
  }, [isDragging]);

  const handlePlay = () => {
    const audioPlayer = audioRef.current;
    if (audioPlayer && !isPlaying) {
      console.log('Play button clicked');
      audioPlayer.play().catch(error => console.error('Error playing audio:', error));
      socket.emit('sync', { action: 'play', currentTime: audioPlayer.currentTime });
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    const audioPlayer = audioRef.current;
    if (audioPlayer && isPlaying) {
      console.log('Pause button clicked');
      audioPlayer.pause();
      socket.emit('sync', { action: 'pause', currentTime: audioPlayer.currentTime });
      setIsPlaying(false);
    }
  };

  const handleSeeked = () => {
    const audioPlayer = audioRef.current;
    if (audioPlayer) {
      socket.emit('sync', { action: 'seek', currentTime: audioPlayer.currentTime });
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleProgressMouseDown = (event) => {
    setIsDragging(true);
    handleProgressDrag(event);
  };

  const handleProgressMouseMove = (event) => {
    if (isDragging) {
      handleProgressDrag(event);
    }
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
    handleSeeked();
  };

  const handleProgressTouchStart = (event) => {
    setIsDragging(true);
    handleProgressDrag(event.touches[0]);
  };

  const handleProgressTouchMove = (event) => {
    if (isDragging) {
      handleProgressDrag(event.touches[0]);
    }
  };

  const handleProgressTouchEnd = () => {
    setIsDragging(false);
    handleSeeked();
  };

  const handleProgressDrag = (event) => {
    const audioPlayer = audioRef.current;
    const progressBar = progressRef.current;
    if (!audioPlayer || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const newProgress = (offsetX / rect.width) * 100;
    const newTime = (newProgress / 100) * audioPlayer.duration;

    audioPlayer.currentTime = newTime;
    setProgress(newProgress);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-4">
      <div>
        <h1 className="text-4xl font-bold text-center ">
          Listen with Buddy
        </h1>
      </div>
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
          <source src="/khabar-nhii.mp3" type="audio/mp3" />
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
        <div className='flex justify-center mt-[-20px] mb-3 items-center'>
          <div className=''>
            <Like/>
          </div>
        </div>
        <div
          className="w-full mb-4 bg-gray-300 h-1 rounded-lg relative cursor-pointer"
          ref={progressRef}
          onMouseDown={handleProgressMouseDown}
          onMouseMove={handleProgressMouseMove}
          onMouseUp={handleProgressMouseUp}
          onTouchStart={handleProgressTouchStart}
          onTouchMove={handleProgressTouchMove}
          onTouchEnd={handleProgressTouchEnd}
        >
          <div
            className="bg-blue-600 h-1 rounded-lg"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
