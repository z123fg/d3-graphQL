import React, { createRef, FC, useContext, useEffect, useRef, useState } from 'react';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { WeatherDataResponse } from '../Features/Weather/Weather';
import * as d3 from 'd3';
import { MetricContext } from '../App';
import useDimensions from '../hooks/useDimensions';
import renderLineChart, { IMeasurement, IMetricMeasurements, ISvgDimensions } from '../utils/lineChart.d3';
import generateRandomColors from '../utils/generateRandomColors';

interface INowWhatProps { }

const query = gql`
  query ($input: [MeasurementQuery]) {
    getMultipleMeasurements(input: $input) {
      metric
      measurements {
        at
        value
        metric
        unit
      }
    }
  }
`;


const MeasurementChart: FC<INowWhatProps> = () => {
  const state = useContext(MetricContext);
  const recent30Minutes = Date.now() - 1800000 //ms
  const inputRef = useRef(state.state.metrics.map((item: any) => ({ metricName: item, after: recent30Minutes })));

  const svgRef = useRef<any>();

  const containerRef = useRef<any>();
  const svgContainerDimensions = useDimensions(containerRef);
  const[getMeasurements, { loading, data, error } ]= useLazyQuery(query, {
    variables: {
      input: inputRef.current,
    },
    pollInterval: 1000,
    fetchPolicy: "no-cache"
  });
  useEffect(() => {
    inputRef.current = state.state.metrics.map((item: any) => ({ metricName: item, after: recent30Minutes }));
    getMeasurements();
  }, [state.state.metrics])



  const svgDimensions: ISvgDimensions = {
    margin: { top: 30, right: 50, bottom: 30, left: 50 },
    width: svgContainerDimensions.width - 100,
    height: svgContainerDimensions.height - 60,
  };

  inputRef.current.forEach((metric: any) => (metric.after = recent30Minutes));



  React.useEffect(() => {
    const measurements: IMeasurement[] = data?.getMultipleMeasurements?.[0]?.measurements;
    const multipleMeasurements: IMetricMeasurements[] = data?.getMultipleMeasurements;

    if (measurements) {

      renderLineChart(svgRef, svgDimensions, multipleMeasurements);
    }
  }, [data, svgContainerDimensions]);

  return (
    <section className="chart-section">
      <div className="chart-container" ref={containerRef}>
      <svg className="chart" ref={svgRef} />
    </div>
    </section>
    
  );
};

export default MeasurementChart;
