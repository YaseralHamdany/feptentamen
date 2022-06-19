import { Movie } from './../model/movie-model.mjs';

export class MovieService {

    /**
     * @param -
     * @returns -
     * This constructor creates a local attribute of the type Map that will 
     * hold all the movies in our database.
     */
    constructor() {
        this.movies = new Map();
    }

    /**
     * @param -
     * @returns :Promise <Map <Movie> >
     * This method will fetch all movies from the server and stores them in a
     * the local attribute `movies`. An attribute that will be returned once the 
     * promise is fulfilled.
     */
    getMovies() {
        return fetch('/v1/movie')
        .then (response => response.json())
        .then (response => {
            this.movies = new Map();
            const KEY_INDEX = 0;
            const DATA_INDEX = 1;
            const LIST = response.map(item => {
                const MOVIENAME = item[KEY_INDEX];
                const MOVIE = item[DATA_INDEX];
                let newMovie = new Movie();
                newMovie = Object.assign(newMovie, MOVIE);
                this.movies.set(MOVIENAME, newMovie);
            });
            return this.movies;
        });
    }

    /**
     * @param movieName :String
     * @returns :Movie
     * This method fetches a single movie with the title given from the server.
     */
    getMovie(movieName) {
        return fetch(`/v1/movie/${movieName}`)
        .then (response => response.json())
        .then (response => {
            let movie = new Movie();
            movie = Object.assign(movie, response);
            return movie;
        })
        .catch (error => console.log(`ERROR at getMovie ${error}`));
    }

     /**
     * Updates the movie with the name given movieName at the server and the local movies attribute and
     * returns true when no error occured. In case that an error occurrs the error should be caught and given to the caller.
     * Errors that could occur are a response status of 404 in case the movie with the given movieName could 
     * not be found or 409 in case the movieName has changed to a movieName that already existed in the database.
     * @param movieName <String>
     * @param movie <Movie>
     * @returns :Promise <Boolean>
     */

    updateMovie(movieName, movie) {
        return null;
    }
}