import { clearNode } from '../helpers/clearContainer.js';
import { getDeclension } from '../helpers/getDeclension.js';
import { debounce } from '../helpers/debounce.js';
import { throttle } from '../helpers/throttle.js';

const dMovies = getDeclension('фильм', 'фильма', 'фильмов');

// eslint-disable-next-line
export const createView = () => {
  const mainElement = document.querySelector('.main');

  // Search list
  const resultsContainer = document.querySelector('.results__cards');
  const resultsHeading = document.querySelector('.results__heading');

  // Tags list
  const searchTags = document.querySelector('.search__tags-container');

  // Form
  const searchContainer = document.querySelector('.search');
  const searchForm = document.querySelector('.search__form');
  const searchInput = document.querySelector('.search__input');
  const searchClearButton = document.querySelector('.search__clear-button');

  const pinSearchWhenScrolled = () => {
    const onScroll = e => {
      const origOffsetY = searchContainer.offsetTop;

      window.scrollY >= origOffsetY ?
        mainElement.classList.add('scroll') :
        mainElement.classList.remove('scroll');
    };

    document.addEventListener('scroll', onScroll);
  };

  // Renderers
  const renderList = results => {
    if (!results.length) {
      clearNode(resultsContainer);
      return;
    }
    const list = document.createDocumentFragment();

    results.forEach(movieData => {
      const movie = document.createElement('movie-card');

      movie.poster = movieData.poster;
      movie.title = movieData.title;
      movie.year = movieData.year;
      movie.link = movieData.link;

      list.appendChild(movie);
    });

    clearNode(resultsContainer);
    resultsContainer.appendChild(list);
    mainElement.classList.add('search_live');
  };

  const renderSearchList = terms => {
    const list = document.createDocumentFragment();

    terms.forEach(movie => {
      const tag = document.createElement('a');

      tag.classList.add('search__tag');
      tag.href = `/?search=${movie}`;
      tag.textContent = movie;
      tag.dataset.movie = movie;

      list.appendChild(tag);
    });

    clearNode(searchTags);
    searchTags.appendChild(list);
  };

  const renderCount = count => {
    resultsHeading.textContent = `Нашли ${count} ${dMovies(count)}`;
  };

  const renderError = error => {
    resultsHeading.textContent = error;
    mainElement.classList.add('search_live');
  };

  const renderIsSearching = (isSearching, lastLoadedPage) => {
    if (lastLoadedPage !== null) {
      mainElement.classList.remove('search_loading');
      return;
    }
    if (isSearching) {
      mainElement.classList.remove('search_live');
      mainElement.classList.add('search_loading');
    } else {
      mainElement.classList.remove('search_loading');
    }
  };

  const renderSearchStaredAtLeastOnce = isSearchStaredAtLeastOnce => {
    if (isSearchStaredAtLeastOnce) {
      mainElement.classList.add('search_active');
    } else {
      mainElement.classList.remove('search_active');
    }
    pinSearchWhenScrolled();
    mainElement.classList.add('content-loaded');
  };

  // Events
  const onSearchSubmit = _listener => {
    const listener = event => {
      event.preventDefault();
      _listener(searchInput.value);
      searchInput.value = '';
    };

    searchForm.addEventListener('submit', listener);
    return () => searchForm.removeEventListener('submit', listener);
  };

  const onSearchInputClear = _listener => {
    const listener = event => {
      event.preventDefault();

      searchInput.value = '';
      searchInput.focus();
      mainElement.classList.remove('search_live');
    };

    searchClearButton.addEventListener('click', listener);
    return () => searchClearButton.removeEventListener('click', listener);
  };

  const onTagClick = _listener => {
    const delay = 250;

    let prevent = false;

    let timer = null;

    const listener = event => {
      event.preventDefault();

      if (event.target.classList.contains('search__tag')) {
        prevent = false;
        timer = setTimeout(() => {
          if (event.detail === 1 && !prevent) {
            searchInput.value = '';
            _listener(event.target.dataset.movie, 'search');
          }
        }, delay);

        if (event.detail === 2) {
          clearTimeout(timer);
          prevent = true;
          _listener(event.target.dataset.movie, 'remove');
        }
      }
    };

    searchTags.addEventListener('click', listener);
    return () => searchTags.removeEventListener('click', listener);
  };

  const onSearchInputFocused = _listener => {
    const listener = event => {
      mainElement.classList.add('search_active');
    };

    searchInput.addEventListener('focus', listener);
    return () => searchInput.removeEventListener('focus', listener);
  };

  const onNextPage = _listener => {
    const listener = event => {
      const height = document.body.offsetHeight;

      const screenHeight = window.innerHeight;

      const scrolled = window.scrollY;

      const threshold = height - screenHeight / 4;

      const position = scrolled + screenHeight;

      if (position >= threshold && mainElement.classList.contains('search_live')) {
        _listener();
      }
    };

    const throttledListener = throttle(listener, 250);

    (() => {
      window.addEventListener('scroll', throttledListener);
      window.addEventListener('resize', throttledListener);
    })();

    return () => {
      window.removeEventListener('scroll', throttledListener);
      window.removeEventListener('resize', throttledListener);
    };
  };

  const onSearchInput = _listener => {
    const listener = event => {
      if (searchInput.value !== '') {
        _listener(searchInput.value);
      } else {
        mainElement.classList.remove('search_live');
      }
    };
    const debouncedListener = debounce(listener, 250);

    searchInput.addEventListener('input', debouncedListener);
    return () => searchInput.removeEventListener('input', debouncedListener);
  };

  return {
    renderList,
    renderCount,
    renderError,
    renderSearchList,
    renderIsSearching,
    renderSearchStaredAtLeastOnce,
    onSearchSubmit,
    onSearchInputFocused,
    onSearchInputClear,
    onTagClick,
    onNextPage,
    onSearchInput
  };
};
