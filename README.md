# MovieSearch App – README  
**Find Movies You'll Enjoy Without the Hassle**  
*Built with React, Vite, Appwrite, and The Movie Database (TMDB)*  

---

## Live Demo  
[https://your-movie-search.netlify.app](https://your-movie-search.netlify.app) *(replace with your actual URL)*

---

## Screenshots
| Search | Trending Movies | Movie Results |
|--------|------------------|---------------|
| ![Search](screenshots/search.png) | ![Trending](screenshots/trending.png) | ![Results](screenshots/results.png) |

*(Add actual screenshots to `/screenshots` folder)*

---

## Features

- **Smart Search** – Debounced input to reduce API calls  
- **Genre Filtering** – Automatically excludes **Drama (18)** and **Romance (10749)**  
- **Trending Movies** – Real-time search popularity powered by **Appwrite**  
- **Responsive Design** – Works on mobile, tablet, and desktop  
- **Fast & Lightweight** – Built with Vite + React  

---

## Tech Stack

| Layer | Technology |
|------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS (via className) |
| **Backend** | Appwrite (Database + Auth) |
| **API** | [The Movie Database (TMDB)](https://www.themoviedb.org/) |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Debounce** | `use-debounce` |

---

## How It Works

1. **User types a movie name** → debounced search (500ms)  
2. **App fetches from TMDB** → filters out:
   - Adult movies
   - Drama (genre ID `18`)
   - Romance (genre ID `10749`)
3. **First result is saved to Appwrite** with:
   - `searchTerm`
   - `movie_id`
   - `count`
   - `category` (array of genre IDs)
4. **Trending section** shows top 5 most-searched movies  
   - Filtered **server-side** by Appwrite `category[]`  
   - No Drama or Romance allowed  

---

## Project Structure

```
src/
├── components/
│   ├── Search.jsx          # Search input with icon
│   └── MovieCard.jsx       # Individual movie display
├── lib/
│   └── appwrite.js         # Appwrite client + functions
├── App.jsx                 # Main logic & UI
├── main.jsx
└── index.html
```

---

## Appwrite Setup (Required)

### 1. Create Database & Collection
```text
Database ID: 69164bb8000b1c4b8c6c
Collection ID: metrics
```

### 2. Collection Attributes (`metrics`)

| Key | Type | Settings |
|-----|------|----------|
| `searchTerm` | String | Required |
| `count` | Integer | Default: `1` |
| `movie_id` | Integer | Required |
| `averageRating` | Double | |
| `poster_url` | String | |
| `category` | **Array → Integer** | **Array: Checked** |

> **Critical**: `category` **must be an Array of Integer**  
> Delete & recreate if it's a single integer.

---

## Environment Variables (`.env`)

```env
VITE_TMDB_API_KEY=your_tmdb_read_access_token
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=69164bb8000b1c4b8c6c
```

> Get TMDB token: [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

---

## Installation

```bash
# Clone repo
git clone https://github.com/your-username/movie-search-app.git
cd movie-search-app

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Build for Production

```bash
npm run build
```

Deploy `dist/` folder to:
- Netlify
- Vercel
- Cloudflare Pages

---

## Debugging Tips

### Check Appwrite Data
```js
// In browser console
databases.listDocuments('DATABASE_ID', 'metrics')
```

### Force Save Genres
Search any movie → check if `category` has numbers like `[28, 12]`

### Clear Old Data
```js
// Run once in console
databases.listDocuments(...).then(r => r.documents.forEach(d => databases.deleteDocument(..., d.$id)))
```

---

## Known Issues & Fixes

| Issue | Fix |
|------|-----|
| `category['0']` out of range | Recreate `category` as **Array of Integer** |
| Drama/Romance in Trending | Ensure `updateSearchCount` saves `category` |
| Empty trending list | Search movies first to populate metrics |

---

## Future Ideas

- [ ] User accounts (save favorites)
- [ ] Dark/Light mode toggle
- [ ] Click movie → detailed view
- [ ] Search history
- [ ] Genre badges with names

---

## License

MIT © 2025  
Feel free to fork, star, and contribute!

---

**Made with love in Egypt**  
*November 15, 2025*