
import * as d3 from 'd3';
import { RefObject } from 'react';

export interface ISvgDimensions {
    width: number;
    height: number;
    margin: {
        top: number;
        left: number;
        right: number;
        bottom: number
    }
}

export interface IMeasurement {
    __typename: string;
    at: number;
    value: number;
    metric: string;
    unit: string
}

export interface IMetricMeasurements {
    measurements: IMeasurement[];
    metric: string;
}


let lastPointerX = 0;
let lastBisect: any;
export default function renderLineChart(svgRef: RefObject<SVGElement>, dimensions: ISvgDimensions, data: IMetricMeasurements[]) {


    var color = d3.schemeCategory10;
    const expandedData = data.map((item: IMetricMeasurements, index) => ({ ...item, color: color[index] }))
    const unitMeasurements = Object.entries(expandedData?.reduce((acc: any, cur) => {
        if (acc?.[cur?.measurements?.[0]?.unit] === undefined) {
            acc[cur?.measurements?.[0]?.unit] = cur.measurements;
            return acc
        } else {
            acc[cur?.measurements?.[0]?.unit] = [...acc[cur?.measurements?.[0]?.unit], ...cur.measurements]
            return acc
        }
    }, {}));
    const concatenatedMeasurements = expandedData.map((metricMeasurements: IMetricMeasurements) => metricMeasurements.measurements).flat();

    const xScale = d3
        .scaleTime()
        //@ts-ignore
        .domain(d3.extent(concatenatedMeasurements, (d) => d.at))
        .range([0, dimensions.width - 50 * (unitMeasurements.length - 1)]);
    const yScale = d3
        .scaleLinear()
        //@ts-ignore
        .domain([d3.min(concatenatedMeasurements, (d) => { return d.value - 90 }), d3.max(concatenatedMeasurements, (d) => d.value) + 50])
        .range([dimensions.height, 0]);
    // Create root container where we will append all other chart elements
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll('* :not(.mouse-line)').remove(); // Clear svg content before adding new elements
    const svg = svgEl.append('g').attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`);
    // Add X grid lines with labels
    const xAxis = d3
        .axisBottom(xScale)
        .ticks(5)
        .tickSize(-dimensions.height)
        .tickFormat(val => {
            const offset = val.getTimezoneOffset()
            val = new Date(val.getTime() - (offset * 60 * 1000))
            return val.toISOString().split(/[A-Za-z]|[.]/)[1]
        });
    const xAxisGroup = svg
        .append('g')
        .attr('transform', `translate(${50 * (unitMeasurements.length - 1)}, ${dimensions.height})`)
        .call(xAxis)
    xAxisGroup.selectAll('line').attr('stroke', 'darkGray');
    xAxisGroup.selectAll('text').attr('opacity', 0.8).attr('color', 'black').attr('font-size', '0.75rem');
    //xAxisGroup.select('.domain').remove();
    // Add Y grid lines with labels

    unitMeasurements.forEach((unit, index) => {
        const yAxis = d3
            .axisLeft(yScale)
            .ticks(10)
            .tickSize(index === (unitMeasurements.length - 1) ? -dimensions.width + (unitMeasurements.length - 1) * 50 : 0).tickSizeOuter(0)
            .tickFormat((val) => { return `${val}` });
        const yAxisGroup = svg.append('g').call(yAxis)

        yAxisGroup.selectAll('line').attr('stroke', 'darkGray').attr("transform", `translate(${50 * index},0)`);
        yAxisGroup.selectAll('text').attr('opacity', 0.8).attr('color', 'black').attr('font-size', '0.75rem').attr("transform", `translate(${50 * index},0)`);
        yAxisGroup.select('.domain').attr("transform", `translate(${50 * index},0)`)
        yAxisGroup.append("text").attr("fill", "black")
            .attr("transform", `rotate(-90) translate(0,${50 * index})`).style("font-size", "18")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(unit[0]);;
    })
    // Draw the lines
    //@ts-ignore
    const line = d3.line().x((d) => xScale(d.at)).y((d) => yScale(d.value));

    svg
        .selectAll('.line')
        .data(expandedData)
        .enter()
        .append('path')
        .attr('fill', 'none').attr("transform", `translate(${50 * (unitMeasurements.length - 1)},0)`)
        .attr('stroke', (d: any) => { return d.color })
        .attr('stroke-width', 1)
        .attr('d', (d: any) => {
            return line(d.measurements)
        });



    var focus = svg.selectAll("g.focus").data(expandedData).enter().append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("circle").attr("fill", "none").attr("stroke", d => d.color)
        .attr("r", 4.5);

    focus.append("text").attr("class", "value")
        .attr("x", 9)
        .attr("dy", ".35em");
    focus.append("text").attr("class", "metric").attr("transform", `translate(-10,${15})`).text(d => d.metric)
        .attr("x", 9)
        .attr("dy", ".35em");


    svg.append("path") // this is the black vertical line to follow mouse
        .attr("class", "mouse-line")
        .style("stroke", "gray")
        .style("stroke-width", "1px")
        .attr("d", function () {
            var d = "M" + lastPointerX + "," + dimensions.height;
            d += " " + lastPointerX + "," + 0;
            return d;
        })
    const bisectDate = d3.bisector(function (d: any) { return d.at; }).left;
    const x0 = xScale.invert(lastPointerX - 50 * (unitMeasurements.length - 1));
    const i = bisectDate(expandedData[0].measurements, +x0, 1);
    svg.append("text").attr("class", "time").attr("transform", `translate(${lastPointerX-30},${dimensions.height+20})`)
        .attr("x", 9).attr("fill","gray")
        .attr("dy", ".35em").text(() => {
            if(expandedData[0].measurements[i] === undefined) return ""
            let val = new Date(expandedData[0].measurements[i]?.at)
            let offset = val?.getTimezoneOffset()
            val = new Date(val?.getTime() - (offset * 60 * 1000));
            return val?.toISOString().split(/[A-Za-z]|[.]/)[1]
        });

    expandedData.forEach((data, idx) => {
        const x0 = xScale.invert(lastPointerX - 50 * (unitMeasurements.length - 1));

        //@ts-ignore
        const i = bisectDate(data.measurements, +x0, 1);
        const d0 = data.measurements[i - 1];
        const d1 = data.measurements[i > data.measurements.length - 1 ? data.measurements.length - 1 : i];
        if (d0 === undefined || d1 === undefined) {
            return
        }

        const d = +x0 - d0.at > d1.at - +x0 ? d1 : d0;

        focus.filter((item: any, index: any) => index === idx).attr("transform", `translate(${xScale(d.at) + 50 * (unitMeasurements.length - 1)},${yScale(d.value)})`);
        focus.filter((item: any, index: any) => index === idx).select("text.value").text(d.value);
    });


    svg.append("rect")
        .attr("class", "overlay").attr("fill", "none").attr("pointer-events", "all")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)
        .on("mouseover", function () { focus.style("display", null); })
        .on("mouseout", function () { focus.style("display", "none"); })
        .on("mousemove", mousemove);


    function mousemove(e: any) {

        //@ts-ignore
        const pointerX = d3.pointer(e, this)[0];
        lastPointerX = pointerX;
        const x0 = xScale.invert(pointerX - 50 * (unitMeasurements.length - 1));
        const i = bisectDate(expandedData[0].measurements, +x0, 1);

        svg.select("path.mouse-line").style("stroke", "gray").attr("d", function () {
            var d = "M" + pointerX + "," + dimensions.height;
            d += " " + pointerX + "," + 0;
            return d;
        })

        svg.select("text.time").text(() => {
            let val = new Date(expandedData[0].measurements[i].at)
            let offset = val.getTimezoneOffset()
            val = new Date(val.getTime() - (offset * 60 * 1000))
            return val.toISOString().split(/[A-Za-z]|[.]/)[1]
        }).attr("transform", `translate(${pointerX-30},${dimensions.height + 20})`);


        expandedData.forEach((data, idx) => {
            //@ts-ignore

            //@ts-ignore

            const d0 = data.measurements[i - 1];
            const d1 = data.measurements[i > data.measurements.length - 1 ? data.measurements.length - 1 : i];
            if (d0 === undefined || d1 === undefined) {
                return
            }
            const d = +x0 - d0.at > d1.at - +x0 ? d1 : d0;

            focus.filter((item: any, index: any) => index === idx).attr("transform", `translate(${xScale(d.at) + 50 * (unitMeasurements.length - 1)},${yScale(d.value)})`);
            focus.filter((item: any, index: any) => index === idx).select("text.value").text(d.value);

        });

    }



}