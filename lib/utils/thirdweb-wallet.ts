"use client";

import { Wallet } from "thirdweb/wallets";
import { Account } from "thirdweb";

// Store references to active wallet and account
// These will be updated by the wallet context
let activeWallet: Wallet | null = null;
let activeAccount: Account | null = null;

/**
 * Set the active wallet and account
 * This should be called from the wallet context when a wallet connects
 */
export function setActiveWallet(wallet: Wallet | null, account: Account | null) {
  activeWallet = wallet;
  activeAccount = account;

  // Also store in window for backup access
  if (typeof window !== "undefined") {
    (window as any).__THIRDWEB_ACTIVE_WALLET__ = wallet;
    (window as any).__THIRDWEB_ACTIVE_ACCOUNT__ = account;
  }
}

/**
 * Get the currently active wallet
 */
export function getActiveWallet(): Wallet | null {
  // First try our stored reference
  if (activeWallet) {
    return activeWallet;
  }

  // Fallback to window object
  if (typeof window !== "undefined" && (window as any).__THIRDWEB_ACTIVE_WALLET__) {
    return (window as any).__THIRDWEB_ACTIVE_WALLET__;
  }

  return null;
}

/**
 * Get the currently active account
 */
export function getActiveAccount(): Account | null {
  // First try our stored reference
  if (activeAccount) {
    return activeAccount;
  }

  // Fallback to window object
  if (typeof window !== "undefined" && (window as any).__THIRDWEB_ACTIVE_ACCOUNT__) {
    return (window as any).__THIRDWEB_ACTIVE_ACCOUNT__;
  }

  return null;
}

/**
 * Get the address of the active account
 */
export function getActiveAddress(): string | null {
  const account = getActiveAccount();
  return account?.address || null;
}

/**
 * Check if a wallet is currently connected
 */
export function isWalletConnected(): boolean {
  return !!getActiveAccount();
}

/**
 * Clear the active wallet and account
 * This should be called when the wallet disconnects
 */
export function clearActiveWallet() {
  activeWallet = null;
  activeAccount = null;

  if (typeof window !== "undefined") {
    delete (window as any).__THIRDWEB_ACTIVE_WALLET__;
    delete (window as any).__THIRDWEB_ACTIVE_ACCOUNT__;
  }
}

/**
 * Get wallet connection status
 */
export function getWalletStatus() {
  const wallet = getActiveWallet();
  const account = getActiveAccount();
  const address = getActiveAddress();

  return {
    isConnected: !!account,
    hasWallet: !!wallet,
    address,
    wallet,
    account,
  };
}
