import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { error: "Symbol parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
      { next: { revalidate: 30 } } // Cache for 30 seconds
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Binance API error for symbol ${symbol}:`, errorData);

      return NextResponse.json(
        {
          error: `Binance API error: ${errorData.msg || "Unknown error"}`,
          symbol,
          code: errorData.code,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching from Binance for symbol ${symbol}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch data from Binance", symbol },
      { status: 500 }
    );
  }
}
