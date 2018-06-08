import * as d3 from 'd3';
import { Feature, FeatureCollection, GeoJsonProperties } from 'geojson';
import * as React from 'react';
import * as topojson from 'topojson';
import './App.css';

import { Point } from 'topojson-specification';

interface IAppProps {
  width: number;
  height: number;
}

interface IAppState {
  currentArea: string;
}


interface IValnattTopoFeature {
  features?: any,
  properties: {
    LAN: string,
    LAN_NAMN: string,
    ID: string
  }
}


declare type TopoFeature =
  FeatureCollection
  & Feature<Point, GeoJsonProperties>;

class App extends React.Component<IAppProps, IAppState> {
  private ref: SVGSVGElement;


  constructor(props: IAppProps) {
    super(props);


    this.state = {
      currentArea: 'n/a'
    };
  }

  public componentDidMount() {
    const svg = d3.select(this.ref);
    const path = d3.geoPath();
    // const swedenCenter = ;


    const swedenProjection = d3.geoConicEqualArea()
      .scale(this.props.width * 3.5)
      .center([15.1, 61.6])
      .translate([this.props.width / 2, this.props.height / 2]);

    const swedenProjectionPath = d3.geoPath(swedenProjection);


    fetch('/sweden.json')
      .then((response: any) => response.json())
      .then((us: any) => {
        console.log(us);
        const feature = topojson.feature(us, us.objects.national_250) as IValnattTopoFeature;

        svg.append('g')
          .attr('class', 'counties')
          .selectAll('path')
          .data(feature.features)
          .enter().append('path')
          .attr('d', (item: TopoFeature) => {
            return swedenProjectionPath(item);
          });

        const paths = svg.selectAll('.counties path');

        paths.on('mousedown', (clickedPath: IValnattTopoFeature) => {
          this.setState({
            currentArea: clickedPath.properties.LAN_NAMN
          })
        }).on('mouseover', function(item: IValnattTopoFeature) {
          (this as Element).classList.add('selectedArea');
        }).on('mouseout', function(item: IValnattTopoFeature) {
          (this as Element).classList.remove('selectedArea');
        });

        const pathString: string = path(
          topojson.mesh(us, us.objects.national_250, (a: any, b: any) => a !== b)
        ) as string;

        svg.append('path')
          .attr('class', 'county-borders')
          .attr('d', pathString);
      });
  }

  public render() {
    return (
      <div>
        <h1>Sweden areas</h1>
        <h2>{this.state.currentArea}</h2>
        <svg
          className="container"
          ref={(ref: SVGSVGElement) => this.ref = ref}
          width={this.props.width}
          height={this.props.height}
        />
      </div>
    );
  }
}

export default App;
