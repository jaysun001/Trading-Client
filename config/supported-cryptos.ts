export interface CryptoInfo {
  id: string;
  name: string;
  symbol: string;
  binanceSymbol: string;
  icon: string;
  marketCap: number;
  color?: string;
}

// List of all supported cryptocurrencies
// To add a new cryptocurrency, simply add a new entry to this array
export const supportedCryptos: CryptoInfo[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    binanceSymbol: "BTCUSDT",
    icon: "₿",
    marketCap: 950000000000,
    color: "#F7931A",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    binanceSymbol: "ETHUSDT",
    icon: "Ξ",
    marketCap: 350000000000,
    color: "#627EEA",
  },
  {
    id: "bnb",
    name: "BNB",
    symbol: "BNB",
    binanceSymbol: "BNBUSDT",
    icon: "BNB",
    marketCap: 45000000000,
    color: "#F3BA2F",
  },
  {
    id: "xrp",
    name: "XRP",
    symbol: "XRP",
    binanceSymbol: "XRPUSDT",
    icon: "XRP",
    marketCap: 30000000000,
    color: "#23292F",
  },
  {
    id: "tron",
    name: "Tron",
    symbol: "TRX",
    binanceSymbol: "TRXUSDT",
    icon: "TRX",
    marketCap: 10000000000,
    color: "#EF0027",
  },
  {
    id: "dogecoin",
    name: "Dogecoin",
    symbol: "DOGE",
    binanceSymbol: "DOGEUSDT",
    icon: "Ð",
    marketCap: 13000000000,
    color: "#C2A633",
  },
  // Trump token is not available on Binance with symbol DJTUSDT
  // Commenting out to prevent API errors
  /*
  {
    id: "trump",
    name: "Trump",
    symbol: "DJT",
    binanceSymbol: "DJTUSDT",
    icon: "DJT",
    marketCap: 3000000000,
    color: "#E50000",
  },
  */
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    binanceSymbol: "SOLUSDT",
    icon: "◎",
    marketCap: 42000000000,
    color: "#14F195",
  },
];

// Helper function to get crypto info by ID
export const getCryptoById = (id: string): CryptoInfo | undefined => {
  return supportedCryptos.find((crypto) => crypto.id === id);
};

// Create a map for quick lookup
export const cryptoInfoMap: Record<string, CryptoInfo> =
  supportedCryptos.reduce((acc, crypto) => {
    acc[crypto.id] = crypto;
    return acc;
  }, {} as Record<string, CryptoInfo>);
