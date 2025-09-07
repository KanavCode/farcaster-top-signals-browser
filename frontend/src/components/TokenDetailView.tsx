import React from 'react';
import { TokenDetail } from '../services/signalsAPI';

interface TokenDetailViewProps {
  token: TokenDetail;
  onBack: () => void;
  isInWatchlist: boolean;
  onWatchlistToggle: (symbol: string) => void;
  onTrackView: (symbol: string) => void;
}

export const TokenDetailView: React.FC<TokenDetailViewProps> = ({
  token,
  onBack,
  isInWatchlist,
  onWatchlistToggle,
  onTrackView
}) => {
  React.useEffect(() => {
    onTrackView(token.symbol);
  }, [token.symbol]); // Removed onTrackView from dependencies to prevent infinite loop

  const isNumber = (v: unknown): v is number => typeof v === 'number' && !Number.isNaN(v);

  const formatNumber = (num?: number): string => {
    if (!isNumber(num)) return '-';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(2);
  };

  const formatPrice = (price?: number): string => {
    if (!isNumber(price)) return '-';
    if (price < 0.01) return price.toFixed(8);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const getSignalColor = (value?: number): string => {
    if (!isNumber(value)) return 'text-gray-400';
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getSignalBgColor = (value?: number): string => {
    if (!isNumber(value)) return 'bg-gray-500/20';
    if (value > 0) return 'bg-green-500/20';
    if (value < 0) return 'bg-red-500/20';
    return 'bg-gray-500/20';
  };

  const getSignalStrength = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue > 5) return 'Very Strong';
    if (absValue > 3) return 'Strong';
    if (absValue > 1) return 'Moderate';
    return 'Weak';
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 L15 0 L45 0 L60 30 L45 60 L15 60 Z' fill='none' stroke='%2300c2ff' stroke-width='1' /%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      {/* Animated Border Lines */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[20vw] h-[1px] bg-gradient-to-r from-transparent via-[#00c2ff] to-transparent" />
        <div className="absolute top-0 right-0 w-[1px] h-[20vh] bg-gradient-to-b from-transparent via-[#00c2ff] to-transparent" />
        <div className="absolute bottom-0 right-0 w-[20vw] h-[1px] bg-gradient-to-l from-transparent via-[#00c2ff] to-transparent" />
        <div className="absolute bottom-0 left-0 w-[1px] h-[20vh] bg-gradient-to-t from-transparent via-[#00c2ff] to-transparent" />
      </div>

      {/* Content container - keep existing content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-6">
        {/* Enhanced Header with Animation */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <button
            onClick={onBack}
            className="group px-4 py-2 rounded-lg bg-[#121218] border border-[#2a2a32] hover:border-[#00c2ff] transition-all duration-300"
          >
            <span className="inline-flex items-center">
              <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
              <span className="ml-2">Back</span>
            </span>
          </button>
          <button
            onClick={() => onWatchlistToggle(token.symbol)}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              isInWatchlist 
                ? 'bg-[#00c2ff]/20 border border-[#00c2ff] text-[#00c2ff] animate-pulse-slow' 
                : 'bg-[#121218] border border-[#2a2a32] hover:border-[#00c2ff]'
            }`}
          >
            <span className="inline-flex items-center">
              <span className={`mr-2 ${isInWatchlist ? 'animate-spin-slow' : ''}`}>
                {isInWatchlist ? '★' : '☆'}
              </span>
              {isInWatchlist ? 'Watching' : 'Watch'}
            </span>
          </button>
        </div>

        {/* Enhanced Token Header with Hover Effects */}
        <div className="group bg-[#121218]/90 backdrop-blur-md rounded-xl p-8 mb-6 border border-[#2a2a32] transition-all duration-300 hover:border-[#00c2ff]/50 animate-fade-in-up">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#22c55e] to-[#8b5cf6] rounded-xl blur-md opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-[#22c55e]/20 to-[#8b5cf6]/20 rounded-xl border border-[#2a2a32] flex items-center justify-center font-bold text-3xl transform group-hover:scale-105 transition-transform duration-300">
                {token.symbol.substring(0, 2)}
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#22c55e] via-[#8b5cf6] to-[#00c2ff] bg-clip-text text-transparent bg-300% animate-gradient-scroll">
                {token.symbol}
              </h1>
              <span className={`text-sm px-4 py-1 rounded-full mt-2 inline-block transition-all duration-300
                ${token.type === 'memecoin' 
                  ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/30' 
                  : 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/50 hover:bg-[#22c55e]/30'
                }`}>
                {token.type}
              </span>
            </div>
          </div>
          <p className="text-[#a0a0a0] text-lg transform group-hover:translate-x-2 transition-transform duration-300">
            {token.description}
          </p>
        </div>

        {/* Enhanced Main Signal with Pulse Effect */}
        <div className="relative group bg-[#121218]/90 backdrop-blur-md rounded-xl p-8 mb-6 border border-[#2a2a32] animate-fade-in-up delay-100">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#22c55e] to-[#00c2ff] rounded-xl opacity-0 group-hover:opacity-70 blur transition-opacity duration-300" />
          <div className="relative bg-[#121218] rounded-xl p-8">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-3 ${getSignalColor(token.hx_mom6)} transform group-hover:scale-105 transition-transform duration-300`}>
                {token.hx_mom6 > 0 ? '+' : ''}{token.hx_mom6.toFixed(2)}%
              </div>
              <div className="text-[#a0a0a0] text-xl">
                6H MOMENTUM · <span className="animate-pulse">{getSignalStrength(token.hx_mom6)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Signal Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Social Volume', value: token.hx_buzz6, desc: 'Social volume change' },
            { label: 'Market Volume', value: token.hx_liq6, desc: 'Market volume change' },
            { label: 'AltRank Change', value: token.hx_rankimp6, desc: 'AltRank change (negated)' },
            { label: 'Sentiment Change', value: token.hx_sent6, desc: 'Sentiment change' }
          ].map(metric => (
            <div 
              key={metric.label}
              className="relative group bg-[#121218]/90 backdrop-blur-md rounded-xl p-6 border border-[#2a2a32] transition-all duration-300 hover:border-[#00c2ff]/30"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00c2ff]/20 to-[#8b5cf6]/20 rounded-xl opacity-0 group-hover:opacity-50 blur-sm transition-opacity duration-300" />
              <div className="relative">
                <h3 className="text-[#a0a0a0] text-sm mb-2">{metric.label}</h3>
                <div className={`text-2xl font-bold mb-1 ${getSignalColor(metric.value)}`}>
                  {isNumber(metric.value) ? `${metric.value > 0 ? '+' : ''}${metric.value.toFixed(1)}%` : '-'}
                </div>
                <div className="text-xs text-[#a0a0a0]">{metric.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Metrics */}
        <div className="bg-[#121218]/90 backdrop-blur-md rounded-xl p-8 mb-6 border border-[#2a2a32]">
          <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-[#22c55e] to-[#8b5cf6] bg-clip-text text-transparent">
            Social Metrics
          </h2>
          <div className="space-y-4">
            <div>
              <div className="text-[#a0a0a0]">Active Contributors</div>
              <div className="text-2xl font-bold">
                {isNumber(token.contributors_active) 
                  ? `${token.contributors_active > 0 ? '+' : ''}${token.contributors_active.toFixed(1)}%` 
                  : '-'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        {token.social_links && (
          <div className="bg-[#121218]/90 backdrop-blur-md rounded-xl p-8 border border-[#2a2a32]">
            <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-[#22c55e] to-[#8b5cf6] bg-clip-text text-transparent">
              Social Links
            </h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(token.social_links).map(([platform, url]) => (
                url && (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#121218] border border-[#2a2a32] hover:border-[#00c2ff] rounded-lg text-white transition-all duration-300"
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </a>
                )
              ))}
              {token.website && (
                <a
                  href={token.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#121218] border border-[#2a2a32] hover:border-[#00c2ff] rounded-lg text-white transition-all duration-300"
                >
                  Website
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
