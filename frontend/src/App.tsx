// App.tsx
// Main React component for the Top Signals Browser (SocialFi/Analytics) Mini-App.
// This file implements the signals browser with token analysis, watchlist, and Researcher NFT functionality.

import React, { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { ethers } from "ethers";
import TopSignalsBrowserAbi from "./abi/TopSignalsBrowser.json";

// Address of the deployed Top Signals Browser contract
// Update this after deploying your own contract
const CONTRACT_ADDRESS = "0xfb8e062817cdbed024c00ec2e351060a1f6c4ae2"; // TODO: Update with deployed address

import { signalsAPI, TokenSignal, TokenDetail } from "./services/signalsAPI";
import { TokenSignalCard } from "./components/TokenSignalCard";
import { TokenDetailView } from "./components/TokenDetailView";
import { ResearcherNFT } from "./components/ResearcherNFT";

type View = 'list' | 'detail' | 'watchlist';

export default function App() {
  // Ethers setup
  const RPC_URL = (import.meta as any).env.VITE_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc';
  const publicProvider = new ethers.JsonRpcProvider(RPC_URL);
  const publicContract = new ethers.Contract(CONTRACT_ADDRESS, TopSignalsBrowserAbi, publicProvider);

  // App state for connection and contract interactions
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isMinted, setIsMinted] = useState(false);

  // App state
  const [currentView, setCurrentView] = useState<View>('list');
  const [signalsDirection, setSignalsDirection] = useState<'gainers' | 'losers'>('gainers');
  const [tokens, setTokens] = useState<TokenSignal[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [counterValue, setCounterValue] = useState(0);
  const [nextMilestone, setNextMilestone] = useState(10);
  const [isAtMilestone, setIsAtMilestone] = useState(false);
  const [hasNFT, setHasNFT] = useState(false);

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
    <div className="min-h-screen bg-dark-background text-dark-primary bg-aurora">
      {/* Futuristic Header */}
      <header className="w-full py-6 px-4 bg-dark-background/80 backdrop-blur-md border-b border-dark-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/arbitrum.png" alt="Logo" className="h-10 w-10" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-green bg-clip-text text-transparent">
              Top Signals Browser
            </h1>
          </div>
          <button 
            onClick={connectWallet}
            className="px-4 py-2 rounded-lg bg-dark-surface border border-dark-border hover:border-accent-cyan transition-all duration-300 hover:bg-dark-surface/80 hover:shadow-[0_0_20px_rgba(0,194,255,0.3)]"
          >
            {isConnected ? 'Connected' : 'Connect Wallet'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Navigation Tabs */}
        <nav className="flex space-x-4 mb-8">
          {['list', 'watchlist', 'detail'].map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view as View)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                currentView === view 
                  ? 'bg-dark-surface border-accent-cyan text-accent-cyan border'
                  : 'text-dark-secondary hover:bg-dark-surface/50'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </nav>

        {/* Token Grid */}
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
      </main>
    </div>
  );
}

