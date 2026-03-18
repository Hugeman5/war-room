'use client';

import { useEffect } from 'react';
import { useMarketDataStore } from '@/store/marketDataStore';

const FETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function NewsInitializer() {
  const { setNews } = useMarketDataStore();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        console.log('[NewsInitializer] Fetching market news from API route...');
        const response = await fetch('/api/news');
        if (!response.ok) {
            throw new Error(`Failed to fetch news from API: ${response.statusText}`);
        }
        const newsItems = await response.json();
        setNews(newsItems);
        console.log(`[NewsInitializer] Loaded ${newsItems.length} news items.`);
      } catch (error) {
        console.error('[NewsInitializer] Failed to fetch news:', error);
      }
    };

    // Fetch immediately on mount
    fetchNews();

    // Then fetch on an interval
    const intervalId = setInterval(fetchNews, FETCH_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [setNews]);

  return null; // This component does not render anything
}
