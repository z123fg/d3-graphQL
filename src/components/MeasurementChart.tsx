import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';
import { gql, useQuery } from '@apollo/client';
import { WeatherDataResponse } from '../Features/Weather/Weather';
import * as d3 from 'd3';
import { MetricContext } from '../App';

const useStyles = makeStyles({
  card: {
    margin: '5% 25%',
  },
});

interface INowWhatProps {}
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
  const classes = useStyles();

  const {
    state: { metrics },
    dispatch,
  } = useContext(MetricContext);
  useEffect(() => {
    console.log(metrics);
  }, [metrics]);

  const [queryInput, setQueryInput] = useState(
    metrics.map((metric: string) => ({ metricName: metric, after: recent30Minutes })),
  );
  useEffect(() => {
    setQueryInput(metrics.map((metric: string) => ({ metricName: metric, after: recent30Minutes })));
  }, [metrics]);

  const svgRef = useRef<any>();

  const width = 300;
  const height = 150;
  const margin = { top: 30, right: 30, bottom: 30, left: 60 };
  const svgHeight = height + margin.top + margin.bottom;
  const svgWidth = width + margin.left + margin.right;

  const recent30Minutes = Date.now() - 1800000; //ms
  const { loading, error, data } = useQuery<any>(query, {
    variables: {
      input: queryInput,

      /* [{
        metricName: "waterTemp",
        after: 1649997847953
      }] */
    },
  });

  useEffect(() => {
    console.log(loading, error, data);
  }, [loading, error, data]);

  React.useEffect(() => {
    if (data) {
      console.log("svg")
      const measurements: { __typename: string; at: number; value: number; metric: string; unit: string }[] =
        data.getMultipleMeasurements[0].measurements;
        const xScale = d3
          .scaleTime()
          //@ts-ignore
          .domain(d3.extent(measurements, (d) => d.at))
          .range([0, width]);
        const yScale = d3
          .scaleLinear()
          //@ts-ignore
          .domain([d3.min(measurements, (d) => d.value) - 50, d3.max(measurements, (d) => d.value) + 50])
          .range([height, 0]);
        // Create root container where we will append all other chart elements
        const svgEl = d3.select(svgRef.current);
        svgEl.selectAll('*').remove(); // Clear svg content before adding new elements
        const svg = svgEl.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
        // Add X grid lines with labels
        const xAxis = d3
          .axisBottom(xScale)
          .ticks(5)
          .tickSize(-height + margin.bottom);
        const xAxisGroup = svg
          .append('g')
          .attr('transform', `translate(0, ${height - margin.bottom})`)
          .call(xAxis);
        xAxisGroup.select('.domain').remove();
        xAxisGroup.selectAll('line').attr('stroke', 'rgba(255, 255, 255, 0.2)');
        xAxisGroup.selectAll('text').attr('opacity', 0.5).attr('color', 'white').attr('font-size', '0.75rem');
        // Add Y grid lines with labels
        const yAxis = d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-width)
          .tickFormat((val) => `${val}%`);
        const yAxisGroup = svg.append('g').call(yAxis);
        yAxisGroup.select('.domain').remove();
        yAxisGroup.selectAll('line').attr('stroke', 'rgba(255, 255, 255, 0.2)');
        yAxisGroup.selectAll('text').attr('opacity', 0.5).attr('color', 'white').attr('font-size', '0.75rem');
        // Draw the lines
        //@ts-ignore
        const line = d3.line().x((d) => xScale(d.at)).y((d) => yScale(d.value));
        svg
          .selectAll('.line')
          .data(data)
          .enter()
          .append('path')
          .attr('fill', 'none')
          .attr('stroke', (d:any) => d.color)
          .attr('stroke-width', 3)
          .attr('d', (d:any) => line(d.items));
      
    }
  }, [data]);

  return (
    <Card className={classes.card}>
      <svg ref={svgRef} width={svgWidth} height={svgHeight} />
    </Card>
  );
};

export default MeasurementChart;
