import * as React from 'react';
import utils from '../../utils/utils';
import { ITopology } from './Map';

enum MapDataLevels {
  NATIONAL = 100,
  COUNTY = 10,
  MUNICIPALITY = 1,
  DISTRICT = 1
}

interface IMapLoaderProps {
  dataSourceHost: string;
  areaCode: string;
  onDataLoaded: (topology: ITopology, areaId: string) => void;
  onDataLoadCompleted: () => void;
  delay: number
}

const AREA_CODE_NATIONAL = 'national';

class MapDataLoader extends React.Component<IMapLoaderProps> {

  public render() {
    return null;
  }

  public componentDidMount() {
    this.tryToFetchNationalData()
      .then(this.tryToFetchCountyData)
      .then(this.tryToFetchMunicipalityData)
      .then(this.tryToFetchValkretsData)
      .catch(this.props.onDataLoadCompleted);
  }

  public componentDidUpdate(prevProps: IMapLoaderProps) {
    if (prevProps.areaCode === this.props.areaCode) {
      return;
    }

    const level = this.resolveLevel(this.props.areaCode);
    this.fetchDataForArea(this.props.areaCode, level, 0);
  }

  private fetchDataForArea = (areaCode: string, level: number, delay: number): Promise<any> => {
    return utils.delay(delay).then(() => {
      const url = `${this.props.dataSourceHost}/api/topojson/val2014/${areaCode}/${level}`;

      return fetch(url)
        .then((response: any) => response.json())
        .then((topology: ITopology) => {
          if (topology.objects) {
            this.props.onDataLoaded(topology, areaCode || '');
          }

          return topology;
        }).catch(e => {
          console.info(`Failed loading data from ${url}`);
          console.error(e);
        });
    })
  }

  private tryToFetchNationalData = (): Promise<string | undefined> => {
    return this.fetchDataForArea(AREA_CODE_NATIONAL, MapDataLevels.NATIONAL, this.props.delay)
      .then((data: ITopology) => {
        if (this.props.areaCode === AREA_CODE_NATIONAL) {
          return Promise.reject(undefined);
        }

        const lanCode = this.props.areaCode.substr(0, 2);

        if (lanCode.length === 2) {
          return Promise.resolve(lanCode)
        } else {
          return Promise.reject(undefined);
        }
      });
  };

  private tryToFetchCountyData = (countyCode: string): Promise<string | undefined> => {
    return this.fetchDataForArea(countyCode, MapDataLevels.COUNTY, this.props.delay)
      .then((data: ITopology) => {
        const municipalityCode = this.props.areaCode.substr(0, 4);

        if (municipalityCode.length === 4) {
          return Promise.resolve(municipalityCode)
        } else {
          return Promise.reject(undefined);
        }
      });
  };

  private tryToFetchMunicipalityData = (municipalityCode: string): Promise<string | undefined> => {
    return this.fetchDataForArea(municipalityCode, MapDataLevels.MUNICIPALITY, this.props.delay)
      .then((data: ITopology) => {
        const districtCode = this.props.areaCode.substr(0, 6);

        if (districtCode.length === 6) {
          return Promise.resolve(districtCode)
        } else {
          return Promise.reject(undefined);
        }
      });
  }

  private tryToFetchValkretsData = (districCode: string): Promise<string | undefined> => {
    return this.fetchDataForArea(districCode, MapDataLevels.DISTRICT, this.props.delay)
      .then((data: ITopology) => {
        /**
         * Handle loading data for valdistrikt
         */
        return Promise.reject(undefined);
      })
  }

  private resolveLevel(feature: string) {
    switch (feature.length) {
      case 2:
        return MapDataLevels.COUNTY;
      case 4:
        return MapDataLevels.MUNICIPALITY;
      case 6:
        return MapDataLevels.DISTRICT;
      default:
        return MapDataLevels.NATIONAL;
    }
  }
}

export default MapDataLoader;
