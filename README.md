# MovieSearch App

**Find Movies You'll Enjoy Without the Hassle**

*Built with React, Vite, Appwrite, and The Movie Database (TMDB)*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20App-blue)](https://movieapprepo.netlify.app)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Appwrite Setup](#appwrite-setup)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Usage](#usage)
- [Build for Production](#build-for-production)
- [Debugging Tips](#debugging-tips)
- [Known Issues & Fixes](#known-issues--fixes)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Smart Search**: Debounced input to reduce API calls and improve performance.
- **Genre Filtering**: Automatically excludes Drama (ID: 18) and Romance (ID: 10749) genres for a tailored experience.
- **Trending Movies**: Real-time search popularity powered by Appwrite database.
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices.
- **Fast & Lightweight**: Built with Vite and React for quick loading times.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| **Frontend**| React 18, Vite, Tailwind CSS         |
| **Backend** | Appwrite (Database + Authentication) |
| **API**     | [The Movie Database (TMDB)](https://www.themoviedb.org/) |
| **Icons**   | [Lucide React](https://lucide.dev)   |
| **Utilities**| `use-debounce`                      |

---

## How It Works

1. **User Input**: Type a movie name with debounced search (500ms delay) to minimize API requests.
2. **API Fetch & Filtering**: Fetches results from TMDB, filtering out:
   - Adult movies
   - Drama (genre ID: `18`)
   - Romance (genre ID: `10749`)
3. **Data Storage**: The first result is saved to Appwrite with:
   - `searchTerm`
   - `movie_id`
   - `count` (incremented for popularity tracking)
   - `category` (array of genre IDs)
4. **Trending Section**: Displays top 5 most-searched movies, filtered server-side by Appwrite to exclude Drama and Romance.

---

## Project Structure

```
src/
├── components/
│   ├── Search.jsx          # Search input component with icon
│   └── MovieCard.jsx       # Component for displaying individual movie details
├── lib/
│   └── appwrite.js         # Appwrite client configuration and utility functions
├── App.jsx                 # Main application logic and UI
├── main.jsx                # Application entry point
└── index.html              # HTML template
```

---

## Prerequisites

- Node.js (version 16 or higher) – [Download here](https://nodejs.org/)
- npm or yarn package manager
- TMDB API key (free account required) – [Get it here](https://www.themoviedb.org/settings/api)
- Appwrite account and project – [Sign up here](https://appwrite.io/)

---

## Appwrite Setup

### 1. Create Database & Collection

- **Database ID**: `69164bb8000b1c4b8c6c`
- **Collection ID**: `metrics`

### 2. Collection Attributes (`metrics`)

| Key             | Type          | Settings                          |
|-----------------|---------------|-----------------------------------|
| `searchTerm`   | String       | Required                          |
| `count`        | Integer      | Default: `1`                      |
| `movie_id`     | Integer      | Required                          |
| `averageRating`| Double       | Optional                          |
| `poster_url`   | String       | Optional                          |
| `category`     | Array → Integer | **Array Enabled** (Critical)     |

> **Important**: Ensure `category` is configured as an **Array of Integers**. If it's set as a single integer, delete and recreate the attribute.

---

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_TMDB_API_KEY=your_tmdb_read_access_token
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=69164bb8000b1c4b8c6c
```

> Obtain your TMDB API key from the [TMDB API settings page](https://www.themoviedb.org/settings/api).

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/movie-search-app.git
   cd movie-search-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see [Environment Variables](#environment-variables)).

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Usage

- Enter a movie name in the search bar to find matching films.
- Browse trending movies based on search popularity.
- The app automatically filters out unwanted genres for a curated experience.

---

## Build for Production

1. Build the project:
   ```bash
   npm run build
   ```

2. The `dist/` folder will contain the production build. Deploy it to platforms like:
   - [Netlify](https://netlify.com/)
   - [Vercel](https://vercel.com/)
   - [Cloudflare Pages](https://pages.cloudflare.com/)

---

## Debugging Tips

### Check Appwrite Data
In the browser console:
```js
databases.listDocuments('DATABASE_ID', 'metrics');
```

### Verify Genre Saving
Search for a movie and check if `category` contains arrays like `[28, 12]`.

### Clear Old Data
Run this in the console once:
```js
databases.listDocuments('DATABASE_ID', 'metrics').then(r => r.documents.forEach(d => databases.deleteDocument('DATABASE_ID', 'metrics', d.$id)));
```

---

## Known Issues & Fixes

| Issue                          | Fix                                                                 |
|--------------------------------|---------------------------------------------------------------------|
| `category['0']` out of range  | Recreate `category` as **Array of Integer** in Appwrite collection |
| Drama/Romance in Trending      | Ensure `updateSearchCount` saves `category` correctly               |
| Empty trending list            | Search for movies first to populate the metrics collection         |

---

## Contributing

Contributions are welcome! Please fork the repository, make your changes, and submit a pull request.

---

## License

MIT © 2025

Feel free to fork, star, and contribute!

---

**Made with ❤️ in Egypt**