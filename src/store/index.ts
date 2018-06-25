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
      stringToValue: (area: string)  => `${area}`,
      valueToString: (area: string) => area ? `${area}` : 'national'
    },
  },
  replaceState: true,
  store
});

export default store;
