export interface IParamsState {
  area?: string
}

export interface IValnattState {
  params: IParamsState
}

const initialState: IValnattState = {
  params: {}
};

export default initialState;
