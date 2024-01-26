export const createViewModel = model => {
  // eslint-disable-next-line
  let state = {};

  let resultsListener = null;

  let countListener = null;

  let errorListener = null;

  let searchesListener = null;

  let isSearchingListener = null;

  let searchStaredAtLeastOnceListener = null;

  const update = nextState => {
    resultsListener && resultsListener(nextState.results);
    countListener && countListener(nextState.count);
    searchesListener && searchesListener(nextState.searches);
    isSearchingListener && isSearchingListener(nextState.isSearching, nextState.lastLoadedPage);
    searchStaredAtLeastOnceListener && searchStaredAtLeastOnceListener(nextState.searchStartedAtLeastOnce);

    if (nextState.error) {
      console.error(nextState.error);

      let errorHeading = '';

      switch (nextState.error) {
        case 'Movie not found!':
          errorHeading = 'Мы не поняли о чем речь ¯\\_(ツ)_/¯';
          break;

        case 'Too many results.':
          errorHeading = 'Слишком много результатов.\nПопробуйте уточнить запрос.';
          break;

        default:
          errorHeading = 'Случилась ошибка. Проверьте консоль.';
      }
      errorListener && errorListener(errorHeading);
    }

    state = nextState;
  };

  return {
    bindError: listener => (errorListener = listener),
    bindCount: listener => (countListener = listener),
    bindResults: listener => (resultsListener = listener),
    bindSearches: listener => (searchesListener = listener),
    bindIsSearching: listener => (isSearchingListener = listener),
    bindSearchStaredAtLeastOnce: listener => (searchStaredAtLeastOnceListener = listener),
    handleSearchSubmit: searchTerm => model.search(searchTerm),
    handleTagClick: (searchTerm, action) => {
      if (action === 'search') {
        return model.search(searchTerm);
      }
      model.removeTag(searchTerm);
    },
    handleSearchInput: searchTerm => model.searchLive(searchTerm),
    handleTagRemove: searchTerm => model.removeTag(searchTerm),
    handleNextPage: () => model.searchNextPage(),
    init: () => {
      update(model.getState());
      model.subscribe(update);
    }
  };
};
