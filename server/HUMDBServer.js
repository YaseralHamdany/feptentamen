const EXPRESS = require('express');
const BODYPARSER = require('body-parser');
const MULTER = require('multer');
const APP = EXPRESS();
const PORT = 3000;

const ROOTDIR = 'public';
const REL_IMAGE_DIR = '/images/';
const ABS_IMAGE_DIR = './public'+REL_IMAGE_DIR;

APP.use(EXPRESS.static(ROOTDIR));
APP.use(BODYPARSER.urlencoded({ extended: true, limit:'4MB' }));
APP.use(BODYPARSER.json({limit:'4MB'}));

const STORAGE = MULTER.diskStorage({
    destination: function(req, file, callback) {
        callback(null, ABS_IMAGE_DIR);
    },
    filename: function(req, file, callback) {
        callback(null, file.originalname);
    }
});

const UPLOAD = MULTER({
    storage: STORAGE
});

let movies = new Map();

function createDummyData() {
    // ---------------------------------------------------------------------
    // Create some dummy data
    movies.set("Ghost Stories", {
        "date": new Date('2017-01-01'),
        "image": "/images/ghost-stories.jpg",
        "description": "Skeptical professor Phillip Goodman embarks on a trip to the terrifying after being given a file with details of three unexplained cases of apparitions.",
        "rating": 2
    });
    movies.set("Jurassic World", {
        "date": new Date('2015-11-15'),
        "image": "/images/jurassic-world.jpg",
        "description": "A new theme park, built on the original site of Jurassic Park, creates a genetically modified hybrid dinosaur, the Indominus Rex, which escapes containment and goes on a killing spree.",
        "rating": 3
    });
    movies.set("Logan", {
        "date": new Date('2017-01-22'),
        "image": "/images/logan.jpg",
        "description": "In a future where mutants are nearly extinct, an elderly and weary Logan leads a quiet life. But when Laura, a mutant child pursued by scientists, comes to him for help, he must get her to safety.",
        "rating": 3
    });
    movies.set("A Nightmare on Elm Street", {
        "date": new Date('1984-05-06'),
        "image": "/images/nightmare-on-elm-street.jpg",
        "description": "The monstrous spirit of a slain child murderer seeks revenge by invading the dreams of teenagers whose parents were responsible for his untimely death.",
        "rating": 4
    });
    movies.set("Texas Chain Saw Massacre", {
        "date": new Date('1974-01-01'),
        "image": "/images/texas-chainsaw-massacre.jpg",
        "description": "Two siblings and three of their friends en route to visit their grandfather's grave in Texas end up falling victim to a family of cannibalistic psychopaths and must survive the terrors of Leatherface and his family.",
        "rating": 5
    });
    movies.set("Wizard of Oz", {
        "date": new Date('1939-12-24'),
        "image": "/images/wizard-of-oz.jpg",
        "description": "Dorothy Gale is swept away from a farm in Kansas to a magical land of Oz in a tornado and embarks on a quest with her new friends to see the Wizard who can help her return home to Kansas and help her friends as well.",
        "rating": 3
    });
    // end of dummy data
}

// ---------------------------------------------------------------------
// ---------------- REST API--------------------------------------------
const STATUS_OK = 200;
const STATUS_NOT_FOUND = 404;
const STATUS_CONFLICT = 409;

APP.get('/v1/movie', (req, res) => {
    console.log('GET /v1/movie');
    res.json(Array.from(movies));
});

APP.delete('/v1/movie', (req, res) => {
    console.log('DELETE /v1/movie');
    movies.clear();
    res.sendStatus(STATUS_OK);
});

APP.get('/v1/movie/:key', (req, res) => {
    const MOVIENAME = req.params.key;
    console.log(`GET /v1/movie/${MOVIENAME}`);
    if (movies.has(MOVIENAME)) {
        res.json(movies.get(MOVIENAME));
    } else {
        res.sendStatus(STATUS_NOT_FOUND);
    }
});

APP.post('/v1/movie/:key', UPLOAD.single('image'), (req, res) => {
    const MOVIENAME = req.params.key;
    const MOVIE = req.body;

    console.log(`POST /v1/movie/${MOVIENAME}`);

    if (movies.has(MOVIENAME)) {
        console.log('ERROR: Conflict - Title already exists');
        res.sendStatus(STATUS_CONFLICT);
    } else {
        MOVIE.image = REL_IMAGE_DIR+req.file.originalname;
        movies.set(MOVIENAME, MOVIE);
        res.sendStatus(STATUS_OK);
    }
});


APP.put('/v1/movie/:key', UPLOAD.single('image'), (req, res) => {
    let MOVIENAME = req.params.key;
    const MOVIE = req.body;
    let status = STATUS_OK; // Everything is OK

    console.log(`PUT /v1/movie/${MOVIENAME}`);
    console.dir(MOVIE);

    if (movies.has(MOVIENAME)) {
        // add code to check if the moviename (new name should be part of the body) has been changed
        // if it has been changed we have to check whether the new key is available or not (error 409)

        // console.log('File: '+req.file.originalname);

        if (req.file == undefined) {
            // no new image provided, using the old one.
            MOVIE.image = movies.get(MOVIENAME).image;
        } else {
            MOVIE.image = REL_IMAGE_DIR+req.file.originalname;
        }
        console.log(`MOVIE.image = ${MOVIE.image}`);

        if (MOVIENAME !== MOVIE.movie) {
            // using a new key value
            if (!movies.has(MOVIE.movie)) {
                // new key not in use by another movie
                movies.delete(MOVIENAME);
                MOVIENAME=MOVIE.movie;
            } else {
                // new key in use by another movie
                status = STATUS_CONFLICT;
            }
        }

        if (status === STATUS_OK) {
            movies.set(MOVIENAME, MOVIE);
        }

    } else {
        status = STATUS_NOT_FOUND; // Not found
    }
    res.sendStatus(status);
});

APP.delete('/v1/movie/:key', (req, res) => {
    const MOVIENAME = req.params.key;

    console.log(`DELETE /v1/movie/${MOVIENAME}`);

    if (movies.has(MOVIENAME)) {
        movies.delete(MOVIENAME);
        res.sendStatus(STATUS_OK);
    } else {
        res.sendStatus(STATUS_NOT_FOUND);
    }
});

APP.get('/v1/reset', (req, res) => {
    console.log(`RESET DUMMY DATA`);

    movies = new Map();
    createDummyData();

    res.json(Array.from(movies));
});

createDummyData();
APP.listen(PORT, () => console.log(`Server is running on port ${PORT}`));