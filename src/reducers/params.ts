import { AnyAction } from 'redux';
import initialState, { IParamsState } from '../store/state';

export const params = (state: IParamsState = initialState.params, action: AnyAction): IParamsState => {
  switch (action.type) {
    case 'SET_AREA':
      return {
        ...state,
        area: action.payload
      }
    default:
      return state;
  }
};
