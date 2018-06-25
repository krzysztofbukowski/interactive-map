import * as React from 'react';
import { connect } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';

import { setArea } from '../actions/params';
import Map, { IMapArea } from '../components/Map/Map';
import './DefaultVersionContainer.css';
import { default as initialState, IValnattState } from '../store/state';

interface IDefaultMapContainerProps {
  currentAreaId: string;
  dispatch: {
    setArea: (area: string) => any
  }
}

interface IDefaultMapContainerState {
  currentAreaName: string;
}

const DEFAULT_AREA_NAME = 'Hela Sverige';

class DefaultVersionContainer extends React.Component<IDefaultMapContainerProps, IDefaultMapContainerState> {

  constructor(props: IDefaultMapContainerProps) {
    super(props);

    this.state = {
      currentAreaName: DEFAULT_AREA_NAME
    };
  }

  public render() {
    return (
      <div className="default">
          <Map
            animationLength={750}
            width={`100vw`}
            height={`calc(100vh - 100px)`}
            dataSourceHost="http://localhost:5000"
            onAreaClicked={this.handleAreaClick}
            onAreaChanged={this.handleAreaChanged}
            onReset={this.handleReset}
            area={this.props.currentAreaId || 'national'}
          />

        <div className="footer">
          {<h2>{this.state.currentAreaName}</h2>}
        </div>
      </div>
    );
  }

  private handleReset = () => {
    this.props.dispatch.setArea(initialState.params.area);
    this.setState({
      currentAreaName: DEFAULT_AREA_NAME
    });
  };

  private handleAreaClick = (area: IMapArea) => {
    this.props.dispatch.setArea(area.id);

    this.setState({
      currentAreaName: area.name
    });    
  };

  private handleAreaChanged = (currentArea: IMapArea) => {
    this.props.dispatch.setArea(this.props.currentAreaId);

    this.setState({
      currentAreaName: currentArea.name
    });
  }
}

const mapStateToProps = (state: IValnattState) => {
  return {
    currentAreaId: state.params.area,
  };
};

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return {
    dispatch: {
      setArea: (area: string) => dispatch(setArea(area))
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DefaultVersionContainer);
