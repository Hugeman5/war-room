
/**
 * Fetches the current live price for Bitcoin from the CoinGecko API.
 */
export async function fetchBitcoinLivePrice(): Promise<number | null> {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&x_cg_demo_api_key=CG-873Lfpb9UftsyUbB1PdsEkPU';

  try {
    // Revalidate frequently as it's a live price, but client polling is the main driver.
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.bitcoin && typeof data.bitcoin.usd === 'number') {
      return data.bitcoin.usd;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}
