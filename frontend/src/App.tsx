// App.tsx
// Main React component for the Top Signals Browser (SocialFi/Analytics) Mini-App.
// This file implements the signals browser with token analysis, watchlist, and Researcher NFT functionality.

import React, { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { ethers } from "ethers";
import TopSignalsBrowserAbi from "./abi/TopSignalsBrowser.json";
import { PlexusBackground } from "./components/PlexusBackground";
import { Header } from './components/Header';
import { signalsAPI, TokenSignal, TokenDetail } from "./services/signalsAPI";
import { TokenSignalCard } from "./components/TokenSignalCard";
import { TokenDetailView } from "./components/TokenDetailView";
import { ResearcherNFT } from "./components/ResearcherNFT";

const CONTRACT_ADDRESS = "0xfb8e062817cdbed024c00ec2e351060a1f6c4ae2";

export default function App() {
  // Connection states
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Transaction states
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isMinted, setIsMinted] = useState(false);

  // App states
  const [currentView, setCurrentView] = useState<'list' | 'watchlist' | 'detail'>('list');
  const [signalsDirection, setSignalsDirection] = useState<'gainers' | 'losers'>('gainers');
  const [tokens, setTokens] = useState<TokenSignal[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // Contract states
  const [counterValue, setCounterValue] = useState(0);
  const [nextMilestone, setNextMilestone] = useState(10);
  const [isAtMilestone, setIsAtMilestone] = useState(false);
  const [hasNFT, setHasNFT] = useState(false);

  // Provider setup
  const RPC_URL = (import.meta as any).env.VITE_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc';
  const publicProvider = new ethers.JsonRpcProvider(RPC_URL);
  const publicContract = new ethers.Contract(CONTRACT_ADDRESS, TopSignalsBrowserAbi, publicProvider);

  // Initialize SDK
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  // Fetch contract data
  const fetchContractData = async () => {
    try {
      const counter = await publicContract.getCounter();
      setCounterValue(Number(counter));

      const next = await publicContract.getNextCounterMilestone();
      setNextMilestone(Number(next));

      const isAt = await publicContract.isCounterMultipleOfTen();
      setIsAtMilestone(isAt);

      if (address) {
        const balance = await publicContract.balanceOf(address);
        setHasNFT(balance > 0n);
      }
    } catch (err) {
      console.error('Error fetching contract data:', err);
    }
  };

  useEffect(() => {
    fetchContractData();
    const interval = setInterval(fetchContractData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [address]);

  // Load tokens based on current view
  useEffect(() => {
    const loadTokens = async () => {
      setLoading(true);
      try {
        let tokensData: TokenSignal[] = [];
        
        if (currentView === 'watchlist') {
          tokensData = await signalsAPI.getWatchlistTokens();
        } else {
          tokensData = await signalsAPI.getTopSignals(signalsDirection);
        }
        
        setTokens(tokensData);
      } catch (error) {
        console.error('Error loading tokens:', error);
        setTokens([]);
      }
      setLoading(false);
    };

    loadTokens();
  }, [currentView, signalsDirection]);

  // Connect wallet
  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      setError(new Error('No wallet detected'));
      return;
    }

    setIsConnecting(true);
    setError(null);
    try {
      const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
      await browserProvider.send("eth_requestAccounts", []);
      const sign = await browserProvider.getSigner();
      const addr = await sign.getAddress();
      setSigner(sign);
      setAddress(addr);
      setIsConnected(true);
      fetchContractData(); // Refresh data on connect
    } catch (err) {
      setError(err as Error);
      console.error('Connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle token click: fetch details and increment counter on-chain via connected wallet
  const handleTokenClick = async (symbol: string) => {
    console.log('Token clicked:', symbol);
    setLoading(true);
    try {
      const tokenDetail = await signalsAPI.getTokenDetail(symbol);
      console.log('Token detail result:', tokenDetail);
      if (tokenDetail) {
        setSelectedToken(tokenDetail);
        setCurrentView('detail');
      } else {
        console.warn('No token detail found for:', symbol);
      }

      // Increment global counter on contract using the connected wallet
      if (isConnected && signer) {
        setIsPending(true);
        try {
          const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, TopSignalsBrowserAbi, signer);
          const tx = await contractWithSigner.incrementCounter();
          setTxHash(tx.hash);
          setIsConfirming(true);
          const receipt = await tx.wait();
          setIsConfirming(false);
          if (receipt.status === 1) {
            fetchContractData();
          }
        } catch (error) {
          console.error('Error incrementing counter on contract:', error);
          setError(error as Error);
        } finally {
          setIsPending(false);
        }
      }
    } catch (error) {
      console.error('Error loading token detail:', error);
    }
    setLoading(false);
  };

  // Handle watchlist toggle
  const handleWatchlistToggle = (symbol: string) => {
    if (signalsAPI.isInWatchlist(symbol)) {
      signalsAPI.removeFromWatchlist(symbol);
    } else {
      signalsAPI.addToWatchlist(symbol);
    }
    // Refresh tokens if on watchlist view
    if (currentView === 'watchlist') {
      signalsAPI.getWatchlistTokens().then(setTokens);
    }
  };

  // Track token interaction (frontend analytics only; no on-chain write here)
  const handleTrackView = async (symbol: string) => {
    await signalsAPI.trackTokenView(symbol);
  };

  // Mint NFT at milestone
  const handleMintNFT = async () => {
    if (!isConnected || !signer) return;

    setIsPending(true);
    setIsMinted(false);
    try {
      const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, TopSignalsBrowserAbi, signer);
      const tx = await contractWithSigner.mintNftAtMilestone({ value: 0n });
      setTxHash(tx.hash);
      setIsConfirming(true);
      const receipt = await tx.wait();
      setIsConfirming(false);
      if (receipt.status === 1) {
        setIsMinted(true);
        fetchContractData();
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      setError(error as Error);
    } finally {
      setIsPending(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    setCurrentView('list');
    setSelectedToken(null);
  };

  // Share to Farcaster
  const handleShare = () => {
    const message = selectedToken
      ? `I just analyzed ${selectedToken.symbol} on Top Signals Browser! 📊 Signal: ${selectedToken.hx_mom6 > 0 ? '+' : ''}${selectedToken.hx_mom6.toFixed(2)}%`
      : `I'm exploring top crypto signals on Top Signals Browser! ⚡ Global counter: ${counterValue}`;

    sdk.actions.composeCast({
      text: message,
    });
  };

  // Render token detail view
  if (currentView === 'detail' && selectedToken) {
    return (
      <TokenDetailView
        token={selectedToken}
        onBack={handleBack}
        isInWatchlist={signalsAPI.isInWatchlist(selectedToken.symbol)}
        onWatchlistToggle={handleWatchlistToggle}
        onTrackView={handleTrackView}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <PlexusBackground />
      <div className="relative z-10">
        <Header isConnected={isConnected} onConnect={connectWallet} />
        
        
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            </div>

                <button
                  onClick={handleShare}
                  style={{ backgroundColor:'#000000', borderColor: '#00c2ff', color: '#00c2ff', borderWidth: '1px', borderRadius: '8px' , padding: '8px 16px' , fontSize: '14px', cursor: 'pointer' , marginRight: '26px' , transition: 'all 0.3s ease' ,}}
                >
                  Share
                </button>
          </div>
      
   
        {/* Added max-w-7xl and wider padding */}
        <div className="max-w-7xl mx-auto px-8 sm:px-12 py-6">
          {/* Navigation */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setCurrentView('list')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                currentView === 'list' 
                ? 'bg-[#00c2ff]/20 text-[#00c2ff] border border-[#00c2ff]/50' 
                : 'text-gray-400 hover:bg-[#00c2ff]/10 hover:text-[#00c2ff]'
              }`}
            >
              Signals
            </button>
            <button
              onClick={() => setCurrentView('watchlist')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                currentView === 'watchlist'
                ? 'bg-[#00c2ff]/20 text-[#00c2ff] border border-[#00c2ff]/50'
                : 'text-gray-400 hover:bg-[#00c2ff]/10 hover:text-[#00c2ff]'
              }`}
            >
              Watchlist
            </button>
          </div>

          {/* Gainers/Losers Toggle */}
          {currentView === 'list' && (
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setSignalsDirection('gainers')}
                className={`px-3 py-1 text-sm rounded-lg transition-all duration-300 ${
                  signalsDirection === 'gainers'
                  ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/50'
                  : 'text-gray-400 hover:bg-[#22c55e]/10 hover:text-[#22c55e]'
                }`}
              >
                ↑ Top Gainers
              </button>
              <button
                onClick={() => setSignalsDirection('losers')}
                className={`px-3 py-1 text-sm rounded-lg transition-all duration-300 ${
                  signalsDirection === 'losers'
                  ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/50'
                  : 'text-gray-400 hover:bg-[#ef4444]/10 hover:text-[#ef4444]'
                }`}
              >
                ↓ Top Losers
              </button>
            </div>
          )}

          <span style={{ color: '#00c2ff', fontSize: '20px', alignItems: 'center', marginBottom: '16px', display: 'block',justifyContent: 'center', textAlign: 'center', fontWeight: '600' }}>
                  Counter: {counterValue} • Next: {nextMilestone}
          </span>

          {/* Milestone NFT Section */}
        {isConnected && (
          <div className="mb-6">
            <ResearcherNFT
              counterValue={counterValue}
              nextMilestone={nextMilestone}
              isAtMilestone={isAtMilestone}
              hasNFT={hasNFT}
              onMintNFT={handleMintNFT}
              isLoading={isPending || isConfirming}
            />
          </div>
        )}

          {/* Token Grid - adjusted gap */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.map(token => (
              <TokenSignalCard
                key={token.symbol}
                token={token}
                onTokenClick={handleTokenClick}
                isInWatchlist={signalsAPI.isInWatchlist(token.symbol)}
                onWatchlistToggle={handleWatchlistToggle}
              />
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-pulse text-[#00c2ff]">Loading signals...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

