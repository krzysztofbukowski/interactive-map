import * as React from 'react';
import { IMapProps } from './Map';

interface IMapLoaderProps {
  dataSourceHost: string;
}

class MapLoader extends React.Component<IMapLoaderProps> {
  private component: any;

  public render() {
    if (this.props.children && this.props.children.hasOwnProperty('length')) {
      throw new TypeError('Expecting one child component');
    }

    if (this.props.children) {
      const reactElement = this.props.children as React.ReactElement<IMapProps>;
      this.component = (reactElement).type;
      const props: IMapProps = {...reactElement.props};
      
      return <this.component {...props} />;
    } else {
      return null;
    }
  }
}

export default MapLoader;
