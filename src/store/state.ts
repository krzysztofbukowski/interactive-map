export interface IParamsState {
  area: string
}

export interface IValnattState {
  params: IParamsState
}

const initialState: IValnattState = {
  params: {
    area: 'national'
  }
};

export default initialState;
