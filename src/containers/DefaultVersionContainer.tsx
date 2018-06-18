import * as React from 'react';
import { connect } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';

import { setArea } from '../actions/params';
import Map, { IMapArea } from '../components/Map';
import './DefaultVersionContainer.css';
import { IValnattState } from '../store/state';


interface IDefaultMapContainerProps {
  currentArea: IMapArea;
  dispatch: {
    setArea: (area: IMapArea) => any
  }
}

class DefaultVersionContainer extends React.Component<IDefaultMapContainerProps> {
  public render() {
    let areaLabel = 'Hela Sverige';

    if (this.props.currentArea.name !== undefined && this.props.currentArea.name !== 'national') {
      areaLabel = this.props.currentArea.name;
    }

    return (
      <div className="default">
        <Map
          width={`100vw`}
          height={`calc(100vh - 100px)`}
          dataSourceHost="http://localhost:5000"
          onAreaSelected={this.handleAreaSelection}
          area={this.props.currentArea.area || 'national'}
        />

        <div className="footer">
          {<h2>{areaLabel}</h2>}
        </div>
      </div>
    );
  }

  private handleAreaSelection = (area: IMapArea) => {
    this.props.dispatch.setArea(area);
  };
}

const mapStateToProps = (state: IValnattState) => {
  return {
    currentArea: state.params.area
  };
};

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return {
    dispatch: {
      setArea: (area: IMapArea) => dispatch(setArea(area))
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DefaultVersionContainer);
