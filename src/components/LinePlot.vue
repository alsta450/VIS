<template>
  <div class="vis-component" ref="chart">
    <svg id="main-svg" :width="svgWidth" :height="svgHeight">
      <g class="chart-group" ref="chartGroup">
        <g class="axis axis-x" ref="axisX">
          <g class="xLabel" ref="xLabel"></g>
        </g>
        <g class="axis axis-y" ref="axisY"></g>
        <g class="line-group" ref="lineGroup"></g>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";
// import * as d3Collection from "d3-collection";
export default {
  name: "LinePlot",
  props: {},
  data() {
    return {
      svgWidth: 500,
      svgHeight: 500,
      svgPadding: {
        top: 40,
        right: 70,
        bottom: 40,
        left: 60,
      },
    };
  },
  mounted() {
    this.drawChart();
  },
  methods: {
    drawChart() {
      if (this.$refs.chart) this.svgWidth = this.$refs.chart.clientWidth;
      d3.select(this.$refs.chartGroup).attr(
        "transform",
        `translate(${this.svgPadding.left},${this.svgPadding.top})`
      );

      this.drawXAxis();
      this.drawYAxis();
      //this.paintPlotColors();
      this.drawLines();
      //this.calculatePointPosition(this.combinedData());
      //this.combinedDataDiabetes();
      // console.log(this.diabetes);
      //console.log(this.covid);
    },
    //append rectangles in the right colors
    //Tooltip
    showToolTip(event, data) {
      //Delete old Tooltip before displaying new one
      d3.select(".tooltip").remove();
      d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("left", `${event.pageX - 30}px`)
        .style("top", `${event.pageY - 30}px`)
        .style("opacity", 1)
        .style("font-size", "17px")
        .style("font-weight", "bold")
        .text(data.location)
        .style("position", "absolute");
    },
    //on mouse leave delete tooltip
    deleteToolTip() {
      d3.select(".tooltip").remove();
    },
    //Draw x-Axis
    drawXAxis() {
      d3.select(this.$refs.axisX)
        .attr(
          "transform",
          `translate( 0, ${
            this.svgHeight - this.svgPadding.top - this.svgPadding.bottom
          } )`
        )
        .call(d3.axisBottom(this.xScale))
        .selectAll("text")
        .attr("y", 20)
        .attr("x", 3)
        .attr("dy", ".35em")
        .style("text-anchor", "end");
      this.appendXAxisLabel();
    },
    appendXAxisLabel() {
      //For some reason it does not work if i call this.$refs.axisX no matter what I tried
      d3.select(this.$refs.axisY)
        .append("text")
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text("Educational Attainment: Bachelor's Degree or Higher (%)")
        .attr("x", 390)
        .attr("y", 455)
        .style("font-size", 14);
    },
    //Draw y-axis
    drawYAxis() {
      d3.select(this.$refs.axisY).call(d3.axisLeft(this.yScale));

      this.appendYAxisLabel();
    },
    appendYAxisLabel() {
      //For some reason it does not work if i call this.$refs.axisX no matter what I tried
      d3.select(this.$refs.axisY)
        .append("text")
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text("Average Yearly Personal Income (in $)")
        .attr("x", -100)
        .attr("y", -50)
        .attr("transform", "rotate(-90)")
        .style("font-size", 14);
    },
    //Draw points
    drawLines() {
      console.log(this.getLineData); 

      const lineGroup = d3.select(this.$refs.lineGroup);
      lineGroup
        .selectAll(".line-group")
        .data(this.getLineData)
        .enter()
        .append("g")
        // .attr("class", "line-group")
        .append("path")
        .attr("class", "line")
        .attr("d", d => {
         return this.lineGenerator(d.values)});
    },


  },
  computed: {

    lineGenerator() {
      return d3
        .line()
        .x((d) => this.xScale(d.year))
        .y((d) => this.yScale(d.cases));
    },

    getLineData: {
      get() {
        return this.$store.getters.getLineData;
      },
    },
    dataMaxY() {
      console.log(this.getLineData);
      return d3.max(this.getLineData, (d) => d.max);
    },
    dataMinY() {
      return d3.min(this.covid, (d) => d.icu_patients_per_million);
    },
    dataMaxX() {
      console.log(d3.max(this.getLineData, (d) => d.maxDate));
      return d3.max(this.getLineData, (d) => d.maxDate);
    },
    dataMinX() {
      return d3.min(this.getLineData, (d) => d.minDate);
    },
    xScale() {
      return d3
        .scaleTime()
        .domain([this.dataMinX, this.dataMaxX])
        .range([0, this.svgWidth - this.svgPadding.right]);
    },

    yScale() {
      return d3
        .scaleLinear()
        .range([
          this.svgHeight - this.svgPadding.top - this.svgPadding.bottom,
          0,
        ])
        .domain([0, this.dataMaxY]);
    },
  },
  watch: {
    getSelectedState: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
  },
};
</script>

<style>
.point {
  border-radius: 10px;
  fill: black;
}
.point:hover {
  fill: lightblue;
}
.line {
  fill: none;
  stroke: #000;
  stroke-width: '1px'
}
</style>
