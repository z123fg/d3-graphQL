import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';
import { gql, useQuery } from '@apollo/client';
import { WeatherDataResponse } from '../Features/Weather/Weather';
import * as d3 from 'd3';
import { MetricContext } from '../App';



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

  /* const {
    state: { metrics },
    dispatch,
  } = useContext(MetricContext);
  useEffect(() => {
  }, [metrics]);

  const [queryInput, setQueryInput] = useState(
    metrics.map((metric: string) => ({ metricName: metric, after: recent30Minutes })),
  );
  useEffect(() => {
    setQueryInput(metrics.map((metric: string) => ({ metricName: metric, after: recent30Minutes })));
  }, [metrics]); */
const recent30Minutes = Date.now() - 18000; //ms
  const [input,setInput] = useState([{ metricName: "waterTemp", after: recent30Minutes }])

  const svgRef = useRef<any>();

  const width = 1000;
  const height = 500;
  const margin = { top: 30, right: 30, bottom: 30, left: 60 };
  const svgHeight = height + margin.top + margin.bottom;
  const svgWidth = width + margin.left + margin.right;

  
  const { loading, error, data } = useQuery<any>(query, {
    variables: {
      input: input
    },
    pollInterval: 500
  });



  React.useEffect(() => {

    const measurements: { __typename: string; at: number; value: number; metric: string; unit: string }[] =
      data?.getMultipleMeasurements?.[0]?.measurements; 
    if (measurements) {
        const xScale = d3
          .scaleTime()
          //@ts-ignore
          .domain(d3.extent(measurements, (d) => d.at))
          .range([0, width]);
        const yScale = d3
          .scaleLinear()
          //@ts-ignore
          .domain([d3.min(measurements, (d) => d.value - 100), d3.max(measurements, (d) => d.value) + 50])
          .range([height, 0])
        // Create root container where we will append all other chart elements
        const svgEl = d3.select(svgRef.current);
        svgEl.selectAll('*').remove(); // Clear svg content before adding new elements
        const svg = svgEl.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
        // Add X grid lines with labels
        const xAxis = d3
          .axisBottom(xScale)
          .ticks(5)
          .tickSize(-height + margin.bottom - 100);
        const xAxisGroup = svg
          .append('g')
          .attr('transform', `translate(0, ${height + 50})`)
          .call(xAxis);
        xAxisGroup.select('.domain').remove();
        xAxisGroup.selectAll('line').attr('stroke', 'red');
        xAxisGroup.selectAll('text').attr('opacity', 0.5).attr('color', 'red').attr('font-size', '0.75rem');
        // Add Y grid lines with labels
        const yAxis = d3
          .axisLeft(yScale)
          .ticks(10)
          .tickSize(-width)
          .tickFormat((val) => `${val}%`);
        const yAxisGroup = svg.append('g').call(yAxis);
        yAxisGroup.select('.domain').remove();
        yAxisGroup.selectAll('line').attr('stroke', 'blue');
        yAxisGroup.selectAll('text').attr('opacity', 0.5).attr('color', 'red').attr('font-size', '0.75rem');
        // Draw the lines
        //@ts-ignore
        const line = d3.line().x((d) => xScale(d.at)).y((d) => yScale(d.value));
        svg
          .selectAll('.line')
          .data([measurements])
          .enter()
          .append('path')
          .attr('fill', 'none')
          .attr('stroke', (d: any) => "red")
          .attr('stroke-width', 1)
          .attr('d', (d: any) => {
            return line(d)
          });

      }
  }, [data]);

  return (
    <svg ref={svgRef} width={svgWidth} height={svgHeight + 100} />
  );
};

export default MeasurementChart;
