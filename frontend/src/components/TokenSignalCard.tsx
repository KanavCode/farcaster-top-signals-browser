import React from 'react';
import { TokenSignal } from '../services/signalsAPI';

interface TokenSignalCardProps {
  token: TokenSignal;
  onTokenClick: (symbol: string) => void;
  isInWatchlist: boolean;
  onWatchlistToggle: (symbol: string) => void;
}

export const TokenSignalCard: React.FC<TokenSignalCardProps> = ({
  token,
  onTokenClick,
  isInWatchlist,
  onWatchlistToggle
}) => {
  const isNumber = (v: unknown): v is number => typeof v === 'number' && !Number.isNaN(v);

  const formatSubSignal = (num?: number): string => {
    if (!isNumber(num)) return '-';
    if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(1);
  };
  
  const getSignalColor = (value?: number): string => {
    if (!isNumber(value)) return 'text-[#6b7280]';
    if (value > 0) return 'text-[#22c55e]';
    if (value < 0) return 'text-[#ef4444]';
    return 'text-[#6b7280]';
  };

  const getMomentumStyle = (value?: number): string => {
    if (!isNumber(value)) return 'text-[#6b7280]';
    if (Math.abs(value) > 10) {
      return value > 0 ? 'text-[#22c55e] animate-pulse' : 'text-[#ef4444] animate-pulse';
    }
    return getSignalColor(value);
  };

  return (
    <div className="group relative" onClick={() => onTokenClick(token.symbol)}>
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#22c55e] to-[#8b5cf6] opacity-0 group-hover:opacity-100 rounded-xl blur transition-all duration-300"></div>

      {/* Card Content */}
      <div className="relative bg-[#121218]/80 backdrop-blur-md rounded-xl p-6 border border-[#2a2a32] transition-all duration-300 hover:transform hover:-translate-y-2">
        {/* Token Info */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#22c55e]/10 to-[#8b5cf6]/10 flex items-center justify-center border border-[#2a2a32] font-bold text-white">
              {token.symbol.substring(0, 2)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{token.symbol}</h3>
              <span className="text-sm text-[#a0a0a0]">{token.type || 'Token'}</span>
            </div>
          </div>
          
          {/* Watchlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWatchlistToggle(token.symbol);
            }}
            className={`text-2xl transition-all ${
              isInWatchlist 
                ? 'text-[#eab308] animate-pulse' 
                : 'text-[#6b7280] hover:text-[#eab308]'
            }`}
          >
            {isInWatchlist ? '★' : '☆'}
          </button>
        </div>

        {/* Momentum Signal */}
        <div className="text-center my-6">
          <div className={`text-4xl font-bold mb-2 ${getMomentumStyle(token.hx_mom6)}`}>
            {isNumber(token.hx_mom6) && token.hx_mom6 > 0 ? '+' : ''}
            {isNumber(token.hx_mom6) ? token.hx_mom6.toFixed(2) : '--'}%
          </div>
          <div className="text-[#a0a0a0] text-sm">6H MOMENTUM</div>
        </div>

        {/* Sub-signals */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            {
              label: 'BUZZ',
              value: token.hx_buzz6
            },
            {
            label: 'LIQUIDITY',
            value: token.hx_liq6
          },
          {
            label: 'RANK',
            value: token.hx_rankimp6
          }
        ].map(metric => (
            <div key={metric.label} className="text-center p-3 rounded-lg bg-[#0a0a0f]/50 border border-[#2a2a32]/50">
              <div className={`text-lg font-bold ${getSignalColor(metric.value)}`}>
                {isNumber(metric.value) ? 
                  `${metric.value > 0 ? '+' : ''}${formatSubSignal(metric.value)}` : 
                  '--'
                }
              </div>
              <div className="text-[#a0a0a0] text-xs mt-1">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-[#2a2a32]/50 flex justify-between items-center text-xs text-[#a0a0a0]">
          <span>Contributors: {token.contributors_active?.toLocaleString() || '--'}</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse"></div>
            <span>LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

