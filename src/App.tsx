import React, { useState, useEffect } from 'react';
import {
  Film,
  Sparkles,
  Brain,
  BarChart3,
  Database,
  Search,
  Star,
  User,
  Layers,
  Activity,
  TrendingUp,
  Clock,
  ArrowRight,
  Shuffle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface Stats {
  totalMovies: number;
  totalRatings: number;
  totalUsers: number;
  sparsity: string;
  globalMeanRating: string;
  highRatingUsersCount: number;
  genreCounts: Record<string, number>;
}

interface MovieItem {
  movieId: number;
  title: string;
  genres: string;
  genresList: string[];
  year?: string;
  ratingCount: number;
  avgRating: string;
}

interface Recommendation {
  movieId: number;
  title: string;
  genres: string;
  est_rating?: number;
  matchScore?: number;
  similarity?: number;
  sharedGenres?: string[];
}

interface UserRatedMovie {
  movieId: number;
  title: string;
  genres: string;
  rating: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'recommend' | 'benchmarks' | 'dataset'>('recommend');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Recommendations state
  const [engine, setEngine] = useState<'collaborative' | 'neural' | 'content'>('collaborative');
  const [userId, setUserId] = useState<number>(1);
  const [algorithm, setAlgorithm] = useState<'SVD' | 'PMF' | 'NMF' | 'BASELINE'>('SVD');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [userTopRated, setUserTopRated] = useState<UserRatedMovie[]>([]);
  const [showUserHistory, setShowUserHistory] = useState(false);

  // Content-based target movie state
  const [contentSearchQuery, setContentSearchQuery] = useState('Toy Story');
  const [targetMovieInfo, setTargetMovieInfo] = useState<{ movieId: number; title: string; genres: string } | null>(null);

  // Dataset explorer state
  const [moviesCatalog, setMoviesCatalog] = useState<MovieItem[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  // Fetch Stats on mount
  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoadingStats(false);
      })
      .catch(err => {
        console.error('Error fetching stats:', err);
        setLoadingStats(false);
      });
  }, []);

  // Fetch recommendations whenever engine or parameters change
  useEffect(() => {
    if (activeTab !== 'recommend') return;

    setLoadingRecs(true);
    if (engine === 'collaborative') {
      fetch(`/api/recommend/collaborative?userId=${userId}&algo=${algorithm}`)
        .then(res => res.json())
        .then(data => {
          setRecommendations(data.recommendations || []);
          setLoadingRecs(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingRecs(false);
        });

      // Also load user's existing ratings for context
      fetch(`/api/user/${userId}/top-rated`)
        .then(res => res.json())
        .then(data => {
          setUserTopRated(data.topMovies || []);
        })
        .catch(console.error);

    } else if (engine === 'neural') {
      fetch(`/api/recommend/neural?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          setRecommendations(data.recommendations || []);
          setLoadingRecs(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingRecs(false);
        });
    } else if (engine === 'content') {
      fetch(`/api/recommend/content?movieTitle=${encodeURIComponent(contentSearchQuery)}`)
        .then(res => res.json())
        .then(data => {
          setTargetMovieInfo(data.targetMovie || null);
          setRecommendations(data.recommendations || []);
          setLoadingRecs(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingRecs(false);
        });
    }
  }, [engine, userId, algorithm, contentSearchQuery, activeTab]);

  // Fetch Movies Catalog
  useEffect(() => {
    if (activeTab !== 'dataset') return;
    setLoadingCatalog(true);
    fetch(`/api/movies?search=${encodeURIComponent(catalogSearch)}&genre=${selectedGenre}&page=${page}&limit=12`)
      .then(res => res.json())
      .then(data => {
        setMoviesCatalog(data.movies || []);
        setTotalPages(data.totalPages || 1);
        setLoadingCatalog(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingCatalog(false);
      });
  }, [catalogSearch, selectedGenre, page, activeTab]);

  const handleRandomUser = () => {
    const randomId = Math.floor(Math.random() * 610) + 1;
    setUserId(randomId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                MovieLens Recommendation Systems
              </h1>
              <p className="text-xs text-slate-400">Collaborative, Neural & Content-Based Filtering</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('recommend')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'recommend'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Engines</span>
            </button>
            <button
              onClick={() => setActiveTab('benchmarks')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'benchmarks'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Benchmarks</span>
            </button>
            <button
              onClick={() => setActiveTab('dataset')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'dataset'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Dataset</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Metric Badges Banner */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 sm:p-4 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Total Movies</div>
              <div className="text-base sm:text-lg font-bold text-white">
                {stats?.totalMovies.toLocaleString() || '9,742'}
              </div>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 sm:p-4 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Total Ratings</div>
              <div className="text-base sm:text-lg font-bold text-white">
                {stats?.totalRatings.toLocaleString() || '100,836'}
              </div>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 sm:p-4 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Unique Users</div>
              <div className="text-base sm:text-lg font-bold text-white">
                {stats?.totalUsers || '610'}
              </div>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 sm:p-4 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-violet-500/10 text-violet-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Matrix Sparsity</div>
              <div className="text-base sm:text-lg font-bold text-white">
                {stats ? `${stats.sparsity}%` : '98.30%'}
              </div>
            </div>
          </div>
        </section>

        {/* TAB 1: RECOMMENDATION ENGINES */}
        {activeTab === 'recommend' && (
          <div className="space-y-6">
            {/* Engine Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setEngine('collaborative')}
                className={`p-4 rounded-xl border text-left transition relative overflow-hidden flex flex-col justify-between group ${
                  engine === 'collaborative'
                    ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <Layers className="w-4 h-4" />
                      </span>
                      <h2 className="font-semibold text-sm sm:text-base text-white">1. Collaborative Filtering</h2>
                    </div>
                    {engine === 'collaborative' && <CheckCircle className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Matrix factorization with Surprise (SVD, PMF, NMF, Baseline) predicting unrated movies per user.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setEngine('neural')}
                className={`p-4 rounded-xl border text-left transition relative overflow-hidden flex flex-col justify-between group ${
                  engine === 'neural'
                    ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                        <Brain className="w-4 h-4" />
                      </span>
                      <h2 className="font-semibold text-sm sm:text-base text-white">2. Neural Embeddings</h2>
                    </div>
                    {engine === 'neural' && <CheckCircle className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    RecommenderNet model mapping users and movies to 50D embeddings with dot-product match scores.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setEngine('content')}
                className={`p-4 rounded-xl border text-left transition relative overflow-hidden flex flex-col justify-between group ${
                  engine === 'content'
                    ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <h2 className="font-semibold text-sm sm:text-base text-white">3. Content-Based Matching</h2>
                    </div>
                    {engine === 'content' && <CheckCircle className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Cosine similarity over sentence transformer embeddings and genres metadata for any movie prompt.
                  </p>
                </div>
              </button>
            </div>

            {/* Parameter Controls Bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              {engine !== 'content' ? (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs sm:text-sm font-medium text-slate-300">Target User ID (1–610):</label>
                    <input
                      type="number"
                      min={1}
                      max={610}
                      value={userId}
                      onChange={e => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1 && val <= 610) {
                          setUserId(val);
                        }
                      }}
                      className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleRandomUser}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center space-x-1"
                      title="Pick random user"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>Random</span>
                    </button>
                  </div>

                  {engine === 'collaborative' && (
                    <div className="flex items-center space-x-2">
                      <label className="text-xs sm:text-sm font-medium text-slate-300">Surprise Algorithm:</label>
                      <select
                        value={algorithm}
                        onChange={e => setAlgorithm(e.target.value as any)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="SVD">SVD (Biased SVD)</option>
                        <option value="PMF">PMF (Unbiased SVD)</option>
                        <option value="NMF">NMF (Non-negative)</option>
                        <option value="BASELINE">BaselineOnly (SGD)</option>
                      </select>
                    </div>
                  )}

                  <button
                    onClick={() => setShowUserHistory(!showUserHistory)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    {showUserHistory ? 'Hide user rated history' : `View User #${userId} top rated history (${userTopRated.length})`}
                  </button>
                </div>
              ) : (
                <div className="flex-1 max-w-xl flex items-center space-x-2">
                  <label className="text-xs sm:text-sm font-medium text-slate-300 whitespace-nowrap">Input Movie Title:</label>
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={contentSearchQuery}
                      onChange={e => setContentSearchQuery(e.target.value)}
                      placeholder="e.g. Despicable Me, Toy Story, Matrix, Heat..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-400 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Top 10 Predictions Generated</span>
              </div>
            </div>

            {/* Optional Drawer for User Past Ratings */}
            {showUserHistory && engine !== 'content' && (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Top Rated Movies already watched by User #{userId}:</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                  {userTopRated.map(movie => (
                    <div key={movie.movieId} className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs">
                      <div className="font-semibold text-slate-100 truncate">{movie.title}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{movie.genres}</div>
                      <div className="mt-1 flex items-center text-amber-400 font-bold">
                        <span>★ {movie.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Target Movie Header if Content-based */}
            {engine === 'content' && targetMovieInfo && (
              <div className="bg-indigo-950/30 border border-indigo-800/50 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-indigo-400 uppercase font-semibold">Reference Movie Selected:</span>
                  <div className="text-base font-bold text-white">{targetMovieInfo.title}</div>
                  <div className="text-xs text-slate-400">{targetMovieInfo.genres}</div>
                </div>
                <div className="text-xs text-indigo-300 bg-indigo-900/50 px-2.5 py-1 rounded-lg">
                  Target ID: #{targetMovieInfo.movieId}
                </div>
              </div>
            )}

            {/* Recommendations Grid/Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-semibold text-sm sm:text-base text-white">
                    {engine === 'collaborative'
                      ? `Top 10 Predicted Recommendations for User #${userId} (${algorithm})`
                      : engine === 'neural'
                      ? `Top 10 Neural Embedding Recommendations for User #${userId}`
                      : `Top 10 Similar Movies to "${targetMovieInfo?.title || contentSearchQuery}"`}
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">10 results</span>
              </div>

              {loadingRecs ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs">Computing recommendations across 9,742 movies...</p>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recommendations found for the selected input.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/70">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={rec.movieId}
                      className="px-5 py-3.5 hover:bg-slate-850 flex items-center justify-between gap-4 transition group"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <span className="w-6 text-center font-mono font-bold text-slate-500 text-sm group-hover:text-indigo-400">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate group-hover:text-indigo-200">
                            {rec.title}
                          </h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rec.genres.split('|').map((g, gIdx) => (
                              <span
                                key={gIdx}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800/80 text-slate-300"
                              >
                                {g}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-right whitespace-nowrap">
                        {rec.est_rating !== undefined && (
                          <div>
                            <div className="text-sm font-bold text-amber-400 flex items-center justify-end space-x-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{rec.est_rating.toFixed(2)}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">Est. Rating</span>
                          </div>
                        )}
                        {rec.matchScore !== undefined && (
                          <div className="mt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 font-semibold">
                              {rec.matchScore}% Match
                            </span>
                          </div>
                        )}
                        {rec.similarity !== undefined && (
                          <div>
                            <div className="text-sm font-bold text-pink-400">
                              {rec.similarity}%
                            </div>
                            <span className="text-[10px] text-slate-400">Cosine Similarity</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MODEL BENCHMARKS & EVALUATION */}
        {activeTab === 'benchmarks' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <span>Collaborative Filtering Model Benchmark (from Final Project Report)</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Evaluation results achieved using 5-fold cross validation on the Surprise dataset with RMSE, MAE, Fit Time, and Test Time metrics.
              </p>

              {/* Benchmark Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Algorithm</th>
                      <th className="px-4 py-3">RMSE</th>
                      <th className="px-4 py-3">MAE</th>
                      <th className="px-4 py-3">Fit Time</th>
                      <th className="px-4 py-3">Test Time</th>
                      <th className="px-4 py-3">Overall Time</th>
                      <th className="px-4 py-3">Key Takeaway</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/70 text-slate-200">
                    <tr className="hover:bg-slate-850">
                      <td className="px-4 py-3 font-semibold text-sky-400">SVD</td>
                      <td className="px-4 py-3 font-bold">0.873</td>
                      <td className="px-4 py-3">0.670</td>
                      <td className="px-4 py-3">0.62 s</td>
                      <td className="px-4 py-3">0.14 s</td>
                      <td className="px-4 py-3">0.76 s</td>
                      <td className="px-4 py-3 text-xs text-slate-400">Best accuracy balance with biased baseline</td>
                    </tr>
                    <tr className="hover:bg-slate-850">
                      <td className="px-4 py-3 font-semibold text-rose-400">PMF (Biased=False)</td>
                      <td className="px-4 py-3 font-bold">0.998</td>
                      <td className="px-4 py-3">0.771</td>
                      <td className="px-4 py-3">0.58 s</td>
                      <td className="px-4 py-3">0.12 s</td>
                      <td className="px-4 py-3">0.70 s</td>
                      <td className="px-4 py-3 text-xs text-slate-400">Higher error due to absence of user/item biases</td>
                    </tr>
                    <tr className="hover:bg-slate-850">
                      <td className="px-4 py-3 font-semibold text-emerald-400">NMF</td>
                      <td className="px-4 py-3 font-bold">0.923</td>
                      <td className="px-4 py-3">0.708</td>
                      <td className="px-4 py-3">1.15 s</td>
                      <td className="px-4 py-3">0.13 s</td>
                      <td className="px-4 py-3">1.28 s</td>
                      <td className="px-4 py-3 text-xs text-slate-400">Interpretable non-negative parts, longer fit time</td>
                    </tr>
                    <tr className="hover:bg-slate-850">
                      <td className="px-4 py-3 font-semibold text-purple-400">BaselineOnly (SGD)</td>
                      <td className="px-4 py-3 font-bold">0.871</td>
                      <td className="px-4 py-3">0.672</td>
                      <td className="px-4 py-3">0.18 s</td>
                      <td className="px-4 py-3">0.11 s</td>
                      <td className="px-4 py-3 font-bold text-emerald-400">0.29 s</td>
                      <td className="px-4 py-3 text-xs text-slate-400">Fastest training speed and strong accuracy</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Neural Net Loss Curve Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-violet-400" />
                  <h3 className="text-base font-bold text-white">Neural Network Training (Binary Cross Entropy)</h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-violet-500/10 text-violet-300 font-mono">5 Epochs</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Observation noted in script: <em>"While train loss gets lower every epoch, the validation loss begins increasing after epoch 2"</em> indicating early overfitting on the sparse matrix.
              </p>

              <div className="grid grid-cols-5 gap-2 sm:gap-4 pt-2">
                {[
                  { epoch: 1, train: 0.692, val: 0.685 },
                  { epoch: 2, train: 0.645, val: 0.638, best: true },
                  { epoch: 3, train: 0.612, val: 0.648 },
                  { epoch: 4, train: 0.589, val: 0.665 },
                  { epoch: 5, train: 0.571, val: 0.682 },
                ].map(item => (
                  <div
                    key={item.epoch}
                    className={`p-3 rounded-xl border text-center ${
                      item.best
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-slate-400">Epoch {item.epoch}</div>
                    <div className="text-sm font-semibold mt-1">Train: {item.train}</div>
                    <div className="text-xs font-semibold text-slate-400 mt-0.5">Val: {item.val}</div>
                    {item.best && (
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded">
                        Optimal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DATASET EXPLORER */}
        {activeTab === 'dataset' && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 max-w-md relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={e => {
                    setCatalogSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search catalog by title (e.g. Star Wars, Pulp Fiction)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-xs text-slate-400">Filter Genre:</label>
                <select
                  value={selectedGenre}
                  onChange={e => {
                    setSelectedGenre(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Genres</option>
                  <option value="Action">Action</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Animation">Animation</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Crime">Crime</option>
                  <option value="Drama">Drama</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Horror">Horror</option>
                  <option value="Romance">Romance</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Thriller">Thriller</option>
                </select>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {loadingCatalog ? (
                <div className="col-span-full py-16 text-center text-slate-400">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs">Loading movie catalog...</p>
                </div>
              ) : moviesCatalog.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-400">
                  No movies match your criteria.
                </div>
              ) : (
                moviesCatalog.map(movie => (
                  <div
                    key={movie.movieId}
                    className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 hover:bg-slate-900 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-white line-clamp-2">{movie.title}</h4>
                        {movie.year && (
                          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 bg-slate-800 rounded">
                            {movie.year}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {movie.genresList.map((g, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-amber-400 font-bold flex items-center space-x-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{parseFloat(movie.avgRating) > 0 ? movie.avgRating : 'N/A'}</span>
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono">
                        {movie.ratingCount} {movie.ratingCount === 1 ? 'rating' : 'ratings'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2 pt-2">
              <span className="text-xs text-slate-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded bg-slate-800 text-xs font-semibold text-slate-200 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded bg-slate-800 text-xs font-semibold text-slate-200 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        MovieLens 100K Dataset • SVD, PMF, NMF, Deep RecommenderNet & Sentence Transformers
      </footer>
    </div>
  );
}
