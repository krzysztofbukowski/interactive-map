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
  onAreaClicked?: (area: IMapArea) => void,
  onAreaChanged?: (area: IMapArea) => void,
  onReset?: () => void,
  area: 'national' | string
  data?: {
    topology?: ITopology,
    level: string
  }
}

export interface ITopology extends Topology {
  key: string;
}

export interface IMapArea {
  area: string;
  name: string;
  id: string;
}

class Map extends React.Component<IMapProps, {}> {
  private ref: SVGSVGElement;
  private centeredFeature: IMapFeature | undefined;
  private centeredElement: Element | null;
  private projectionPath: d3.GeoPath;
  private svg: Selection<SVGSVGElement, any, any, undefined>;
  private g: any;
  private cancelHover: boolean;
  private nationalData: any;

  constructor(props: IMapProps) {
    super(props);

    this.cancelHover = false;
  }

  public render() {
    return (
      <>
        <svg
          ref={(ref: SVGSVGElement) => this.ref = ref}
          style={{
            height: this.props.height,
            padding: '50px',
            width: this.props.width
          }}
          className='map'
        />
        <MapDataLoader
          dataSourceHost={this.props.dataSourceHost}
          areaCode={this.props.area || 'national'}
          onDataLoaded={this.onDataLoaded}
          onDataLoadCompleted={this.onDataLoadCompleted}
          delay={750}
        />
      </>
    );
  }

  public componentDidMount() {
    const svg = d3.select(this.ref);
    this.svg = svg;

    svg.append('rect')
      .attr('class', 'map__background')
      .style('width','100%')
      .style('height', '100%')
      .on('click', this.reset);

    this.g = svg.append('g');
  }

  private onDataLoaded = (topology: ITopology, areaId: string) => {
    console.info(`Topology loaded for area ${areaId}`, topology);

    const featureCollection = topojson.feature(topology, topology.objects[topology.key] as GeometryCollection)

    if (areaId === 'national') {
      this.nationalData = featureCollection;
    }

    this.bindEvents(
      this.renderMap(featureCollection, topology.key)
    );

    this.centeredElement = this.findElementByAreaCode(areaId);
    this.centeredFeature = this.findFeatureByAreaCode(areaId);

    if (this.centeredFeature !== undefined) {
      this.cancelHover = true;
      this.zoomToFeature(this.centeredFeature);
      if (this.props.onAreaChanged) {
        this.props.onAreaChanged(mapFeatureToArea(this.centeredFeature));
      }
    }

    if (this.centeredElement !== null) {
      this.hide(this.centeredElement);
    }
  }

  private onDataLoadCompleted = (areaCode: string) => {
    this.centeredElement = this.findElementByAreaCode(areaCode);
    this.centeredFeature = this.findFeatureByAreaCode(areaCode);

    if (this.centeredFeature !== undefined) {
      if (this.props.onAreaChanged) {
        this.props.onAreaChanged(mapFeatureToArea(this.centeredFeature));
      }
    }
  }

  private findElementByAreaCode(areaCode: string): Element | null {
    return document.querySelector(`#area_${areaCode}`);
  }

  private findFeatureByAreaCode(areaCode: string): IMapFeature {
    return d3.select(`#area_${areaCode}`).data()[0] as IMapFeature;
  }

  private renderMap = (featureCollection: any, key: string) => {
    const swedenProjection = d3.geoConicEqualArea()
      .fitSize([this.ref.width.animVal.value, this.ref.height.animVal.value], this.nationalData)

    this.projectionPath = d3.geoPath(swedenProjection);

    const g = this.g.append('g');
    g.attr('class', `${key} map__g`);

    return g.selectAll('path')
      .data(featureCollection.features)
      .enter()
      .append('path')
      .attr('class', 'map__path')
      .attr('d', (item: IMapFeature) => this.projectionPath(item))
      .attr('id', (item: IMapFeature) => `area_${item.properties.ID}`);
  };

  private bindEvents(paths: Selection<BaseType, any, any, undefined>) {
    const that = this;

    paths.on('click', (feature: IMapFeature) => {
      if (this.props.onAreaClicked) {
        this.props.onAreaClicked(mapFeatureToArea(feature));
      }
    }).on('mouseenter', function () {
      if (!that.cancelHover) {
        (this as Element).classList.add('map__path--hovered');
      }
    }).on('mouseleave', function () {
      (this as Element).classList.remove('map__path--hovered');
    });
  }

  private reset = (a: any) => {
    if (this.centeredFeature === undefined) {
      return;
    }
    this.centeredFeature = undefined;
    this.centeredElement = null;

    this.g.transition()
      .duration(this.props.animationLength)
      .style('stroke-width', '2px')
      .attr('transform', '')
      .on('end', () => {
        this.cancelHover = false;
      });

    const svg = this.svg;

    svg.selectAll('[class*=national]').remove();
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

  private zoomToFeature = (feature: IMapFeature) => {
    const width = this.ref.width.animVal.value;
    const height = this.ref.height.animVal.value;

    const bounds = this.projectionPath.bounds(feature);
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
