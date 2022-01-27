<template>
  <div class="vis-component" ref="chart">
    <svg id="main-svg" :width="svgWidth" :height="svgHeight">
      <g class="chart-group" ref="chartGroup">
        <g class="axis axis-x" ref="axisX"></g>
        <g class="axis axis-y" ref="axisY"></g>
        <g class="bars-group" ref="barsGroup"></g>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "BarChart",
  props: {},
  data() {
    return {
      svgWidth: 0,
      svgHeight: 500,
      svgPadding: {
        top: 25,
        right: 20,
        bottom: 70,
        left: 40,
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
      this.createBar();
    },
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
        .attr("y", 0)
        .attr("x", -7)
        .attr("dy", ".35em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "end");
    },
    drawYAxis() {
      d3.select(this.$refs.axisY)
        .call(d3.axisLeft(this.yScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text("Educational Attainment: Bachelor's Degree or Higher (%)");
    },

    createBar(){
      let barsGroup = d3.select(this.$refs.barsGroup)
        .selectAll(".bar")
        .data(Array.from(this.getBarData))
        .enter()
        .append("g")
        .attr("class", "bar")
    
      barsGroup
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => this.xScale(d.state)+84)
        .attr("y", (d) => this.yScale(d.icu))
        .attr("width", this.xScale.bandwidth()/2)
        .attr(
          "height",
          (d) =>
            this.svgHeight -
            this.svgPadding.top -
            this.svgPadding.bottom -
            this.yScale(d.icu)
        )
        .on("click", (event, d) => this.handleBarClick(d.state));

          barsGroup
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => this.xScale2(d.state))
        .attr("y", (d) => this.yScale2(d.smokers))
        .attr("width", this.xScale2.bandwidth()/2)
        .attr(
          "height",
          (d) =>
            this.svgHeight -
            this.svgPadding.top -
            this.svgPadding.bottom -
            this.yScale2(d.smokers)
        )
        .on("click", (event, d) => this.handleBarClick(d.state));


    },

    getcombinedData() {
      let returnList = Array.from(this.getSelectedState);
      return returnList;
    },
    handleBarClick(val) {
      this.$store.commit("changeSelectedState", val);
    },
  },
  computed: {
    getBarData: {
      get() {
        return this.$store.getters.getBarData;
      },
    },
    dataMax() {
      return d3.max(Array.from(this.getBarData), (d) => d.icu);
    },
    dataMin() {
      return d3.min(Array.from(this.getBarData), (d) => d.icu);
    },
    xScale() {
      return d3
        .scaleBand()
        .domain(Array.from(this.getBarData).map((d) => d.state))
        .range([
          0,
          this.svgWidth - this.svgPadding.left - this.svgPadding.right,
        ])
        .padding(0.4);
    },
    yScale() {
      return d3
        .scaleLinear()
        .rangeRound([
          this.svgHeight - this.svgPadding.top - this.svgPadding.bottom,
          0,
        ])
        .domain([this.dataMin > 0 ? 0 : this.dataMin, this.dataMax]);
    },
    dataMax2() {
      return d3.max(Array.from(this.getBarData), (d) => d.smokers);
    },
    dataMin2() {
      return d3.min(Array.from(this.getBarData), (d) => d.smokers);
    },
        xScale2() {
      return d3
        .scaleBand()
        .domain(Array.from(this.getBarData).map((d) => d.state))
        .range([
          0,
          this.svgWidth - this.svgPadding.left - this.svgPadding.right,
        ])
        .padding(0.4);
    },
    yScale2() {
      return d3
        .scaleLinear()
        .rangeRound([
          this.svgHeight - this.svgPadding.top - this.svgPadding.bottom,
          0,
        ])
        .domain([this.dataMin > 0 ? 0 : this.dataMin, this.dataMax]);
    },
  },
  watch: {
    educationRates: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
    getBarData: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
  },
};
</script>

<style>
.bar {
  fill: steelblue;
}

.bar:hover {
  fill: lightblue;
}
</style>
