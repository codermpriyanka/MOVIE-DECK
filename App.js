const API_KEY = '1cc0fd3626ee6e8b0e3b7eb46774e66d';
const API = `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US`;
const IMAGE_URL = `https://image.tmdb.org/t/p/original/`;

const movieListingTag = document.querySelector('.moviesListing');
const prevBtnTag = document.querySelector(".prevBtn");
const nextBtnTag = document.querySelector(".nextBtn");
const sortByDateBtnTag = document.querySelector(".sortByDate");
const sortByRatingBtnTag = document.querySelector(".sortByRating");
const searchBox = document.getElementById("search");
const searchBtn = document.getElementById("btn");
const favbtn = document.getElementById("favorites");
const allbtn = document.getElementById("all");
let currentMovieData = '';
let sortedByDateMovieData = '';
let sortedByRatingMovieData = '';
let isSortedByDate = false;
let isSortedByRating = false;
let currentPage = 1;
let totalPage = 0;

// Previous button functionality
prevBtnTag.addEventListener('click', () => {
    if (currentPage === 1) {
        return;
    }
    currentPage--;
    getPaginatedMovieData(currentPage);
});

// Next button functionality

nextBtnTag.addEventListener('click', () => {
    if (currentPage === totalPage) {
        return;
    }
    currentPage++;
    getPaginatedMovieData(currentPage);
});
// Sorting by date functionality

sortByDateBtnTag.addEventListener('click', () => {
    if (isSortedByDate) {
        isSortedByDate = false;
        isSortedByRating = false;
        updateMoviePage(currentMovieData);
        return;
    }
    isSortedByDate = true;
    isSortedByRating = false;
    if (!sortedByDateMovieData) {
        sortedByDateMovieData = sortMovie([...currentMovieData], 'date');
    }
    updateMoviePage(sortedByDateMovieData);
});

// Sorting by rating functionality

sortByRatingBtnTag.addEventListener('click', () => {
    if (isSortedByRating) {
        isSortedByRating = false;
        isSortedByDate = false;
        updateMoviePage(currentMovieData);
        return;
    }
    isSortedByRating = true;
    isSortedByDate = false;
    if (!sortedByRatingMovieData) {
        sortedByRatingMovieData = sortMovie([...currentMovieData], 'rating');
    }
    updateMoviePage(sortedByRatingMovieData);
});

// Search button functionality

searchBtn.addEventListener("click", async (evt) => {
    evt.preventDefault();
    const searchedMovieName = searchBox.value.trim();
    if (!searchedMovieName) {
        return;
    }
    const url = `https://api.themoviedb.org/3/search/movie?query=${searchedMovieName}&api_key=${API_KEY}`;
    const response = await fetch(url);
    const movieData = await response.json();
    currentMovieData = movieData.results;
    updateMoviePage(currentMovieData);
});

//Fav button functionality

favbtn.addEventListener("click", () => {
    let localMovieStorage = JSON.parse(localStorage.getItem("favMovieList"));
    if (!localMovieStorage) return;
    let movies = Object.values(localMovieStorage);
    updateMoviePage(movies);
});

allbtn.addEventListener("click", () => {
    updateMoviePage(currentMovieData);
});

                                                                       // Function 1

async function getPaginatedMovieData(page = 1) {                      
    resetPageValues();
    movieListingTag.innerHTML = "loading";
    const response = await fetch(`${API}&page=${page}`);
    const movieData = await response.json();
    currentMovieData = movieData.results;
    updateMoviePage(movieData.results);
    totalPage = movieData.total_pages;
}
                                                                    // Function 2
function resetPageValues() {
    sortedByDateMovieData = "";
    sortedByRatingMovieData = "";
    isSortedByDate = false;
    isSortedByRating = false;
}

function sortMovie(MovieArr, sortBy) {
    let sortingKey = "";
    if (sortBy === "date") {
        sortingKey = "release_date";
        MovieArr.sort((movObjA, movObjB) => {
            movObjA.epochTime = new Date(movObjA[sortingKey]);
            movObjB.epochTime = new Date(movObjB[sortingKey]);
            return movObjA.epochTime - movObjB.epochTime;
        });
        return MovieArr;
    } else if (sortBy === "rating") {
        sortingKey = "vote_average";
    }
    MovieArr.sort((movObjA, movObjB) => {
        return movObjA[sortingKey] - movObjB[sortingKey];
    });
    return MovieArr;
}

                                                                          // Function 3

function updateMoviePage(movieArray) {
    let updatedMovieListing = '';
    for (let { id, title, vote_count, vote_average, poster_path } of movieArray) {
        let isFavourite = localStorage.getItem("favMovieList") && JSON.parse(localStorage.getItem("favMovieList"))[id];
        const movieURL = `${IMAGE_URL}/${poster_path}`;
        const movieCard = `<div class="movieCard">
                                <img src="${movieURL}" alt="">
                                <div>
                                    <div class="movieDetails">
                                        <h5>${title}</h5>
                                        <div>
                                            <span>Votes: ${vote_count}</span>
                                            <span>Rating: ${vote_average}</span>
                                        </div>
                                    </div>
                                    <i class="fa-heart ${isFavourite ? 'fa-solid' : 'fa-regular'}" data-movie-id="${id}" data-is-favourite="${isFavourite ? 'true' : 'false'}"></i>
                                </div>
                            </div>`;
        updatedMovieListing += movieCard;
    }
    movieListingTag.innerHTML = updatedMovieListing;
    const favIFrameTags = document.querySelectorAll(".fa-heart");
    for (let favIco of favIFrameTags) {
        favIco.addEventListener("click", addToFavListHandler);
    }
}

function addToFavListHandler(e) {
    
    const movieId = e.target.dataset.movieId;
    const isFavourite = e.target.dataset.isFavourite === "true";
    let favMovieList = JSON.parse(localStorage.getItem("favMovieList")) || {};
    if (isFavourite) {
        delete favMovieList[movieId];
        e.target.dataset.isFavourite = false;
        e.target.classList.remove("fa-solid");
        e.target.classList.add("fa-regular");
    } else {
        favMovieList[movieId] = currentMovieData.find(movie => movie.id == movieId);
        e.target.dataset.isFavourite = true;
        e.target.classList.remove("fa-regular");
        e.target.classList.add("fa-solid");
    }
    localStorage.setItem("favMovieList", JSON.stringify(favMovieList));
}

getPaginatedMovieData(currentPage);
