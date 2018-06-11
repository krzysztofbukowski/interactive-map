import * as React from 'react';
import Map, { IValnattArea } from '../components/Map';
import './DefaultVersionContainer.css';

interface IDefaultMapContainerState {
  currentArea: string;
}

class DefaultVersionContainer extends React.Component<{}, IDefaultMapContainerState> {

  constructor(props: {}) {
    super(props);

    this.state = {
      currentArea: ''
    };
  }

  public render() {
    return (
      <div className="default">
        <Map
          width={`100vw`}
          height={`50vh`}
          dataSourceUrl="/sweden.json"
          onAreaSelected={this.handleAreaSelection}
        />

        {this.state.currentArea && <h2>{this.state.currentArea}</h2>}
        {!this.state.currentArea &&
        <h2><em>Click on the map's region</em></h2>}
        <div className="logos"/>
      </div>
    );
  }

  private handleAreaSelection = (area: IValnattArea) => {
    this.setState({
      currentArea: area.name
    });
  };
}

export default DefaultVersionContainer;
