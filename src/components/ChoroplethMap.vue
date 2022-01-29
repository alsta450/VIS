<template>
  <div class="vis-component" ref="chart">
    <div class="dropwdown" ref="dropwdown">
      <select id="Button" ref="button"></select>
    </div>
    <div id="reset">
      <button v-on:click="resetStates">Reset States</button>
    </div>
    <div class="placeholder"></div>
    <svg class="main-svg" ref="mainsvg" :width="svgWidth" :height="svgHeight">
      <g class="chart-group" ref="chartGroup">
        <g class="stateGroup" ref="stateGroup"></g>
      </g>
    </svg>
  </div>
</template>
<script src="https://unpkg.com/d3@4"></script>
<script src="https://unpkg.com/topojson-client@3"></script>
<script src="https://d3js.org/topojson.v2.min.js"></script>
<script src="https://unpkg.com/topojson@3"></script>
<script>
import * as topojson from "topojson";
import * as d3 from "d3";
import worldMap from "@/assets/countries-110m.json";

export default {
  name: "ChoroplethMap",
  props: {},
  data() {
    return {
      svgWidth: 500,
      svgHeight: 500,
      svgPadding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    };
  },
  mounted() {
    this.projectStates();
    this.showDropdown();
    this.handleDropdown();
  },
  methods: {


    resetStates() {
        this.$store.commit("resetSelectedStates");
    },

    showDropdown() {
      console.log(
        topojson.feature(worldMap, worldMap.objects.countries).features
      );
      //https://www.d3-graph-gallery.com/graph/line_select.html
      var save = "1";
      d3.select(this.$refs.button)
        .selectAll("countries")
        .data(
          this.sortStateName(
            topojson.feature(worldMap, worldMap.objects.countries).features
          )
        )
        .enter()
        .append("option")
        .text((d) => d.properties.name)
        .attr("value", (d) => d.properties.name);
    },

    handleDropdown(save) {
      d3.select(this.$refs.button).on("change", () => {
        this.handleDropdwonChange(d3.select("#Button").node().value);
      });
    },

    handleDropdwonChange(d) {
      this.$store.commit("changeSelectedState", d);
      this.$store.commit("addbardata", d);
      this.$store.commit("addLineData", d);
      this.projectStates();
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
        .text(data.properties.name)
        .style("position", "absolute");
    },
    deleteToolTip() {
      d3.select(".tooltip").remove();
    },
    handleBarClick(event, d) {
      if (this.getSelectedState.includes(d.properties.name)) {
        this.$store.commit("removeState", d.properties.name);
      } else {
        this.$store.commit("changeSelectedState", d.properties.name);
      }
      this.$store.commit("addbardata", d.properties.name);
      this.$store.commit("addLineData", d.properties.name);
      // console.log(this.$store.getters.selectedStates);
      this.projectStates();
    },

    //Create the map
    projectStates() {
      //The following lines (Line 55-59) are adapted from the link shown in the lessons: https://bl.ocks.org/cmgiven/abca90f6ba5f0a14c54d1eb952f8949c
      //Line 55-59

      var projection = d3
        .geoMercator()
        .scale([this.svgWidth - 430])
        .translate([this.svgWidth / 2, this.svgHeight / 1.5]);
      var path = d3.geoPath().projection(projection);

      var svg = d3
        .select(this.$refs.mainsvg)
        .append("svg")
        .attr("class", "worldmap")
        //.attr("position", "absolute")
        .attr("width", this.svgWidth)
        .attr("height", this.svgHeight);
      //https://bl.ocks.org/piwodlaiwo/3734a1357696dcff203a94012646e932

      svg
        .selectAll("path")
        .data(topojson.feature(worldMap, worldMap.objects.countries).features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "grey")
        .on("click", this.handleBarClick)
        .on("mouseover", this.showToolTip)
        .on("mouseout", this.deleteToolTip)
        .style("fill", (d, i) => {
          if (this.getSelectedState.includes(d.properties.name))
            return this.getColors(i);
          return "white";
        });
    },

    sortStateName() {
      return topojson
        .feature(worldMap, worldMap.objects.countries)
        .features.sort(function (x, y) {
          return d3.ascending(x.properties.name, y.properties.name);
        });
    },
  },
  computed: {
    getColors() {
      return d3.scaleOrdinal(d3.schemeDark2);
    },
    getSelectedState: {
      get() {
        return this.$store.getters.selectedStates;
      },
    },
  },
  watch: {
    getSelectedState: {
      handler() {
        this.projectStates();
      },
      deep: true,
    },
    handleBarClick: {
      handler() {
        this.projectStates();
      },
      deep: true,
    },
  },
};
</script>

<style>
</style>
