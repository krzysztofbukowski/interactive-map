import * as React from 'react';
import Map from './components/Map';
import './App.css';

interface IAppState {
  currentArea: string;
}

class App extends React.Component<{}, IAppState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      currentArea: ''
    };
  }

  public render() {
    return (
      <div>
        <Map
          width={`100vw`}
          height={`50vh`}
          dataSourceUrl="/sweden.json"
          onAreaSelected={this.handleAreaSelection}
        />

        {this.state.currentArea && <h2>{this.state.currentArea}</h2>}
        {!this.state.currentArea && <h2><em>Click on the map's area to reveal its name</em></h2>}

      </div>
    );
  }

  private handleAreaSelection = (areaName: string) => {
    this.setState({
      currentArea: areaName
    })
  };
}

export default App;
