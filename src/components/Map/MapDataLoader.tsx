import * as React from 'react';
import { Topology } from 'topojson-specification';

interface IMapLoaderProps {
  dataSourceHost: string;
  areaCode: string;
  onDataLoaded: (topology: Topology, key: string) => void
}


class MapDataLoader extends React.Component<IMapLoaderProps, {}> {

  constructor(props: IMapLoaderProps) {
    super(props);
  }

  public render() {
    return null;
  }

  public componentDidMount() {
    this.fetchData(`${this.props.dataSourceHost}/api/topojson/val2014/national/100`);
  }

  public componentDidUpdate() {
    if (this.props.areaCode === 'national') {
      return;
    }

    const level = this.resolveLevel(this.props.areaCode);
    this.fetchData(`${this.props.dataSourceHost}/api/topojson/val2014/${this.props.areaCode}/${level}`);
  }

  private fetchData(url: string) {
    fetch(url)
      .then((response: any) => response.json())
      .then((topology: Topology) => {
        if (topology.objects) {
          const key = Object.keys(topology.objects)[0];
          this.props.onDataLoaded(topology, key);
        }
      }).catch(e => {
        console.info(`Failed loading data from ${url}`);
        console.error(e);
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
