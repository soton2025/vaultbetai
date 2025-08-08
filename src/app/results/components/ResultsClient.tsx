'use client';

import { useState, useEffect } from 'react';
import { 
  Filter, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target,
  Search,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import Link from 'next/link';
import VaultLogo from '@/components/VaultLogo';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageTransition from '@/components/PageTransition';
import DisclaimerBanner from '@/components/DisclaimerBanner';

interface HistoricalResult {
  id: string;
  date: string;
  event: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  market: string;
  odds: number;
  confidence: number;
  result: 'W' | 'L' | 'P'; // Win, Loss, Pending
  actualOdds?: number;
  pnl?: number;
}

type SortField = 'date' | 'odds' | 'confidence' | 'result';
type SortDirection = 'asc' | 'desc';

interface Filters {
  sport: string;
  result: string;
  minOdds: number;
  maxOdds: number;
  dateFrom: string;
  dateTo: string;
  league: string;
}

export default function ResultsClient() {
  const [results, setResults] = useState<HistoricalResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<HistoricalResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const resultsPerPage = 20;

  const [filters, setFilters] = useState<Filters>({
    sport: '',
    result: '',
    minOdds: 1.0,
    maxOdds: 10.0,
    dateFrom: '',
    dateTo: '',
    league: ''
  });

  // Mock data generator for demo purposes
  const generateMockResults = (): HistoricalResult[] => {
    const leagues = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions League'];
    const markets = ['Over 2.5 Goals', 'Both Teams to Score', 'Home Win', 'Away Win', 'Draw', 'Under 2.5 Goals'];
    const teams = [
      'Arsenal', 'Chelsea', 'Manchester United', 'Liverpool', 'Manchester City', 'Barcelona', 
      'Real Madrid', 'Bayern Munich', 'Juventus', 'PSG', 'AC Milan', 'Inter Milan'
    ];

    const mockResults: HistoricalResult[] = [];
    const today = new Date();

    for (let i = 0; i < 200; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const homeTeam = teams[Math.floor(Math.random() * teams.length)];
      let awayTeam = teams[Math.floor(Math.random() * teams.length)];
      while (awayTeam === homeTeam) {
        awayTeam = teams[Math.floor(Math.random() * teams.length)];
      }

      const odds = Number((Math.random() * 4 + 1.5).toFixed(2));
      const confidence = Math.floor(Math.random() * 40 + 60); // 60-100% confidence
      const winProbability = confidence > 85 ? 0.85 : confidence > 75 ? 0.75 : 0.65;
      const result = Math.random() < winProbability ? 'W' : 'L' as 'W' | 'L';
      
      mockResults.push({
        id: `result-${i}`,
        date: date.toISOString().split('T')[0],
        event: `${homeTeam} vs ${awayTeam}`,
        homeTeam,
        awayTeam,
        league: leagues[Math.floor(Math.random() * leagues.length)],
        market: markets[Math.floor(Math.random() * markets.length)],
        odds,
        confidence,
        result: i < 5 ? 'P' : result, // Last 5 are pending
        actualOdds: result === 'W' ? odds : 0,
        pnl: result === 'W' ? Number(((odds - 1) * 100).toFixed(2)) : result === 'L' ? -100 : 0
      });
    }

    return mockResults;
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For demo, use mock data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockData = generateMockResults();
        setResults(mockData);
        setFilteredResults(mockData);
        
      } catch (error) {
        console.error('Error fetching results:', error);
        setError('Unable to load results data');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, results, sortField, sortDirection]);

  const applyFilters = () => {
    let filtered = [...results];

    // Apply filters
    if (filters.result) {
      filtered = filtered.filter(r => r.result === filters.result);
    }
    if (filters.minOdds > 1.0) {
      filtered = filtered.filter(r => r.odds >= filters.minOdds);
    }
    if (filters.maxOdds < 10.0) {
      filtered = filtered.filter(r => r.odds <= filters.maxOdds);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(r => r.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(r => r.date <= filters.dateTo);
    }
    if (filters.league) {
      filtered = filtered.filter(r => r.league.toLowerCase().includes(filters.league.toLowerCase()));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredResults(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      sport: '',
      result: '',
      minOdds: 1.0,
      maxOdds: 10.0,
      dateFrom: '',
      dateTo: '',
      league: ''
    });
  };

  // Calculate statistics
  const stats = {
    totalPicks: filteredResults.filter(r => r.result !== 'P').length,
    wins: filteredResults.filter(r => r.result === 'W').length,
    losses: filteredResults.filter(r => r.result === 'L').length,
    winRate: filteredResults.filter(r => r.result !== 'P').length > 0 
      ? (filteredResults.filter(r => r.result === 'W').length / filteredResults.filter(r => r.result !== 'P').length * 100).toFixed(1)
      : '0.0',
    totalPnL: filteredResults.filter(r => r.result !== 'P').reduce((sum, r) => sum + (r.pnl || 0), 0).toFixed(2),
    avgOdds: filteredResults.filter(r => r.result !== 'P').length > 0
      ? (filteredResults.filter(r => r.result !== 'P').reduce((sum, r) => sum + r.odds, 0) / filteredResults.filter(r => r.result !== 'P').length).toFixed(2)
      : '0.00'
  };

  // Pagination
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = filteredResults.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'W': return <CheckCircle className="w-5 h-5 text-accent-green" />;
      case 'L': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'P': return <Clock className="w-5 h-5 text-accent-cyan" />;
      default: return null;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'W': return 'text-accent-green bg-accent-green/10 border-accent-green/20';
      case 'L': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'P': return 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-gray-900 to-dark-800">
        <PageTransition>
          <div className="text-center">
            <LoadingSpinner size="lg" color="purple" />
            <div className="text-white text-xl font-medium mt-6">Loading Results Archive...</div>
            <div className="text-gray-400 text-sm mt-2">Compiling historical performance data</div>
          </div>
        </PageTransition>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-gray-800/50 glass-effect-strong sticky top-0 z-40 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                  <VaultLogo size={40} className="animate-glow-pulse animate-subtle-float" />
                  <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Results Archive</h1>
                    <p className="text-accent-cyan text-xs font-medium">Historical Track Record</p>
                  </div>
                </Link>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-100 text-white rounded-xl hover:bg-dark-50 transition-all duration-300 glass-effect border border-gray-700/50 hover:border-accent-purple/30"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-dark-100 text-white rounded-xl hover:bg-dark-50 transition-all duration-300 glass-effect border border-gray-700/50 hover:border-accent-cyan/30">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="glass-effect-strong rounded-xl p-6 border border-accent-green/20">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-6 h-6 text-accent-green" />
                <span className="text-2xl font-bold text-accent-green">{stats.winRate}%</span>
              </div>
              <div className="text-gray-300 font-medium text-sm">Win Rate</div>
            </div>
            
            <div className="glass-effect-strong rounded-xl p-6 border border-accent-cyan/20">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-6 h-6 text-accent-cyan" />
                <span className="text-2xl font-bold text-accent-cyan">{stats.totalPicks}</span>
              </div>
              <div className="text-gray-300 font-medium text-sm">Total Picks</div>
            </div>
            
            <div className="glass-effect-strong rounded-xl p-6 border border-accent-purple/20">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-6 h-6 text-accent-purple" />
                <span className="text-2xl font-bold text-accent-purple">{stats.avgOdds}</span>
              </div>
              <div className="text-gray-300 font-medium text-sm">Avg Odds</div>
            </div>
            
            <div className="glass-effect-strong rounded-xl p-6 border border-accent-pink/20">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-6 h-6 text-accent-pink" />
                <span className="text-2xl font-bold text-accent-pink">{stats.wins}</span>
              </div>
              <div className="text-gray-300 font-medium text-sm">Wins</div>
            </div>
            
            <div className="glass-effect-strong rounded-xl p-6 border border-gray-700/20">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown className="w-6 h-6 text-red-400" />
                <span className="text-2xl font-bold text-red-400">{stats.losses}</span>
              </div>
              <div className="text-gray-300 font-medium text-sm">Losses</div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="glass-effect-strong rounded-xl p-6 mb-8 border border-gray-700/20 animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Result</label>
                  <select
                    value={filters.result}
                    onChange={(e) => handleFilterChange('result', e.target.value)}
                    className="w-full px-3 py-2 bg-dark-100 border border-gray-700 rounded-xl text-white text-sm focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 focus:outline-none"
                  >
                    <option value="">All Results</option>
                    <option value="W">Wins Only</option>
                    <option value="L">Losses Only</option>
                    <option value="P">Pending</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">League</label>
                  <input
                    type="text"
                    value={filters.league}
                    onChange={(e) => handleFilterChange('league', e.target.value)}
                    placeholder="Search league..."
                    className="w-full px-3 py-2 bg-dark-100 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-400 focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Min Odds</label>
                  <input
                    type="number"
                    min="1.0"
                    max="10.0"
                    step="0.1"
                    value={filters.minOdds}
                    onChange={(e) => handleFilterChange('minOdds', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-dark-100 border border-gray-700 rounded-xl text-white text-sm focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Odds</label>
                  <input
                    type="number"
                    min="1.0"
                    max="10.0"
                    step="0.1"
                    value={filters.maxOdds}
                    onChange={(e) => handleFilterChange('maxOdds', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-dark-100 border border-gray-700 rounded-xl text-white text-sm focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 focus:outline-none"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-accent-purple/20 text-accent-purple rounded-xl hover:bg-accent-purple/30 transition-colors font-medium text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center mb-12">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md mx-auto">
                <div className="text-red-400 font-medium mb-2">Unable to load results</div>
                <div className="text-red-300 text-sm mb-4">{error}</div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-6 py-3 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Results Table */}
          {!error && (
            <div className="glass-effect-strong rounded-xl border border-gray-700/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-100 border-b border-gray-700/20">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('date')}
                          className="flex items-center gap-2 text-gray-300 hover:text-white font-medium text-sm"
                        >
                          Date
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-gray-300 font-medium text-sm">Event</th>
                      <th className="px-6 py-4 text-left text-gray-300 font-medium text-sm">Market</th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('odds')}
                          className="flex items-center gap-2 text-gray-300 hover:text-white font-medium text-sm"
                        >
                          Odds
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('confidence')}
                          className="flex items-center gap-2 text-gray-300 hover:text-white font-medium text-sm"
                        >
                          Confidence
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('result')}
                          className="flex items-center gap-2 text-gray-300 hover:text-white font-medium text-sm"
                        >
                          Result
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentResults.map((result, index) => (
                      <tr 
                        key={result.id}
                        className="border-b border-gray-800/30 hover:bg-dark-100/30 transition-colors animate-slide-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4 text-gray-300 text-sm">
                          {new Date(result.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-medium text-sm">{result.event}</div>
                          <div className="text-gray-400 text-xs">{result.league}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-sm">{result.market}</td>
                        <td className="px-6 py-4 text-accent-cyan font-bold text-sm">{result.odds}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-accent-green to-accent-cyan rounded-full transition-all duration-300"
                                style={{ width: `${result.confidence}%` }}
                              />
                            </div>
                            <span className="text-gray-300 text-sm font-medium">{result.confidence}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getResultColor(result.result)}`}>
                            {getResultIcon(result.result)}
                            <span>{result.result === 'W' ? 'Win' : result.result === 'L' ? 'Loss' : 'Pending'}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700/20">
                  <div className="text-sm text-gray-400">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredResults.length)} of {filteredResults.length} results
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'bg-accent-purple text-white'
                                : 'text-gray-400 hover:text-white hover:bg-dark-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <DisclaimerBanner />
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}