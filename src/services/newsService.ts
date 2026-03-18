export async function fetchNews(): Promise<string[]> {
  try {
    const key = process.env.CRYPTOPANIC_KEY;

    if (!key) {
      console.log("No news API key — using fallback");
      return [
        "Bitcoin shows strong bullish momentum",
        "Crypto market stabilizing after volatility"
      ];
    }

    const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${key}&public=true`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`News API error: ${res.status}`);
    }

    const data = await res.json();

    return data.results.slice(0, 10).map((n: any) => n.title);

  } catch (err) {
    console.error("News fallback triggered:", err);

    return [
      "Market uncertainty remains high",
      "Mixed signals across crypto markets"
    ];
  }
}
