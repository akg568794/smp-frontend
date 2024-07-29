import React from 'react';
import "../index.css"
import img2 from "../assets/img2.jpeg";

const MusicDialog = ({ musicList, handleMusicSelect, setIsDialogOpen }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-purple-800 text-white w-11/12 sm:w-3/4 lg:w-1/2 max-w-2xl p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg transform transition-transform animate-scale-in">
        <div className="flex items-center mb-4">
          <img
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
            src={img2}
            alt="The Best of Beat"
          />
          <div className="ml-4 text-left">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">The Best of Beat on PodRocket</h2>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg">Emily Kochanek</p>
            <button className="mt-2 bg-white text-purple-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm lg:text-base font-semibold">
              Save to Favouite
            </button>
          </div>
        </div>
        <div className="scroll-container">
          <ul className="custom-scrollbar mb-4 space-y-2 overflow-y-auto max-h-60">
            {musicList && musicList.map((music, index) => (
              <li 
                key={index} 
                className="flex items-center justify-between py-2 cursor-pointer hover:bg-purple-600 rounded-lg transition-colors"
                onClick={() => handleMusicSelect(music)}
              >
                <div className="flex items-center">
                  <span className="text-sm sm:text-base lg:text-lg font-semibold">{index + 1}</span>
                  <div className="ml-4">
                    <h4 className="text-sm sm:text-base lg:text-lg">{music.title}</h4>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-400">{music.description}</p>
                  </div>
                </div>
                <span className="text-sm sm:text-base lg:text-lg font-semibold">{music.duration}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-center">
          <button
            onClick={() => setIsDialogOpen(false)}
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-full shadow-lg transform transition-transform hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicDialog;
