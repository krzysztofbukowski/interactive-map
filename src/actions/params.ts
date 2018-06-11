import { IMapArea } from '../components/Map';

export enum PARAMS_ACTIONS {
  SET_AREA = 'SET_AREA'
}


export const setArea = (value: IMapArea) => {
  return {
    payload: value,
    type: PARAMS_ACTIONS.SET_AREA
  }
};
