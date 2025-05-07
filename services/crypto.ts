interface CryptoPrice {
  symbol: string;
  price: string;
}

interface CryptoDailyStats {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
}

const CRYPTO_DETAILS = {
  bitcoin: {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    binanceSymbol: "BTCUSDT",
    marketCap: 950000000000,
  },
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    binanceSymbol: "ETHUSDT",
    marketCap: 350000000000,
  },
};

export async function fetchCryptoData(id: string): Promise<CryptoData | null> {
  const cryptoDetails = CRYPTO_DETAILS[id as keyof typeof CRYPTO_DETAILS];

  if (!cryptoDetails) {
    return null;
  }

  try {
    const ticker24hResponse = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${cryptoDetails.binanceSymbol}`
    );

    if (!ticker24hResponse.ok) {
      throw new Error("Failed to fetch 24h ticker data");
    }

    const ticker24h: CryptoDailyStats = await ticker24hResponse.json();

    return {
      id: cryptoDetails.id,
      name: cryptoDetails.name,
      symbol: cryptoDetails.symbol,
      price: parseFloat(ticker24h.lastPrice),
      change24h: parseFloat(ticker24h.priceChangePercent),
      high24h: parseFloat(ticker24h.highPrice),
      low24h: parseFloat(ticker24h.lowPrice),
      volume24h: parseFloat(ticker24h.volume),
      marketCap: cryptoDetails.marketCap, // Using hardcoded value as Binance API doesn't directly provide market cap
    };
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    return null;
  }
}

export async function fetchAllCryptoData(): Promise<CryptoData[]> {
  try {
    const symbols = Object.values(CRYPTO_DETAILS).map(
      (crypto) => crypto.binanceSymbol
    );

    const ticker24hResponse = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr`
    );

    if (!ticker24hResponse.ok) {
      throw new Error("Failed to fetch 24h ticker data");
    }

    const allTickers: CryptoDailyStats[] = await ticker24hResponse.json();

    return Object.values(CRYPTO_DETAILS).map((crypto) => {
      const ticker = allTickers.find((t) => t.symbol === crypto.binanceSymbol);

      if (!ticker) {
        return {
          id: crypto.id,
          name: crypto.name,
          symbol: crypto.symbol,
          price: 0,
          change24h: 0,
          high24h: 0,
          low24h: 0,
          volume24h: 0,
          marketCap: crypto.marketCap,
        };
      }

      return {
        id: crypto.id,
        name: crypto.name,
        symbol: crypto.symbol,
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent),
        high24h: parseFloat(ticker.highPrice),
        low24h: parseFloat(ticker.lowPrice),
        volume24h: parseFloat(ticker.volume),
        marketCap: crypto.marketCap,
      };
    });
  } catch (error) {
    console.error("Error fetching all crypto data:", error);
    // Return fallback data
    return Object.values(CRYPTO_DETAILS).map((crypto) => ({
      id: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol,
      price: 0,
      change24h: 0,
      high24h: 0,
      low24h: 0,
      volume24h: 0,
      marketCap: crypto.marketCap,
    }));
  }
}
