export const mapMovie = movie => ({
  title: movie.Title,
  year: movie.Year,
  link: `https://www.imdb.com/title/${movie.imdbID}/`,
  poster: movie.Poster
});
