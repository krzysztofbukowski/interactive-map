import { applyMiddleware, createStore } from 'redux';
import ReduxQuerySync from 'redux-query-sync';
import thunk from 'redux-thunk';

import valnattReducers from '../reducers';
import initialState, { IValnattState } from './state';

const store = createStore(
  valnattReducers,
  initialState,
  applyMiddleware(thunk)
);

ReduxQuerySync({
  initialTruth: 'location',
  params: {
    area: {
      action: (value: string) => ({type: 'SET_AREA', payload: value}),
      defaultValue: 'national',
      selector: (state: IValnattState) => state.params.area,
      stringToValue: (s: string) => s,
      valueToString: (value: any) => `${value}`
    },
  },
  replaceState: true,
  store
});

export default store;
