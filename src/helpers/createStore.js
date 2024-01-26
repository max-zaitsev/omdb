export const createStore = (initialState, actions) => {
  const store = localStorage.getItem('store');

  let state = (store !== null) ? JSON.parse(store) : initialState;

  let listeners = [];
  const bindedActions = {};

  const subscribe = listener => {
    listeners.push(listener);
    return () => (listeners = listeners.filter(l => l !== listener));
  };

  const setState = update => {
    state = { ...state, ...update };
    listeners.forEach(listener => listener(state));
    localStorage.setItem('store', JSON.stringify(state));
    return state;
  };

  const getState = () => state;

  const storeApi = {
    subscribe,
    setState,
    getState
  };

  if (typeof actions === 'function') {
    actions = actions(storeApi);
  }

  for (const action in actions) {
    if (
      Object.prototype.hasOwnProperty.call(actions, action)
      && typeof actions[action] === 'function'
    ) {
      bindedActions[action] = (...args) => {
        const result = actions[action](state, ...args);

        if (typeof result.then === 'function') {
          return result.then(setState);
        }

        return setState(result);
      };
    }
  }

  return { ...storeApi, ...bindedActions };
};
