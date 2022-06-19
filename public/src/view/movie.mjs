import { MovieService } from "../service/movie-service.mjs";
import { Movie } from "../model/movie-model.mjs";

// const openMovieDialogButton = document.querySelector('[data-open-movie-handler]');
const viewMovieDialog = document.getElementById('view-movie-dialog');
const editMovieDialog = document.getElementById('edit-movie-dialog');

/**
 * 
 * @param text 
 * @returns the text string without spaces
 */
function stringWithoutSpaces(text) {
    return text.replace(/ /g,'_');
}

/**
 * This function adds a movie to the view using the template in the HTML. 
 * @param movieName The name of the movie (incl spaces)
 * @param movie the movie data to be added
 */
function addMovieNode(movieName, movie) {

    /**
     * This function shortens the description to a given max length, 
     * where the last word of the description is still a whole word and not cut halveway.
     * After the description has been shortend the function will add a string '...' to the result
     * and will return the result.
     * Example
     *   shortDescription('Skeptical professor Phillip Goodman embarks on a trip to the terrifying after being given a file with details of three unexplained cases of apparitions.', 50) 
     * will return:
     *   'Skeptical professor Phillip Goodman embarks on a ...'
     * 
     * @param description <String>
     * @param maxLength <Number>
     * @return <String>
     */
    function shortDescription(description, maxLength) {
        // feel free to replace the content of this function, to make it work
        let shorterDescription = description;
        return shorterDescription;
    }

    function getFullYear(date) {
        const DATE = new Date(date);
        return DATE.getFullYear();
    }

    // cloning the template
    const MOVIE_TEMPLATE_CLONE = document.importNode(document.getElementById("movie-template").content, true);
    const MOVIENAME_WITHOUT_WHITESPACE = stringWithoutSpaces(movieName); // The ID attribute of an HTML element isn't supposed to contain white spaces.

    // applying the data
    const MOVIEARTICLE = MOVIE_TEMPLATE_CLONE.querySelector('#moviename');
    MOVIEARTICLE.setAttribute('id', MOVIENAME_WITHOUT_WHITESPACE);
    MOVIEARTICLE.addEventListener('click', event => openViewMovieDiaglog(movieName, movie));
    MOVIE_TEMPLATE_CLONE.querySelector('.movie-title').textContent = `${movieName} (${getFullYear(movie.date)})`;
    MOVIE_TEMPLATE_CLONE.querySelector('.movie-image').setAttribute('src', movie.image);
    const MAXDESCRIPTIONLENGTH = 50;
    MOVIE_TEMPLATE_CLONE.querySelector('.movie-description').textContent = shortDescription(movie.description, MAXDESCRIPTIONLENGTH);

    // create a fragment for the clone and add it to the movies list
    const MOVIE_FRAGMENT = document.createDocumentFragment();
    MOVIE_FRAGMENT.append(MOVIE_TEMPLATE_CLONE);

    const MOVIES_NODE = document.querySelector('.movies');
    MOVIES_NODE.append(MOVIE_FRAGMENT);
}

function removeMovieNode(movieName) {
    const MOVIENAME_WITHOUT_WHITESPACE = stringWithoutSpaces(movieName); // The ID attribute of an HTML element isn't supposed to contain white spaces.
    document.querySelector(`#${MOVIENAME_WITHOUT_WHITESPACE}`).remove();
}


/**
 * Function that opens the dialog to add a movie.
 */
