import * as d3 from 'd3';
import { Feature } from 'geojson';
import * as React from 'react';
import * as topojson from 'topojson';
import { GeometryCollection, Topology } from 'topojson-specification';

import './Map.css';
import { Selection } from 'd3-selection';

interface IMapProps {
  width: string;
  height: string;
  dataSourceUrl: string;
  onAreaSelected?: (area: IMapArea) => void
  area?: 'national' | string
}

interface IMapState {
  currentArea: string;
}

interface IValnattFeatureProperties {
  LAN: string,
  LAN_NAMN: string,
  ID: string
}

export interface IMapArea {
  area: string;
  name: string;
  id: string;
}

interface IMapFeature extends Feature {
  properties: IValnattFeatureProperties
}

const SWEDEN_CENTER: [number, number] = [15.1, 61.6];

class Map extends React.Component<IMapProps, IMapState> {
  private ref: SVGSVGElement;
  private centeredFeature: IMapFeature | undefined;
  private swedenProjectionPath: d3.GeoPath;
  private svg: Selection<SVGSVGElement, any, any, undefined>;
  private g: any;
  private features: {} = {};

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
          className='map'
        />
      </div>
    );
  }

  public componentDidMount() {
    const svg = d3.select(this.ref);
    this.svg = svg;

    const swedenProjection = d3.geoConicEqualArea()
      .scale(this.ref.height.animVal.value * 3.5)
      .center(SWEDEN_CENTER)
      .translate([this.ref.width.animVal.value / 2, this.ref.height.animVal.value / 2]);
    this.swedenProjectionPath = d3.geoPath(swedenProjection);

    svg.append('rect')
      .attr('class', 'map__background')
      .attr('width', this.ref.width.animVal.value)
      .attr('height', this.ref.height.animVal.value)
      .on('click', this.reset);

    this.g = svg.append('g');

    fetch(this.props.dataSourceUrl)
      .then((response: any) => response.json())
      .then((topology: Topology) => {
        this.renderMap(svg, topology);
      })
      .then(() => {
        if (this.props.area && this.props.area !== 'national') {
          const feature = this.features[this.props.area];
          this.handleAreaSelection(feature);
        }
      });
  }

  private renderMap = (svg: Selection<SVGSVGElement, any, any, undefined>, mapData: Topology, key: string = 'national_100') => {
    const featureCollection = topojson.feature(mapData, mapData.objects[key] as GeometryCollection);

    featureCollection.features.map((feature: IMapFeature) => {
      this.features[`${feature.properties.ID}`] = feature;
    });


    this.svg.select(`#lan_10`).style('display', 'none');

    this.g.append('g')
      .selectAll('path')
      .data(featureCollection.features)
      .enter().append('path')
      .attr('class', 'map__path')
      .attr('d', (item: any) => this.swedenProjectionPath(item))
      .attr('id', (item: IMapFeature) => `lan_${item.properties.ID}`);

    const paths = svg.selectAll('path');

    const that = this;
    paths.on('click', function (feature: IMapFeature) {
      paths.each(function (f: IMapFeature) {
        (this as Element).classList.remove('map__path--active');
        (this as Element).classList.add('map__path--inactive');
      });

      (this as Element).classList.remove('map__path--inactive');
      (this as Element).classList.add('map__path--active');

      that.handleAreaSelection(feature);
    }).on('mouseover', function (feature: IMapFeature) {
      (this as Element).classList.add('map__path--hovered');
    }).on('mouseout', function (feature: IMapFeature) {
      (this as Element).classList.remove('map__path--hovered');
    });
  };


  private zoomToFeature = (feature: IMapFeature) => {
    let x: number;
    let y: number;
    let dx: number;
    let dy: number;
    let translate: [number, number];
    let scale;
    const width = this.ref.width.animVal.value;
    const height = this.ref.height.animVal.value;

    if (feature && this.centeredFeature !== feature) {
      this.centeredFeature = feature;
    } else {
      this.centeredFeature = undefined;
    }

    const bounds = this.swedenProjectionPath.bounds(feature);

    dx = bounds[1][0] - bounds[0][0];
    dy = bounds[1][1] - bounds[0][1];
    x = (bounds[0][0] + bounds[1][0]) / 2;
    y = (bounds[0][1] + bounds[1][1]) / 2;
    scale = .9 / Math.max(dx / width, dy / height);
    translate = [width / 2 - scale * x, height / 2 - scale * y];

    this.g.transition()
      .duration(750)
      .style('stroke-width', `${4 / scale}px`)
      .attr('transform', 'translate(' + translate + ')scale(' + scale + ')');
  };

  private reset = (a: any) => {
    this.centeredFeature = undefined;

    this.g.transition()
      .duration(750)
      .style('stroke-width', '2px')
      .attr('transform', '');

    const svg = d3.select(this.ref);
    const paths = svg.selectAll('path');

    paths.each(function () {
      (this as Element).classList.remove('map__path--active', 'map__path--inactive');
    });

    if (this.props.onAreaSelected) {
      this.props.onAreaSelected({
        area: 'national',
        id: 'national',
        name: 'national'
      });
    }
  };

  private handleAreaSelection = (feature: IMapFeature) => {
    fetch('/lan_10.json')
      .then((response: Response) => response.json())
      .then((topology: Topology) => {
        this.renderMap(this.svg, topology, 'lan_10_10');
        this.zoomToFeature(feature);
      });

    if (this.props.onAreaSelected) {
      this.props.onAreaSelected({
        area: feature.properties.LAN,
        id: feature.properties.ID,
        name: feature.properties.LAN_NAMN
      });
    }
  };
}

export default Map;
