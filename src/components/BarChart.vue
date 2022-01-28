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
        .attr("dy", "0.75em")
        .style("font-size", "17px")
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text("ICU per million vs smoking rate");
    },

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
        .text("ICU per million: " + data.icu)
        .style("position", "absolute");
    },
    deleteToolTip() {
      d3.select(".tooltip").remove();
    },
    showToolTip2(event, data) {
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
        .text("Total Smokers: " + data.smokers)
        .style("position", "absolute");
    },
    createBar() {
      d3.selectAll(".bar").remove();
      let barsGroup = d3
        .select(this.$refs.barsGroup)
        .selectAll(".bar")
        .data(this.getBarData)
        .enter()
        .append("g")
        .attr("class", "bar");

      barsGroup
        .append("rect")
        .attr("class", "bar1")
        .attr("x", (d) => this.xScale(d.state) + this.xScale.bandwidth() / 2)
        .attr("y", (d) => this.yScale(d.icu))
        .attr("width", this.xScale.bandwidth() / 2)
        .attr("fill", "green")
        .attr(
          "height",
          (d) =>
            this.svgHeight -
            this.svgPadding.top -
            this.svgPadding.bottom -
            this.yScale(d.icu)
        )
        .on("mouseover", this.showToolTip)
        .on("mouseout", this.deleteToolTip);

      barsGroup
        .append("rect")
        .attr("class", "bar2")
        .attr("x", (d) => this.xScale2(d.state))
        .attr("y", (d) => this.yScale2(d.smokers))
        .attr("width", this.xScale2.bandwidth() / 2)
        .attr("fill", "purple")
        .attr(
          "height",
          (d) =>
            this.svgHeight -
            this.svgPadding.top -
            this.svgPadding.bottom -
            this.yScale2(d.smokers)
        )
        .on("mouseover", this.showToolTip2)
        .on("mouseout", this.deleteToolTip);
    },
  },
  computed: {
    getBarData: {
      get() {
        return this.$store.getters.getBarData;
      },
    },
    dataMax() {
      return d3.max(this.getBarData, (d) => d.icu);
    },
    dataMin() {
      return d3.min(this.getBarData, (d) => d.smokers);
    },
    xScale() {
      return d3
        .scaleBand()
        .domain(this.getBarData.map((d) => d.state))
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
      return d3.max(this.getBarData, (d) => d.smokers);
    },
    dataMin2() {
      return d3.min(this.getBarData, (d) => d.smokers);
    },
    xScale2() {
      return d3
        .scaleBand()
        .domain(this.getBarData.map((d) => d.state))
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
