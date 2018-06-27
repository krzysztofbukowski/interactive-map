export enum PARAMS_ACTIONS {
  SET_AREA = 'SET_AREA'
}

export const setArea = (value: string) => {
  return {
    payload: value,
    type: PARAMS_ACTIONS.SET_AREA
  }
};
