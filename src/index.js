// App
import { createModel } from './app/createModel.js';
import { createViewModel } from './app/createViewModel.js';
import { createView } from './app/createView.js';

// Components
import './components/currentYear.js';
import './components/movieCard.js';
import './components/loader.js';

const model = createModel();
const view = createView();
const viewModel = createViewModel(model);

// ViewModel -> View
viewModel.bindCount(view.renderCount);
viewModel.bindError(view.renderError);
viewModel.bindResults(view.renderList);
viewModel.bindSearches(view.renderSearchList);
viewModel.bindIsSearching(view.renderIsSearching);
viewModel.bindSearchStaredAtLeastOnce(view.renderSearchStaredAtLeastOnce);

// View -> ViewModel
view.onSearchSubmit(viewModel.handleSearchSubmit);
view.onTagClick(viewModel.handleTagClick);
view.onNextPage(viewModel.handleNextPage);
view.onSearchInput(viewModel.handleSearchInput);
view.onSearchInputFocused();
view.onSearchInputClear();

// Init app
viewModel.init();
