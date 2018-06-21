import * as React from 'react';
import utils from '../../utils/utils';
import { ITopology } from './Map';

interface IMapLoaderProps {
  dataSourceHost: string;
  areaCode: string;
  onDataLoaded: (topology: ITopology, areaId: string) => void;
  onDataLoadCompleted: () => void;
  delay: number
}

class MapDataLoader extends React.Component<IMapLoaderProps> {

  public render() {
    return null;
  }

  public componentDidMount() {
    this.fetchDataForArea('national', 100)
      .then(this.nationalDataFetched.bind(this))
      .then(this.tryToFetchLanData.bind(this))
      .then(this.tryToFetchKommunData.bind(this))
      .then(this.tryToFetchValkretsData.bind(this))
      .catch(this.props.onDataLoadCompleted);
  }

  public componentDidUpdate(prevProps: IMapLoaderProps) {
    if (prevProps.areaCode === this.props.areaCode) {
      return;
    }

    const level = this.resolveLevel(this.props.areaCode);
    this.fetchDataForArea(this.props.areaCode, level);
  }

  private fetchDataForArea(areaCode: string, level: number): Promise<any> {
    const url = `${this.props.dataSourceHost}/api/topojson/val2014/${areaCode}/${level}`;
    return fetch(url)
      .then((response: any) => response.json())
      .then((topology: ITopology) => {
        if (topology.objects) {
          this.props.onDataLoaded(topology, areaCode);
        }

        return topology;
      }).catch(e => {
        console.info(`Failed loading data from ${url}`);
        console.error(e);
      });
  }

  private nationalDataFetched(topolog: ITopology): Promise<string | undefined> {
    if (this.props.areaCode === 'national') {
      return Promise.reject(undefined);
    }
    return Promise.resolve(this.props.areaCode.substr(0, 2));
  }

  private tryToFetchLanData(lanCode: string) {
    return utils.delay(this.props.delay)
      .then(() => {
        return this.fetchDataForArea(lanCode, 10)
          .then((data: ITopology) => {
            const kommunCode = this.props.areaCode.substr(0, 4);

            if (kommunCode.length === 4) {
              return Promise.resolve(kommunCode)
            } else {
              return Promise.reject(undefined);
            }
          });
      })
      .catch(() => {
        return Promise.reject(undefined);
      });
  };

  private tryToFetchKommunData(kommunCode: string): Promise<string | undefined> {
    return utils.delay(this.props.delay)
      .then(() => {
        return this.fetchDataForArea(kommunCode, 1)
        .then((data: ITopology) => {
          const valkretsCode = this.props.areaCode.substr(0, 6);

          if (valkretsCode.length === 6) {
            return Promise.resolve(valkretsCode)
          } else {
            return Promise.reject(undefined);
          }
          return Promise.reject(undefined);
        })
      })
      .catch(() => {
        return Promise.reject(undefined);
      });
  }

  private tryToFetchValkretsData(kommunCode: string): Promise<string | undefined> {
    return utils.delay(this.props.delay)
      .then(() => {
        return this.fetchDataForArea(kommunCode, 1)
        .then((data: ITopology) => {
          /**
           * Handle loading data for valdistrikt
           */
          return Promise.reject(undefined);
        })
      })
      .catch(() => {
        return Promise.reject(undefined);
      });
  }  

  private resolveLevel(feature: string) {
    switch (feature.length) {
      case 2:
        return 10;
      case 4:
        return 1;
      case 6:
        return 1;
      default:
        return 1;
    }
  }
}

export default MapDataLoader;
