import { Feature } from "geojson";

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


export interface IMapFeature extends Feature {
  properties: MapFeature
}
