declare module 'redux-query-sync' {
  import { Store } from 'redux';

  export default function (options: {
    initialTruth?: 'location' | 'store',
    params?: {
      [key: string]: {
        action?: (value: string) => {type: string, payload: any},
        defaultValue?: string,
        selector?: (state: {}) => any;
        stringToValue?: (s: string) => any;
        valueToString?: (value: any) => any
      }
    },
    replaceState?: boolean,
    store?: Store
  }): any;
}
