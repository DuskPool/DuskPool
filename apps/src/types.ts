import React from 'react';

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
}

export interface Asset {
  symbol: string;
  name: string;
  balance: number;
  locked: number;
  price: number;
  type: 'security' | 'commodity' | 'currency';
  address: string;
}

export interface Order {
  id: string;
  asset: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  filled: number;
  status: 'open' | 'partial' | 'filled' | 'cancelled';
  timestamp: string;
  hash: string; // Commitment hash
}

export interface Settlement {
  id: string;
  asset: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: string;
  txHash: string;
}
