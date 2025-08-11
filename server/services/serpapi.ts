import GoogleSearchResults from 'google-search-results-nodejs';
const getJson = GoogleSearchResults.getJson;

const SERPAPI_KEY = process.env.SERPAPI_KEY;

export interface SerpApiSearchResult {
  title: string;
  link: string;
  snippet: string;
  position?: number;
  displayedLink?: string;
}

export interface SerpApiResponse {
  searchParameters: {
    query: string;
    type: string;
    location?: string;
  };
  organicResults: SerpApiSearchResult[];
  relatedSearches?: string[];
  summary: string;
}

export class SerpApiService {
  private apiKey: string;

  constructor() {
    if (!SERPAPI_KEY) {
      throw new Error('SerpAPI key is required');
    }
    this.apiKey = SERPAPI_KEY;
  }

  async search(query: string, options: {
    location?: string;
    num?: number;
    device?: 'desktop' | 'mobile';
  } = {}): Promise<SerpApiResponse> {
    try {
      const searchParams = {
        q: query,
        api_key: this.apiKey,
        engine: 'google',
        location: options.location || 'United States',
        google_domain: 'google.com',
        gl: 'us',
        hl: 'en',
        num: options.num || 8,
        device: options.device || 'desktop'
      };

      const results = await getJson(searchParams);
      
      const organicResults: SerpApiSearchResult[] = (results.organic_results || [])
        .slice(0, options.num || 8)
        .map((result: any, index: number) => ({
          title: result.title || '',
          link: result.link || '',
          snippet: result.snippet || '',
          position: result.position || index + 1,
          displayedLink: result.displayed_link || result.link
        }));

      const relatedSearches = (results.related_searches || [])
        .slice(0, 5)
        .map((search: any) => search.query || search);

      // Generate a summary from the search results
      const summary = this.generateSearchSummary(query, organicResults);

      return {
        searchParameters: {
          query,
          type: 'web_search',
          location: options.location
        },
        organicResults,
        relatedSearches,
        summary
      };
    } catch (error) {
      console.error('SerpAPI search error:', error);
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async searchNews(query: string, options: {
    location?: string;
    num?: number;
  } = {}): Promise<SerpApiResponse> {
    try {
      const searchParams = {
        q: query,
        api_key: this.apiKey,
        engine: 'google_news',
        location: options.location || 'United States',
        gl: 'us',
        hl: 'en',
        num: options.num || 6
      };

      const results = await getJson(searchParams);
      
      const organicResults: SerpApiSearchResult[] = (results.news_results || [])
        .slice(0, options.num || 6)
        .map((result: any, index: number) => ({
          title: result.title || '',
          link: result.link || '',
          snippet: result.snippet || result.snippet || '',
          position: index + 1,
          displayedLink: result.source || result.link
        }));

      const summary = this.generateSearchSummary(query, organicResults, 'news');

      return {
        searchParameters: {
          query,
          type: 'news_search',
          location: options.location
        },
        organicResults,
        relatedSearches: [],
        summary
      };
    } catch (error) {
      console.error('SerpAPI news search error:', error);
      throw new Error(`News search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async searchImages(query: string, options: {
    num?: number;
  } = {}): Promise<SerpApiResponse> {
    try {
      const searchParams = {
        q: query,
        api_key: this.apiKey,
        engine: 'google_images',
        num: options.num || 6
      };

      const results = await getJson(searchParams);
      
      const organicResults: SerpApiSearchResult[] = (results.images_results || [])
        .slice(0, options.num || 6)
        .map((result: any, index: number) => ({
          title: result.title || '',
          link: result.original || result.link || '',
          snippet: result.source || '',
          position: index + 1,
          displayedLink: result.source || ''
        }));

      const summary = `Found ${organicResults.length} images related to "${query}". These images can help visualize and plan your travel experience.`;

      return {
        searchParameters: {
          query,
          type: 'image_search'
        },
        organicResults,
        relatedSearches: [],
        summary
      };
    } catch (error) {
      console.error('SerpAPI image search error:', error);
      throw new Error(`Image search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateSearchSummary(query: string, results: SerpApiSearchResult[], type: string = 'web'): string {
    if (results.length === 0) {
      return `No ${type} results found for "${query}". Try a different search term or check your spelling.`;
    }

    const resultCount = results.length;
    const typeText = type === 'news' ? 'news articles' : type === 'image' ? 'images' : 'search results';
    
    // Extract key information from snippets
    const topSnippets = results.slice(0, 3).map(r => r.snippet).filter(s => s.length > 0);
    
    let summary = `Found ${resultCount} ${typeText} for "${query}". `;
    
    if (topSnippets.length > 0) {
      // Create a concise summary from top results
      const keyInfo = topSnippets.join(' ').substring(0, 200);
      summary += `Key information: ${keyInfo}${keyInfo.length >= 200 ? '...' : ''}`;
    }

    return summary;
  }

  // Helper method to determine if a query should use travel-specific search
  isTravelQuery(query: string): boolean {
    const travelKeywords = [
      'hotel', 'flight', 'travel', 'vacation', 'trip', 'destination', 'booking',
      'airline', 'airport', 'accommodation', 'resort', 'tour', 'activity',
      'restaurant', 'attraction', 'visa', 'passport', 'currency', 'weather',
      'visit', 'explore', 'journey', 'adventure', 'holiday', 'tourism'
    ];
    
    const lowerQuery = query.toLowerCase();
    return travelKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  // Enhanced search with travel context
  async searchWithTravelContext(query: string, options: {
    location?: string;
    includeNews?: boolean;
    includeImages?: boolean;
  } = {}): Promise<{
    webResults: SerpApiResponse;
    newsResults?: SerpApiResponse;
    imageResults?: SerpApiResponse;
  }> {
    const promises: Promise<any>[] = [];
    
    // Always include web search
    promises.push(this.search(query, { location: options.location, num: 6 }));
    
    // Add travel-specific modifiers for better results
    const travelQuery = this.isTravelQuery(query) ? 
      `${query} travel guide tips recommendations` : query;
    
    if (options.includeNews) {
      promises.push(this.searchNews(travelQuery, { location: options.location, num: 4 }));
    }
    
    if (options.includeImages) {
      promises.push(this.searchImages(query, { num: 4 }));
    }

    try {
      const results = await Promise.all(promises);
      
      return {
        webResults: results[0],
        newsResults: options.includeNews ? results[1] : undefined,
        imageResults: options.includeImages ? results[options.includeNews ? 2 : 1] : undefined
      };
    } catch (error) {
      console.error('Enhanced search error:', error);
      throw error;
    }
  }
}

export const serpApiService = new SerpApiService();