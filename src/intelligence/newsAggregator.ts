import Parser from 'rss-parser';

export type NewsItem = {
  title: string;
  source: string;
  link: string;
  isoDate: string;
  summary: string;
};

const NEWS_SOURCES = [
  'https://www.coindesk.com/arc/outboundfeeds/rss/',
  'https://cointelegraph.com/rss',
  'https://decrypt.co/feed',
  'https://cryptoslate.com/feed',
];

const parser = new Parser();

export async function getAggregatedNews(): Promise<NewsItem[]> {
  const allNews: NewsItem[] = [];
  const seenUrls = new Set<string>();

  const feedPromises = NEWS_SOURCES.map(async (url) => {
    try {
      const feed = await parser.parseURL(url);
      
      feed.items.forEach((item) => {
        if (item.link && !seenUrls.has(item.link)) {
          allNews.push({
            title: item.title || 'No title',
            source: feed.title || new URL(url).hostname.replace('www.', ''),
            link: item.link,
            isoDate: item.isoDate || new Date().toISOString(),
            summary: item.contentSnippet || item.summary || 'No summary',
          });
          seenUrls.add(item.link);
        }
      });
    } catch (error) {
      console.error(`Failed to fetch or parse RSS feed from ${url}:`, error);
    }
  });

  await Promise.all(feedPromises);

  // Sort by date (newest first) and limit
  allNews.sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime());

  return allNews.slice(0, 50);
}
