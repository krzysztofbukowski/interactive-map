import { IMapArea } from '../components/Map';

export interface IParamsState {
  area?: IMapArea
}

export interface IValnattState {
  params: IParamsState
}

const initialState: IValnattState = {
  params: {
    area: {
      area: 'national',
      id: '',
      name: 'national'
    }
  }
};

export default initialState;
