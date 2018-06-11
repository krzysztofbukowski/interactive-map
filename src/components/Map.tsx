import * as d3 from 'd3';
import { Feature } from 'geojson';
import * as React from 'react';
import * as topojson from 'topojson';
import { GeometryCollection, Topology } from 'topojson-specification';

interface IMapProps {
  width: string;
  height: string;
  dataSourceUrl: string;
  onAreaSelected?: (area: IValnattArea) => void
}

interface IMapState {
  currentArea: string;
}

interface IValnattFeatureProperties {
  LAN: string,
  LAN_NAMN: string,
  ID: string
}

export interface IValnattArea {
 area: string;
 name: string;
 id: string;
}

interface IValnattFeature extends Feature {
  properties: IValnattFeatureProperties
}

const SWEDEN_CENTER: [number, number] = [15.1, 61.6];

class Map extends React.Component<IMapProps, IMapState> {
  private ref: SVGSVGElement;

  constructor(props: IMapProps) {
    super(props);

    this.state = {
      currentArea: ''
    };
  }

  public render() {
    return (
      <div>
        <svg
          ref={(ref: SVGSVGElement) => this.ref = ref}
          width={this.props.width}
          height={this.props.height}
        />
      </div>
    );
  }

  public componentDidMount() {
    fetch(this.props.dataSourceUrl)
      .then((response: any) => response.json())
      .then(this.renderMap);
  }

  private renderMap = (mapData: Topology) => {
    const svg = d3.select(this.ref);
    const swedenProjection = d3.geoConicEqualArea()
      .scale(this.ref.height.animVal.value * 3.5)
      .center(SWEDEN_CENTER)
      .translate([this.ref.width.animVal.value / 2, this.ref.height.animVal.value / 2]);
    const swedenProjectionPath = d3.geoPath(swedenProjection);
    const featureCollection = topojson.feature(mapData, mapData.objects.national_250 as GeometryCollection);

    svg.append('g')
      .attr('class', 'counties')
      .selectAll('path')
      .data(featureCollection.features)
      .enter().append('path')
      .attr('d', (item: any) => {
        return swedenProjectionPath(item);
      });

    const paths = svg.selectAll('.counties path');

    paths.on('mousedown', (feature: IValnattFeature) => {
      this.handleAreaSelection(feature);
    }).on('mouseover', function (feature: IValnattFeature) {
      (this as Element).classList.add('selectedArea');
    }).on('mouseout', function (feature: IValnattFeature) {
      (this as Element).classList.remove('selectedArea');
    });
  };

  private handleAreaSelection = (path: IValnattFeature) => {
    if (this.props.onAreaSelected) {
      this.props.onAreaSelected({
        area: path.properties.LAN,
        id: path.properties.ID,
        name: path.properties.LAN_NAMN
      });
    }
  };
}

export default Map;
