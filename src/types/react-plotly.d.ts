declare module 'react-plotly.js' {
  import * as Plotly from 'plotly.js';
  import * as React from 'react';

  interface PlotParams {
    data: Plotly.Data[];
    layout?: Partial<Plotly.Layout>;
    frames?: Plotly.Frame[];
    config?: Partial<Plotly.Config>;
    style?: React.CSSProperties;
    useResizeHandler?: boolean;
    revision?: number;
    divId?: string;
    className?: string;
    debug?: boolean;
    onInitialized?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
    onUpdate?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
    onPurge?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
    onError?: (err: Error) => void;
    onAfterExport?: () => void;
    onAfterPlot?: () => void;
    onAnimated?: () => void;
    onAnimatingFrame?: (event: { name: string; frame: { duration: number } }) => void;
    onAnimationInterrupted?: () => void;
    onAutoSize?: () => void;
    onBeforeExport?: () => void;
    onClick?: (event: Plotly.PlotMouseEvent) => void;
    onClickAnnotation?: (event: Plotly.ClickAnnotationEvent) => void;
    onDeselect?: () => void;
    onDoubleClick?: () => void;
    onFramework?: () => void;
    onHover?: (event: Plotly.PlotMouseEvent) => void;
    onLegendClick?: (event: Plotly.LegendClickEvent) => boolean;
    onLegendDoubleClick?: (event: Plotly.LegendClickEvent) => boolean;
    onRelayout?: (event: Plotly.PlotRelayoutEvent) => void;
    onRestyle?: (event: Plotly.PlotRestyleEvent) => void;
    onRedraw?: () => void;
    onSelected?: (event: Plotly.PlotSelectionEvent) => void;
    onSelecting?: (event: Plotly.PlotSelectionEvent) => void;
    onSliderChange?: (event: Plotly.SliderChangeEvent) => void;
    onSliderEnd?: (event: Plotly.SliderEndEvent) => void;
    onSliderStart?: (event: Plotly.SliderStartEvent) => void;
    onTransitioning?: () => void;
    onTransitionInterrupted?: () => void;
    onUnhover?: (event: Plotly.PlotMouseEvent) => void;
  }

  const Plot: React.ComponentClass<PlotParams>;
  
  export default Plot;
} 