import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const avarage = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "d28c09d2";

export default function App() {
  const [quary, setQuary] = useState("");
  const [movie, setMovie] = useState([]);
  const [watch, setwatch] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handleSelectedId(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleBack() {
    setSelectedId(null);
  }

  function AddWatchedMovie(movie) {
    setwatch((watched) => [...watched, movie]);
  }

  function handleDelete(id) {
    setwatch((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${quary}`,

            { signal: controller.signal }
          );

          if (!res.ok) throw new Error("connection failed");

          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found!");
          setMovie(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") setError(err.message);
        } finally {
          setIsLoading(false);

          if (quary.length < 3) {
            setMovie([]);
            setError("");
          }
          return;
        }
      }
      handleBack("");
      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [quary]
  );

  return (
    <div>
      <NavBar>
        <Logo />
        <SearchBar quary={quary} setQuary={setQuary} />
        <NumResult movie={movie} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <ListBox movie={movie} onSelected={handleSelectedId} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              handleBack={handleBack}
              OnAddwatched={AddWatchedMovie}
              watch={watch}
            />
          ) : (
            <>
              <WatchedSummary watch={watch} />
              <WatchedMovie watch={watch} ondelete={handleDelete} />
            </>
          )}
        </Box>
      </Main>
    </div>
  );
}

function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function NavBar({ children }) {
  return <div className="nav-bar">{children}</div>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>AdPopcornApp</h1>
    </div>
  );
}

function SearchBar({ quary, setQuary }) {
  return (
    <div>
      <input
        className="search"
        type="text"
        placeholder="Search movies"
        value={quary}
        onChange={(e) => setQuary(e.target.value)}
      />
    </div>
  );
}

function NumResult({ movie }) {
  return (
    <p className="num-results">
      Found <strong>{movie.length}</strong> result
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function ListBox({ movie, onSelected }) {
  return (
    <ul className="list list-movies">
      {movie.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelected={onSelected} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelected }) {
  return (
    <li onClick={() => onSelected(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? " -" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieDetails({ selectedId, handleBack, OnAddwatched, watch }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState();

  const IsWatch = watch.map((movie) => movie.imdbID).includes(selectedId);
  const WatchUserRating = watch.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    year,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const NewWatchedMovie = {
      imdbID: selectedId,
      year,
      Poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split("").at(0)),
      title,
      userRating,
    };

    OnAddwatched(NewWatchedMovie);
    handleBack();
  }

  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          handleBack();
        }
      }
      document.addEventListener("keydown", callback);

      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [handleBack]
  );

  useEffect(
    function () {
      async function getDetails() {
        setIsLoading(true);
        const res =
          await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}    
`);
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getDetails();
    },
    [selectedId]
  );
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie ${title}`;
      return function () {
        document.title = "MyPopcornApp";
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button
              className="btn-back"
              onClick={() => handleBack(movie.imdbID)}
            >
              &larr;
            </button>
            <img src={Poster} alt={`${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released}&bull;{runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} imdbRating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!IsWatch ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to List
                    </button>
                  )}
                </>
              ) : (
                <p>You Rated this movie {WatchUserRating}⭐</p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring{actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedMovie({ watch, ondelete }) {
  return (
    <ul className="list">
      {watch.map((movie) => (
        <WatchedList movie={movie} key={movie.imdbID} ondelete={ondelete} />
      ))}
    </ul>
  );
}
function WatchedList({ movie, ondelete }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.poster} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
      <button className="btn-delete" onClick={() => ondelete(movie.imdbID)}>
        X
      </button>
    </li>
  );
}

function WatchedSummary({ watch }) {
  const avruntime = avarage(watch.map((movie) => movie.runtime));
  const avimdbRating = avarage(watch.map((movie) => movie.imdbRating));
  const userRating = avarage(watch.map((movie) => movie.userRating));
  return (
    <div className="summary">
      <h2>MOVIES YOU HAVE WATCHED</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watch.length}</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avimdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{userRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avruntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}
