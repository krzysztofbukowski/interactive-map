import * as React from 'react';
import utils from '../../utils/utils';
import { ITopology } from './Map';
import { MapDataLevels, AREA_CODE_NATIONAL } from './MapDataLevels';

interface IMapLoaderProps {
  dataSourceHost: string;
  areaCode: string;
  onDataLoaded: (topology: ITopology, areaId: string) => void;
  onDataLoadCompleted: (areaCode: string) => void;
  delay: number
}

class MapDataLoader extends React.Component<IMapLoaderProps> {

  private cache: any = {};

  public render() {
    return null;
  }

  public componentDidMount() {
    this.tryToFetchNationalData()
      .then(this.tryToFetchCountyData)
      .then(this.tryToFetchMunicipalityData)
      .then(this.tryToFetchDistrictData)
      .catch((e) => {
        this.props.onDataLoadCompleted(this.props.areaCode)
      });
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
      console.log(`Fetching data for ${url}`);

      if (this.cache.hasOwnProperty(url)) {
        const topology = this.cache[url];
        this.props.onDataLoaded(topology, areaCode || '');
        return Promise.resolve(topology);
      }

      return fetch(url)
        .then((response: any) => response.json())
        .then((jsonResponse: any) => {
          if (jsonResponse.hasOwnProperty('msg')) {
            throw new Error(jsonResponse.msg);
          }

          return jsonResponse;
        })
        .then((topology: ITopology) => {
            this.props.onDataLoaded(topology, areaCode || '');
        }).catch(e => {
          console.info(`Failed loading data from ${url}`);
          console.log(e);
          // this.props.onDataLoadCompleted();
        });
    })
  }

  private tryToFetchNationalData = (): Promise<string | undefined> => {
    return this.fetchDataForArea(AREA_CODE_NATIONAL, MapDataLevels.NATIONAL, this.props.delay);
  };

  private tryToFetchCountyData = () => {
    return this.resolveCountyCode()
      .then((countyCode: string) => {
        return this.fetchDataForArea(countyCode, MapDataLevels.COUNTY, this.props.delay);
      });
  };

  private tryToFetchMunicipalityData = () => {
    return this.resolveMunicipalityCode()
      .then((municipalityCode: string) => {
        return this.fetchDataForArea(municipalityCode, MapDataLevels.MUNICIPALITY, this.props.delay);
      })
  }

  private tryToFetchDistrictData = () => {
    return this.resolveDistrictCode()
      .then((districtCode: string) => {
        return this.fetchDataForArea(districtCode, MapDataLevels.DISTRICT, this.props.delay)
          .then((e: any) => {
            return Promise.reject(undefined);
          });
      });
  }

  private resolveCountyCode = (): Promise<string> => {
    const promise = new Promise<string>((resolve, reject) => {
      if (this.props.areaCode === AREA_CODE_NATIONAL) {
        return reject(undefined);
      }

      const lanCode = this.props.areaCode.substr(0, 2);

      if (lanCode.length === 2) {
        return resolve(lanCode);
      } else {
        return reject(undefined);
      }
    });

    return promise;
  }

  private resolveMunicipalityCode = (): Promise<string> => {
    const promise = new Promise<string>((resolve, reject) => {
      const municipalityCode = this.props.areaCode.substr(0, 4);

      if (municipalityCode.length === 4) {
        resolve(municipalityCode)
      } else {
        reject(undefined);
      }
    });

    return promise;
  }

  private resolveDistrictCode = (): Promise<string> => {
    const promise = new Promise<string>((resolve, reject) => {
      if (this.props.areaCode.length > 6) {
        const municipalityCode = this.props.areaCode.substr(0, 4);
        const url = `${this.props.dataSourceHost}/api/election/val2014R/${municipalityCode}`;
        fetch(url)
          .then((response: Response) => response.json())
          .then((data: any) => {
            const foundResult = Object.keys(data.kommun_kretsar).find((key: any) => {
              const result = Object.keys(data.kommun_kretsar[key].valdistrikt)
                .find(districtCode => districtCode === this.props.areaCode);

              return result !== undefined;
            });

            if (foundResult !== undefined) {
              resolve(foundResult);
            }

            reject(undefined);
          });
      } else {

        const districtCode = this.props.areaCode.substr(0, 6);

        if (districtCode.length === 6) {
          resolve(districtCode)
        } else {
          reject(undefined);
        }
      }
    });

    return promise;
  }

  private resolveLevel(areaCode: string) {
    if (areaCode === AREA_CODE_NATIONAL) {
      return MapDataLevels.NATIONAL;
    }

    switch (areaCode.length) {
      case 2:
        return MapDataLevels.COUNTY;
      case 4:
        return MapDataLevels.MUNICIPALITY;
      case 6:
        return MapDataLevels.DISTRICT;
      default:
        return MapDataLevels.DISTRICT;
    }
  }
}

export default MapDataLoader;
