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

declare type TopoFeature =
  FeatureCollection
  & Feature<Point, GeoJsonProperties>;

class App extends React.Component<IAppProps, {}> {
  private ref: SVGSVGElement;


  constructor(props: IAppProps) {
    super(props);

    console.log(props);
  }

  public componentDidMount() {
    const svg = d3.select(this.ref);
    const path = d3.geoPath();

    fetch('/sweden.json')
      .then((response: any) => response.json())
      .then((us: any) => {
        console.log(us);
        const feature = topojson.feature(us, us.objects.national_250) as TopoFeature;

        svg.append('g')
          .attr('class', 'counties')
          .selectAll('path')
          .data(feature.features)
          .enter().append('path')
          .attr('d', path);

        // the following block is new, adding JS events
        let hoverEnabled = false;
        svg.on('mousedown', (x: any) => hoverEnabled = true)
          .on('mouseup', (x: any) => hoverEnabled = false);

        const paths = svg.selectAll('.counties path');

        paths.on('mouseover', function () {
          (this as Element).classList.add('hovered');
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
        <svg
          className="container"
          ref={(ref: SVGSVGElement) => this.ref = ref}
          width={this.props.width}
          height={this.props.height}
        />
        <button type="button" className="button"
                onClick={this.handleClick}>Reset
        </button>
      </div>
    );
  }

  private handleClick = () => {
    const svg = d3.select(this.ref);
    svg.selectAll('path').each(function() {
      (this as Element).classList.remove('hovered');
    });
  };
}

export default App;
