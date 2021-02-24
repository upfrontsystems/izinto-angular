export function timeSeriesChart() {
    var margin = { top: 20, right: 20, bottom: 20, left: 20 },
        width = 760,
        height = 120,
        xValue = function (d) { return d[0]; },
        yValue = function (d) { return d[1]; },
        xScale = d3.scaleTime(),
        yScale = d3.scaleLinear(),
        xAxis = d3.axisBottom(xScale).tickSize(6, 0),
        area = d3.area().x(X).y1(Y),
        line = d3.line().x(X).y(Y);

    function chart(selection) {
        selection.each(function (data) {

            // Convert data to standard representation greedily;
            // this is needed for nondeterministic accessors.
            data = data.map(function (d, i) {
                return [xValue.call(data, d, i), yValue.call(data, d, i)];
            });

            // Update the x-scale.
            xScale
                .domain(d3.extent(data, function (d) { return d[0]; }))
                .range([0, width - margin.left - margin.right]);

            // Update the y-scale.
            yScale
                .domain([0, d3.max(data, function (d) { return d[1]; })])
                .range([height - margin.top - margin.bottom, 0]);

            // Select the svg element, if it exists.
            var svg = d3.select(this)
                .append('svg')
                .attr('viewBox', '0 0 ' + width + ' ' + height)
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
            
            svg.append('g').attr('class', 'grid');

            const linechart = svg.append('g').attr('class', 'line-chart');
            linechart.append('path')
                .datum(data)
                .attr('fill', 'none')
                .style('stroke', 'black')
                .style('stroke-width', '2px')
                .attr('class', 'line')
                .attr('d', line);

            // update the x axis
            svg.append('g')
                .attr('class', 'x-axis')
                .attr('transform', "translate(0," + yScale.range()[0] + ")")
                .call(xAxis);
        });
    }

    // The x-accessor for the path generator; xScale ∘ xValue.
    function X(d) {
        return xScale(d[0]);
    }

    // The x-accessor for the path generator; yScale ∘ yValue.
    function Y(d) {
        return yScale(d[1]);
    }

    chart.margin = function (_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.width = function (_) {
        if (!arguments.lengtsh) return width;
        width = _;
        return chart;
    };

    chart.height = function (_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    chart.x = function (_) {
        if (!arguments.length) return xValue;
        xValue = _;
        return chart;
    };

    chart.y = function (_) {
        if (!arguments.length) return yValue;
        yValue = _;
        return chart;
    };

    return chart;
}
