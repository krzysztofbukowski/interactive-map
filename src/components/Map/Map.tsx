import * as d3 from 'd3';
import { Feature } from 'geojson';
import * as React from 'react';
import * as topojson from 'topojson';
import { GeometryCollection, Topology } from 'topojson-specification';

import './Map.css';
import { BaseType, Selection } from 'd3-selection';

export interface IMapProps {
  width: string;
  height: string;
  animationLength: number;
  dataSourceHost: string;
  onAreaSelected?: (area: IMapArea) => void,
  onReset?: () => void,
  area?: 'national' | string
}

interface ILanFeatureProperties {
  LAN: string,
  LAN_NAMN: string,
  ID: string
}

interface IKommunFeatureProperties {
  KOM: string,
  NAMN_KOM: string,
  ID: string
}

interface IVDFeatureProperties {
  VD: string,
  VD_NAMN: string,
  ID: string
}

interface IKVKFeatureProperties {
  KVK: string,
  KVK_NAMN: string,
  ID: string
}

declare type MapFeature =
  ILanFeatureProperties
  & IKommunFeatureProperties
  & IVDFeatureProperties
  & IKVKFeatureProperties;

export interface IMapArea {
  area: string;
  name: string;
  id: string;
}

interface IMapFeature extends Feature {
  properties: MapFeature
}

const SWEDEN_CENTER: [number, number] = [15.1, 61.6];

class Map extends React.Component<IMapProps, {}> {
  private ref: SVGSVGElement;
  private centeredFeature: IMapFeature | undefined;
  private swedenProjectionPath: d3.GeoPath;
  private svg: Selection<SVGSVGElement, any, any, undefined>;
  private g: any;

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

    fetch(`${this.props.dataSourceHost}/api/topojson/val2014/national/100`)
      .then((response: any) => response.json())
      .then((topology: Topology) => {
        this.bindEvents(
          this.renderMap(topology)
        );
      }).catch(e => console.error(e));
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
      .attr('d', (item: any) => this.swedenProjectionPath(item))
      .attr('id', (item: IMapFeature) => `area_${item.properties.ID}`);
  };

  private bindEvents(paths: Selection<BaseType, any, any, undefined>) {
    const handleAreaSelection = this.handleAreaSelection;

    paths.on('click', function (feature: IMapFeature) {
      handleAreaSelection(feature, (this as Element));
    }).on('mouseover', function () {
      (this as Element).classList.add('map__path--hovered');
    }).on('mouseout', function () {
      (this as Element).classList.remove('map__path--hovered');
    });
  }

  private zoomToFeature = (feature: IMapFeature) => {
    const width = this.ref.width.animVal.value;
    const height = this.ref.height.animVal.value;

    if (feature && this.centeredFeature !== feature) {
      this.centeredFeature = feature;
    } else {
      this.centeredFeature = undefined;
    }

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
      .attr('transform', 'translate(' + translate + ')scale(' + scale + ')');
  };

  private reset = (a: any) => {
    this.centeredFeature = undefined;

    this.g.transition()
      .duration(this.props.animationLength)
      .style('stroke-width', '2px')
      .attr('transform', '');

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
    const level = this.resolveLevel(feature.properties.ID);
    const key = this.resolveKey(feature.properties, level);

    if (this.props.onAreaSelected) {
      this.props.onAreaSelected(this.mapFeatureToArea(feature));
    }

    fetch(`${this.props.dataSourceHost}/api/topojson/val2014/${feature.properties.ID}/${level}`)
      .then((response: Response) => response.json())
      .then((topology: Topology) => {

        const isError = (topology as object).hasOwnProperty('msg');

        if (!isError) {
          this.animate(element);
          this.bindEvents(
            this.renderMap(topology, key)
          );
          this.zoomToFeature(feature);
        } else {
          element.classList.remove('map__path--inactive');
          element.classList.add('map__path--active');
        }
      })
      .catch((reason: any) => {
        console.error(reason);
      });
  };

  private resolveKey(properties: MapFeature, level: number) {
    if (properties.LAN) {
      return `lan_${properties.ID}_${level}`;
    }

    if (properties.KOM) {
      return `kommun_${properties.ID}_${level}`;
    }

    if (properties.KVK) {
      return `kommunkrets_${properties.ID}_${level}`;
    }

    return `kommun_${properties.ID}_${level}`;
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


  private mapFeatureToArea(feature: IMapFeature): IMapArea {
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

  private animate(element: Element) {
    if (element.parentElement) {
      for (let i = 0; i < element.parentElement.children.length; i++) {
        const child = element.parentElement.children.item(i);

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

export default Map;
