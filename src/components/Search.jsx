import React from 'react';
import { FileSearch } from "lucide-react";
function Search({ searchTerm, setSearchTerm }) {
    return (
        <div className='search'>
            <div>
                <FileSearch className='text-white' />
                <input type="text" placeholder='Search through thousands of movies' value={searchTerm} onChange={(e) => { 
                    setSearchTerm(e.target.value);
                    console.log(`search term updatng`);
                    }} />
            </div>
        </div>

    );
}

export default Search;