import { createStore } from '../helpers/createStore.js';
import { mapMovie } from '../helpers/mapMovie.js';

function cachingDecorator(store, beforegettingFromCache, func) {
  const cache = new Map();

  return async function(currentState, searchTerm) {
    if (cache.has(searchTerm.toLowerCase())) {
      beforegettingFromCache.call(store, currentState, searchTerm);
      return cache.get(searchTerm.toLowerCase());
    }
    const result = await func.call(this, currentState, searchTerm);

    if (result === null) {
      return null;
    }
    cache.set(searchTerm.toLowerCase(), result);
    return result;
  };
}

function setStateToSearch(currentState, searchTerm) {
  if (currentState.isSearching) {
    currentState.controller.abort();
  }
  const controller = new AbortController();

  this.setState({
    count: 0,
    results: [],
    error: false,
    searches: [searchTerm].concat(
      currentState.searches.filter(term => term !== searchTerm)
    ),
    isSearching: true,
    searchStartedAtLeastOnce: true,
    searchTerm,
    pagesRanOut: false,
    lastLoadedPage: null,
    controller
  });
}

function setStateToLiveSearch(currentState, searchTerm) {
  if (currentState.isSearching) {
    currentState.controller.abort();
  }
  const controller = new AbortController();

  this.setState({
    count: 0,
    results: [],
    error: false,
    isSearching: true,
    searchStartedAtLeastOnce: true,
    searchTerm,
    pagesRanOut: false,
    lastLoadedPage: null,
    controller
  });
}

function setStateToSearchNextPage(currentState) {
  this.setState({
    isSearching: true,
    searchStartedAtLeastOnce: true
  });
}

const controller = new AbortController();

export const createModel = () => createStore(
  {
    count: 0,
    results: [],
    error: false,
    searches: [
      'Star Wars',
      'Kung Fury',
      'Back to the Future',
      'Matrix',
      'Terminator'
    ],
    isSearching: false,
    searchStartedAtLeastOnce: false,
    lastLoadedPage: null,
    searchTerm: null,
    pagesRanOut: false,
    controller
  },
  store => ({
    search: cachingDecorator(
      store,
      setStateToSearch,
      async(currentState, searchTerm) => {
        if (currentState.isSearching) {
          currentState.controller.abort();
        }
        setStateToSearch.call(store, currentState, searchTerm);

        try {
          const data = await fetch(
            `http://www.omdbapi.com/?apikey=cdac148&s=${searchTerm}`,
            {
              signal: currentState.controller.signal
            }
          ).then(r => r.json());

          return data.Response === 'True' ?
            {
              isSearching: false,
              count: data.totalResults,
              results: data.Search.map(mapMovie),
              lastLoadedPage: 1,
              searchTerm
            } :
            {
              error: data.Error,
              isSearching: false,
              searchTerm
            };
        } catch (error) {
          return { error, isSearching: false };
        }
      }
    ),
    removeTag: (currentState, searchTerm) => ({
      searches: currentState.searches.filter(term => term !== searchTerm)
    }),
    searchNextPage: async currentState => {
      if (currentState.lastLoadedPage === null) {
        return;
      }

      if (currentState.isSearching) {
        return;
      }

      if (currentState.pagesRanOut) {
        return;
      }

      setStateToSearchNextPage.call(store, currentState);
      try {
        const data = await fetch(
          `http://www.omdbapi.com/?apikey=cdac148&s=${
            currentState.searchTerm
          }&page=${currentState.lastLoadedPage + 1}`,
          {
            signal: controller.signal
          }
        ).then(r => r.json());

        return data.Response === 'True' ?
          {
            results: currentState.results.concat(data.Search.map(mapMovie)),
            lastLoadedPage: currentState.lastLoadedPage + 1,
            isSearching: false
          } :
          {
            isSearching: false,
            pagesRanOut: true
          };
      } catch (error) {
        return { error, isSearching: false };
      }
    },
    searchLive: cachingDecorator(
      store,
      setStateToLiveSearch,
      async(currentState, searchTerm) => {
        setStateToLiveSearch.call(store, currentState, searchTerm);

        try {
          const data = await fetch(
            `http://www.omdbapi.com/?apikey=cdac148&s=${searchTerm}`,
            {
              signal: currentState.controller.signal
            }
          ).then(r => r.json());

          return data.Response === 'True' ?
            {
              isSearching: false,
              count: data.totalResults,
              results: data.Search.map(mapMovie),
              lastLoadedPage: 1,
              searchTerm
            } :
            {
              error: data.Error,
              isSearching: false,
              searchTerm
            };
        } catch (error) {
          if (error.name === 'AbortError') {
            return null;
          }
          return { error, isSearching: false };
        }
      }
    )
  })
);
