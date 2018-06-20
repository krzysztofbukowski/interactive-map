import * as d3 from 'd3';
import * as React from 'react';
import * as topojson from 'topojson';
import { GeometryCollection, Topology } from 'topojson-specification';

import './Map.css';
import { BaseType, Selection } from 'd3-selection';
import MapDataLoader from './MapDataLoader';
import { IMapFeature } from './MapFeature';

export interface IMapProps {
  width: string;
  height: string;
  animationLength: number;
  dataSourceHost: string;
  onAreaSelected?: (area: IMapArea) => void,
  onReset?: () => void,
  area?: 'national' | string
  data?: {
    topology?: Topology,
    level: string
  }
}

export interface IMapArea {
  area: string;
  name: string;
  id: string;
}

const SWEDEN_CENTER: [number, number] = [15.1, 61.6];

class Map extends React.Component<IMapProps, {}> {
  private ref: SVGSVGElement;
  private centeredFeature: IMapFeature | undefined;
  private centeredElement: Element | undefined;
  private swedenProjectionPath: d3.GeoPath;
  private svg: Selection<SVGSVGElement, any, any, undefined>;
  private g: any;
  private cancelHover: boolean;

  constructor(props: IMapProps) {
    super(props);

    this.cancelHover = false;
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
        <MapDataLoader
          dataSourceHost={this.props.dataSourceHost}
          areaCode={this.props.area || 'national'}
          onDataLoaded={this.onDataLoaded}
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
  }

  public componentDidUpdate() {
    if (this.props.data !== undefined &&
      this.props.data.topology !== undefined) {

      this.onDataLoaded(
        this.props.data.topology,
        this.props.data.level
      );
    }
  }

  private onDataLoaded = (t: Topology, key: string) => {
    console.info(`Data loaded for key ${key}`, t);

    this.bindEvents(
      this.renderMap(t, key)
    );

    if (this.centeredFeature !== undefined) {
      this.cancelHover = true;
      this.zoomToFeature(this.centeredFeature);
    }

    if (this.centeredElement !== undefined) {
      this.hide(this.centeredElement);
    }
  }

  private renderMap = (mapData: Topology, key: string = 'national_100') => {
    const featureCollection = topojson.feature(mapData, mapData.objects[key] as GeometryCollection);

    const g = this.g.append('g');
    g.attr('class', `${key} map__g`);

    return g.selectAll('path')
      .data(featureCollection.features)
      .enter()
      .append('path')
      .attr('class', 'map__path')
      .attr('d', (item: IMapFeature) => this.swedenProjectionPath(item))
      .attr('id', (item: IMapFeature) => `area_${item.properties.ID}`);
  };

  private bindEvents(paths: Selection<BaseType, any, any, undefined>) {
    const that = this;

    paths.on('click', function (feature: IMapFeature) {
      that.handleAreaSelection(feature, (this as Element));
    }).on('mouseover', function () {
      if (!that.cancelHover) {
        (this as Element).classList.add('map__path--hovered');
      }
    }).on('mouseout', function () {
        (this as Element).classList.remove('map__path--hovered');
    });
  }

  private reset = (a: any) => {
    this.centeredFeature = undefined;
    this.centeredElement = undefined;

    this.g.transition()
      .duration(this.props.animationLength)
      .style('stroke-width', '2px')
      .attr('transform', '')
      .on('end', () => {
        this.cancelHover = false;
      });

    const svg = this.svg;

    svg.selectAll('[class*=lan]').remove();
    svg.selectAll('[class*=kommun]').remove();

    svg
      .selectAll('path')
      .each(function () {
        const element = (this as Element);

        element.classList.remove('map__path--hidden');

        // without setting timeout the animation won't work
        setTimeout(() => {
          element.classList.remove('map__path--inactive', 'map__path--active');
        }, 0);
      });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleAreaSelection = (feature: IMapFeature, element: Element) => {
    if (this.props.onAreaSelected) {
      this.props.onAreaSelected(mapFeatureToArea(feature));
    }

    if (feature && this.centeredFeature !== feature) {
      this.centeredFeature = feature;
      this.centeredElement = element;
    } else {
      this.centeredFeature = undefined;
      this.centeredElement = undefined;
    }
  };

  private zoomToFeature = (feature: IMapFeature) => {
    const width = this.ref.width.animVal.value;
    const height = this.ref.height.animVal.value;

    const bounds = this.swedenProjectionPath.bounds(feature);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = .9 / Math.max(dx / width, dy / height);
    const translate = [width / 2 - scale * x, height / 2 - scale * y];

    this.g.transition()
      .duration(this.props.animationLength)
      .style('stroke-width', `${4 / scale}px`)
      .attr('transform', 'translate(' + translate + ')scale(' + scale + ')')
      .on('end', () => {
        this.cancelHover = false;
      });
  };

  private hide(element: Element) {
    if (element.parentElement) {
      const children = element.parentElement.children;

      for (let i = 0; i < children.length; i++) {
        const child = children.item(i);

        child.addEventListener(
          'transitionend',
          (event: TransitionEvent) => {
            if (event.propertyName === 'opacity') {
              child.classList.add('map__path--hidden');
            }
          },
          {
            once: true
          });

        child.classList.add('map__path--inactive');
      }
    }
  }
}

function mapFeatureToArea(feature: IMapFeature): IMapArea {
  const area: IMapArea = {
    area: 'national',
    id: feature.properties.ID,
    name: 'national'
  };

  if (feature.properties.LAN) {
    area.area = feature.properties.LAN;
    area.name = feature.properties.LAN_NAMN;
  }

  if (feature.properties.KOM) {
    area.area = feature.properties.KOM;
    area.name = feature.properties.NAMN_KOM;
  }

  if (feature.properties.VD) {
    area.area = feature.properties.VD;
    area.name = feature.properties.VD_NAMN;
  }

  if (feature.properties.KVK) {
    area.area = feature.properties.KVK;
    area.name = feature.properties.KVK_NAMN;
  }

  return area;
}

export default Map;
