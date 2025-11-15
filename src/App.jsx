import Search from './components/Search.jsx'
import MovieCard from './components/MovieCard.jsx'
import { useDebouncedCallback } from 'use-debounce';
import { useState, useEffect } from "react";
import { client, updateSearchCount, getTrendingMovies } from "./lib/appwrite";
import { AppwriteException } from "appwrite";

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

function App() {

  const [searchTerm, setSearchTerm] = useState('');

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  const [movieList, setMovieList] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);

  const debouncedSearch = useDebouncedCallback(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 500);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm, debouncedSearch]);


  const fetchMovies = async (query = '') => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const endPoint = query
        ? `${API_BASE_URL}/search/movie?query=${query}&include_adult=false`
        : `${API_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&without_genres=Drama%20%7C%20Liebesfilm`;

      const response = await fetch(endPoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      // Filter out movies with Romance (10749) or Drama (18) genres, and adult movies
      const filteredResults = (data.results || []).filter(movie => {
        // Exclude adult movies
        if (movie.adult) return false;
        // Exclude if genre_ids contains 18 (Drama) or 10749 (Romance)
        return !movie.genre_ids || !movie.genre_ids.some(id => id === 18 || id === 10749);
      });

      if (data.Response === 'false') {
        setErrorMessage(data.Error || 'failed to fetch movies')
        setMovieList([]);
        return;
      }
      setMovieList(filteredResults);
      if (query && filteredResults.length > 0) {
        const movie = filteredResults[0];
        console.log("Saving search metric for:", query, "movie_id:", movie.id);
        await updateSearchCount(query, movie);
      }
    } catch (e) {
      console.log(`Error fetching the movies: ${e}`);
      setErrorMessage(`Error fetching the movies please try again.`)
    } finally {
      setIsLoading(false);
      setErrorMessage('');
    }
  }

  const loadTrendingMovies = async () => {
    try {
      console.log("loadTrendingMovies: Starting...");
      const trendingData = await getTrendingMovies();

      console.log("From Appwrite (clean):", trendingData.map(t => ({
        searchTerm: t.searchTerm,
        movie_id: t.movie_id,
        category: t.category
      })));

      if (!trendingData || trendingData.length === 0) {
        console.log("No clean trending movies from Appwrite");
        setTrendingMovies([]);
        return;
      }

      const detailedMovies = await Promise.all(
        trendingData.map(async (item) => {
          try {
            console.log(`Fetching TMDB details for movie_id: ${item.movie_id}`);
            const response = await fetch(`${API_BASE_URL}/movie/${item.movie_id}`, API_OPTIONS);
            if (!response.ok) {
              console.log(`TMDB failed for ${item.movie_id}: ${response.status}`);
              return null;
            }
            const movieDetails = await response.json();

            const tmdbGenres = movieDetails.genres?.map(g => g.id) || [];
            console.log(`TMDB genres for ${item.movie_id}:`, tmdbGenres);

            return {
              ...item,
              title: movieDetails.title,
              poster_path: movieDetails.poster_path,
              vote_average: movieDetails.vote_average,
              genre_ids: tmdbGenres
            };
          } catch (e) {
            console.log(`Error fetching TMDB for ${item.movie_id}:`, e);
            return item;
          }
        })
      );

      const validMovies = detailedMovies.filter(m => m !== null);

      console.log("Final trendingMovies state (before set):", validMovies.map(m => ({
        searchTerm: m.searchTerm,
        category: m.category,
        genre_ids: m.genre_ids
      })));

      setTrendingMovies(validMovies);
    } catch (e) {
      console.error('Error in loadTrendingMovies:', e);
      setTrendingMovies([]);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, [])

  return (
    <main>
      <div className='pattern' />
      <div className='wrapper'>
        <header>
          <img src="./hero.png" alt="hero banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => {
                // Double-check (optional)
                if (movie.category?.includes(18) || movie.category?.includes(10749)) {
                  return null;
                }

                return (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section className='all-movies'>
          <h2>All Movies</h2>
          {isLoading ?
            (
              <p className='text-white'>Loading....</p>
            ) : errorMessage ?
              (
                <p className='text-red-500'>{errorMessage}</p>
              ) :
              (
                <ul>
                  {movieList.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </ul>
              )}
        </section>
      </div>
    </main>
  );
}

export default App;