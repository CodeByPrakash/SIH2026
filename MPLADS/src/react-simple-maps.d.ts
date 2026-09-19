declare module "react-simple-maps" {
  import { FC, ReactNode, SVGProps } from "react";

  interface ProjectionConfig {
    scale?: number;
    center?: [number, number];
    rotate?: [number, number, number];
  }

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: ProjectionConfig;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    children?: ReactNode;
  }
  export const ComposableMap: FC<ComposableMapProps>;

  interface ZoomableGroupProps {
    zoom?: number;
    center?: [number, number];
    minZoom?: number;
    maxZoom?: number;
    children?: ReactNode;
  }
  export const ZoomableGroup: FC<ZoomableGroupProps>;

  interface GeographiesProps {
    geography: string | object;
    children: (args: { geographies: GeoShape[] }) => ReactNode;
  }

  interface GeoShape {
    rsmKey: string;
    properties: Record<string, string>;
    type?: string;
    geometry?: object;
  }
  export const Geographies: FC<GeographiesProps>;

  interface Geography {
    rsmKey: string;
    properties: Record<string, string>;
    type: string;
    geometry: object;
  }

  interface GeographyStyle {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    outline?: string;
    cursor?: string;
    opacity?: number;
    filter?: string;
  }

  interface GeographyProps extends Omit<SVGProps<SVGPathElement>, "style"> {
    geography: GeoShape;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: { default?: GeographyStyle; hover?: GeographyStyle; pressed?: GeographyStyle };
    onMouseEnter?: (event: React.MouseEvent<SVGPathElement>) => void;
    onMouseMove?: (event: React.MouseEvent<SVGPathElement>) => void;
    onMouseLeave?: (event: React.MouseEvent<SVGPathElement>) => void;
    onClick?: (event: React.MouseEvent<SVGPathElement>) => void;
  }
  export const Geography: FC<GeographyProps>;

  interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
  }
  export const Marker: FC<MarkerProps>;
}
