import React from 'react';

interface HeaderProps {
  isConnected: boolean;
  onConnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, onConnect }) => {
  return (
    <header className="relative z-10 w-full">
      {/* Gradient Border Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00c2ff] to-transparent"></div>

      {/* Header Content */}
      <div className="px-6 py-4 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Title Section */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00c2ff] to-[#8b5cf6] rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-black rounded-lg p-2">
                <img src="/arbitrum.png" alt="Logo" className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00c2ff] to-[#8b5cf6] bg-clip-text text-transparent">
                Top Signals Browser
              </h1>
              <p className="text-sm text-gray-400">Real-time crypto momentum tracker</p>
            </div>
          </div>

          {/* Connect Wallet Button */}
          <button
            onClick={onConnect}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00c2ff] to-[#8b5cf6] rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative px-6 py-2 bg-black rounded-lg border border-[#00c2ff]/20 text-[#00c2ff] font-medium hover:bg-black/50 transition duration-300">
              {isConnected ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Connected</span>
                </div>
              ) : (
                'Connect Wallet'
              )}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};