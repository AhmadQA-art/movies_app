import { Client, Account, Databases, Query, ID } from "appwrite";

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}
const updateSearchCount = async (searchTerm, movie) => {
    if (!searchTerm?.trim() || !movie?.id) {
        console.log("Skipping update: missing searchTerm or movie.id");
        return;
    }

    try {
        console.log("updateSearchCount called:", { searchTerm, movie_id: movie.id });

        // 1. Check if metric exists
        const result = await databases.listDocuments(DATABASE_ID, 'metrics', [
            Query.equal('searchTerm', searchTerm.trim())
        ]);

        // 2. FETCH TMDB DETAILS TO GET GENRES (EVERY TIME)
        const tmdbResp = await fetch(`${API_BASE_URL}/movie/${movie.id}`, API_OPTIONS);
        if (!tmdbResp.ok) {
            console.error("TMDB failed for movie_id:", movie.id);
            return;
        }
        const tmdbData = await tmdbResp.json();
        const genreIds = (tmdbData.genres || []).map(g => Number(g.id));

        console.log("TMDB genres to save:", genreIds);

        if (result.documents.length > 0) {
            const doc = result.documents[0];
            await databases.updateDocument(DATABASE_ID, 'metrics', doc.$id, {
                count: doc.count + 1,
                category: genreIds  // ← FORCE UPDATE GENRES
            });
            console.log("Updated metric:", doc.$id, "new count:", doc.count + 1, "genres:", genreIds);
        } else {
            await databases.createDocument(DATABASE_ID, 'metrics', ID.unique(), {
                searchTerm: searchTerm.trim(),
                count: 1,
                movie_id: movie.id,
                averageRating: movie.vote_average || tmdbData.vote_average,
                poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path || tmdbData.poster_path}`,
                category: genreIds
            });
            console.log("Created new metric:", searchTerm, "genres:", genreIds);
        }
    } catch (err) {
        console.error("updateSearchCount FAILED:", err);
    }
};

// lib/appwrite.js
const getTrendingMovies = async () => {
    try {
        console.log("Fetching raw trending from Appwrite...");
        const result = await databases.listDocuments(DATABASE_ID, 'metrics', [
            Query.orderDesc('count'),
            Query.limit(20),
        ]);
        // const test = Query.contains("category", [18, 10749])
        // console.log(`test results: ${test}`);
        console.log("Raw Appwrite docs:", result.documents.map(d => ({
            id: d.$id,
            searchTerm: d.searchTerm,
            count: d.count,
            category: d.category,
            movie_id: d.movie_id
        })));

        // Client-side filter
        const filtered = result.documents.filter(doc => {
            const cat = doc.category || [];
            const hasDrama = cat.includes(18);
            const hasRomance = cat.includes(10749);
            if (hasDrama || hasRomance) {
                console.log("EXCLUDED by Appwrite filter:", {
                    searchTerm: doc.searchTerm,
                    movie_id: doc.movie_id,
                    category: cat
                });
            }
            return !hasDrama && !hasRomance;
        });

        console.log("After Appwrite filter (should be clean):", filtered.map(d => ({
            searchTerm: d.searchTerm,
            category: d.category
        })));

        return filtered.slice(0, 5);
    } catch (e) {
        console.error("getTrendingMovies error:", e);
        return [];
    }
};

export { client, account, databases, updateSearchCount, getTrendingMovies };
