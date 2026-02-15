// ============================================================
// Fundamental Analysis Engine
// Market metrics, community, developer activity, sentiment
// ============================================================

import { CoinMarketData, CoinDetailData, FundamentalAnalysis } from '../types';

export class FundamentalAnalysisEngine {

  // ---- Market Cap Score (0-100) ----
  static calculateMarketCapScore(marketCapRank: number | null): number {
    if (!marketCapRank) return 0;
    if (marketCapRank <= 10) return 95;
    if (marketCapRank <= 25) return 85;
    if (marketCapRank <= 50) return 75;
    if (marketCapRank <= 100) return 65;
    if (marketCapRank <= 250) return 50;
    if (marketCapRank <= 500) return 35;
    return 20;
  }

  // ---- Volume to Market Cap Ratio ----
  static calculateVolumeToMarketCap(volume: number, marketCap: number): number {
    if (marketCap === 0) return 0;
    return volume / marketCap;
  }

  // ---- Supply Metrics ----
  static calculateSupplyMetrics(
    circulatingSupply: number,
    totalSupply: number | null,
    maxSupply: number | null
  ): { circulatingRatio: number; isDeflationary: boolean } {
    const effectiveTotal = maxSupply || totalSupply || circulatingSupply;
    const circulatingRatio = effectiveTotal > 0 ? circulatingSupply / effectiveTotal : 1;
    const isDeflationary = maxSupply !== null && maxSupply > 0;

    return { circulatingRatio, isDeflationary };
  }

  // ---- Community Score (0-100) ----
  static calculateCommunityScore(detail: CoinDetailData | null): number {
    if (!detail) return 50; // neutral default

    let score = 0;
    let factors = 0;

    // Twitter followers
    const twitterFollowers = detail.community_data?.twitter_followers || 0;
    if (twitterFollowers > 1000000) score += 100;
    else if (twitterFollowers > 500000) score += 85;
    else if (twitterFollowers > 100000) score += 70;
    else if (twitterFollowers > 50000) score += 55;
    else if (twitterFollowers > 10000) score += 40;
    else score += 20;
    factors++;

    // Reddit subscribers
    const redditSubs = detail.community_data?.reddit_subscribers || 0;
    if (redditSubs > 500000) score += 100;
    else if (redditSubs > 100000) score += 80;
    else if (redditSubs > 50000) score += 60;
    else if (redditSubs > 10000) score += 40;
    else score += 15;
    factors++;

    // Reddit activity
    const redditPosts = detail.community_data?.reddit_average_posts_48h || 0;
    const redditComments = detail.community_data?.reddit_average_comments_48h || 0;
    const activityScore = Math.min(100, (redditPosts * 5) + (redditComments * 2));
    score += activityScore;
    factors++;

    // Watchlist users (CoinGecko specific)
    const watchlistUsers = detail.watchlist_portfolio_users || 0;
    if (watchlistUsers > 1000000) score += 100;
    else if (watchlistUsers > 500000) score += 80;
    else if (watchlistUsers > 100000) score += 60;
    else if (watchlistUsers > 10000) score += 40;
    else score += 15;
    factors++;

    return Math.round(score / factors);
  }

  // ---- Developer Score (0-100) ----
  static calculateDeveloperScore(detail: CoinDetailData | null): number {
    if (!detail) return 50;

    let score = 0;
    let factors = 0;

    const devData = detail.developer_data;
    if (!devData) return 30;

    // GitHub stars
    const stars = devData.stars || 0;
    if (stars > 10000) score += 100;
    else if (stars > 5000) score += 85;
    else if (stars > 1000) score += 70;
    else if (stars > 500) score += 50;
    else if (stars > 100) score += 35;
    else score += 15;
    factors++;

    // Forks
    const forks = devData.forks || 0;
    if (forks > 5000) score += 100;
    else if (forks > 1000) score += 80;
    else if (forks > 500) score += 60;
    else if (forks > 100) score += 40;
    else score += 15;
    factors++;

    // Recent commits (4 weeks)
    const commits = devData.commit_count_4_weeks || 0;
    if (commits > 200) score += 100;
    else if (commits > 100) score += 85;
    else if (commits > 50) score += 70;
    else if (commits > 20) score += 55;
    else if (commits > 5) score += 35;
    else score += 10;
    factors++;

    // Issue resolution
    const totalIssues = devData.total_issues || 0;
    const closedIssues = devData.closed_issues || 0;
    if (totalIssues > 0) {
      const resolutionRate = closedIssues / totalIssues;
      score += Math.round(resolutionRate * 100);
      factors++;
    }

    // PR merges
    const prsMerged = devData.pull_requests_merged || 0;
    if (prsMerged > 1000) score += 100;
    else if (prsMerged > 500) score += 80;
    else if (prsMerged > 100) score += 60;
    else if (prsMerged > 50) score += 40;
    else score += 15;
    factors++;

    return Math.round(score / factors);
  }

  // ---- Sentiment Score (0-100) ----
  static calculateSentimentScore(detail: CoinDetailData | null): number {
    if (!detail) return 50;
    
    const upPct = detail.sentiment_votes_up_percentage;
    if (upPct === null || upPct === undefined) return 50;
    
    return Math.round(upPct);
  }

  // ---- ATH Recovery Potential (0-100) ----
  static calculateATHRecovery(currentPrice: number, ath: number, athChangePercent: number): number {
    if (ath === 0) return 0;
    const distanceFromATH = Math.abs(athChangePercent);
    
    // Higher score if further from ATH (more recovery potential)
    if (distanceFromATH > 90) return 95;
    if (distanceFromATH > 80) return 85;
    if (distanceFromATH > 70) return 75;
    if (distanceFromATH > 50) return 60;
    if (distanceFromATH > 30) return 45;
    if (distanceFromATH > 10) return 30;
    return 15; // Near ATH, less upside potential
  }

  // ============================================================
  // Complete Fundamental Analysis
  // ============================================================
  static analyze(
    marketData: CoinMarketData,
    detailData: CoinDetailData | null = null
  ): FundamentalAnalysis {
    const marketCapScore = this.calculateMarketCapScore(marketData.market_cap_rank);
    
    const volumeToMarketCapRatio = this.calculateVolumeToMarketCap(
      marketData.total_volume,
      marketData.market_cap
    );

    const supplyMetrics = this.calculateSupplyMetrics(
      marketData.circulating_supply,
      marketData.total_supply,
      marketData.max_supply
    );

    const communityScore = this.calculateCommunityScore(detailData);
    const developerScore = this.calculateDeveloperScore(detailData);
    const sentimentScore = this.calculateSentimentScore(detailData);

    const athRecoveryPotential = this.calculateATHRecovery(
      marketData.current_price,
      marketData.ath,
      marketData.ath_change_percentage
    );

    // Weighted overall score
    const overallFundamentalScore = Math.round(
      (marketCapScore * 0.20) +
      (Math.min(100, volumeToMarketCapRatio * 500) * 0.15) +
      ((supplyMetrics.isDeflationary ? 80 : 40) * 0.10) +
      (communityScore * 0.15) +
      (developerScore * 0.15) +
      (sentimentScore * 0.10) +
      (athRecoveryPotential * 0.15)
    );

    return {
      marketCapScore,
      volumeToMarketCapRatio,
      supplyMetrics,
      communityScore,
      developerScore,
      sentimentScore,
      athRecoveryPotential,
      overallFundamentalScore: Math.min(100, overallFundamentalScore),
    };
  }
}