function openViewMovieDiaglog(movieName, movie) {

    /**
     * this function used by the eventlistener of the edit movie button. 
     * The eventlistener requires a name function, otherwise we will not be able to remove the event listener (see closeViewMovieDialog).
     * @param event 
     */
    function closeViewOpenEditDialog(event) {
        closeViewMovieDialog();
        openEditMovieDiaglog(movieName, movie);
    }

    function closeViewMovieDialog() {
        viewMovieDialog.close();

        // removing the eventlistener for the edit button. If this will not be done the eventlistener will remain and the next time 
        // this view dialog is opened a second eventlistener will be created causing a DOM exception once it is clicked.
        document.querySelector('#view-movie-dialog .movie-edit-button').removeEventListener('click', closeViewOpenEditDialog, {once: true});
    }
    
    /**
     * Formats the given date see https://en.wikipedia.org/wiki/Date_format_by_country#Table_coding 
     * for the coding of the return formaat.
     * @param date :Date
     * @returns :String in the format "dd mmmm YYYY"
     */
    function formatDate(date) {
        const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const DATE = new Date(date);
        return `${DATE.getDate()} ${MONTHS[DATE.getMonth()]} ${DATE.getFullYear()}`;
    }

    // Fill the dialog content before it is shown
    document.querySelector('#view-movie-dialog .movie-title').textContent=movieName;
    document.querySelector('#view-movie-dialog .movie-image').setAttribute('src', movie.image);
    document.querySelector('#view-movie-dialog .movie-date').textContent = formatDate(movie.date);
    document.querySelector('#view-movie-dialog .movie-description').textContent=movie.description;
    document.querySelector('#view-movie-dialog .movie-rating').textContent = movie.rating;

    // remove the error class
    document.querySelector("#movie-input").classList.remove('error');

    // cancel button event
    document.querySelector('#view-movie-dialog .dialog-close-button').addEventListener('click', event => {
        closeViewMovieDialog();
    }, {once: true});

    // edit button event
    document.querySelector('#view-movie-dialog .movie-edit-button').addEventListener('click', closeViewOpenEditDialog, {once: true});

        // show the dialog window
    viewMovieDialog.showModal();
}


function openEditMovieDiaglog(movieName, movie) {

    function closeEditMovieDialog() {
        editMovieDialog.close();
    }
    
    /**
     * This function handels the "add movie" and "annuleren" button from the add movie form,
     * by submitting the data to the service (in case the add movie button was clicked).
     * But it handels also the errors in case a movie with this titel already exists.
     * Once a movie has been added or the form has been canceled (annuleren) the function
     * will close the dialog.
     * 
     * @param event (from the submit event itself)
     */
    function movieFormButtonHandler(event) {
        event.preventDefault();
        if (event.submitter.value === "submit") {
            const FORM_DATA = new FormData(document.querySelector('[data-edit-movie-form]'));
            
            // extract the key
            let MOVIE_NAME = FORM_DATA.get('movie-key');
            FORM_DATA.delete('movie-key');

            // convert the rating
            FORM_DATA.set('rating', Number(FORM_DATA.get('rating')));

            MOVIESERVICE.updateMovie(MOVIE_NAME, FORM_DATA)
            .then (response => {
                removeMovieNode(MOVIE_NAME);
                if (MOVIE_NAME !== FORM_DATA.get('movie')) {
                    MOVIE_NAME = FORM_DATA.get('movie');
                }
                // Update movie_name key
                MOVIESERVICE.getMovie(MOVIE_NAME)
                .then (movie => {
                     addMovieNode(MOVIE_NAME, movie);
                    movieFormButton.reset();
                    closeEditMovieDialog();
                });
            });
        } else {
            // submitter who triggerd this function was the cancel button.
            closeEditMovieDialog();
        }
    }

    // Fill the dialog content before it is shown
    document.querySelector('#edit-movie-dialog #movie-input').value = movieName;
    document.querySelector('#edit-movie-dialog #movie-key').value = movieName;

    // the file input can due to security reasons not be set programmatically.
    // Therefore we have to check if the value has been set at submit and if not we will use the old value.

    const START_INDEX = 0; // first character of the date part
    const END_INDEX = 10; // Last character of the date part, just before the time part.
    document.querySelector('#edit-movie-dialog #date-input').value = new Date(movie.date).toISOString().substring(START_INDEX, END_INDEX);

    document.querySelector('#edit-movie-dialog #description-input').textContent = movie.description;

    document.querySelector(`#edit-movie-dialog #rating-${movie.rating}`).checked = true;

    const movieFormButton = document.querySelector('[data-edit-movie-form]');
    movieFormButton.addEventListener('submit', (event => movieFormButtonHandler(event)), {once: true});

    editMovieDialog.showModal();
}


/**
 * @param - 
 * @return -
 * Goal is to initialize the movie database on the frontend by getting all movies from
 * the service and then add each movie to the view.
 */
function initMovies() {
    MOVIESERVICE.getMovies()
    .then (movies => {
        movies.forEach((movie, movieName) => {
            addMovieNode(movieName, movie);
        });
    });
}

// ===================== Hoofdprogramma ===============================================

// ------ Event Handlers --------------------------------------------------------------


const MOVIESERVICE = new MovieService();
initMovies();