<template>
  <div class="vis-component" ref="chart">
    <div class="placeholder"></div>
    <svg class="main-svg" ref="mainsvg" :width="svgWidth" :height="svgHeight">
      <g class="chart-group" ref="chartGroup">
        <g class="stateGroup" ref="stateGroup"></g>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";
import mapStatesUSA from "@/assets/us-states-geo.json";

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
    this.deleteArea();
    this.projectStates();
  },
  methods: {
    deleteArea() {
      d3.select(this.$refs.mainsvg).on("click", this.resetSelectedStates);
    },

    //The map svg has an ID, if we click somewhere not on this SVG, reset the selected states
    resetSelectedStates(event) {
      var reset = true;
      console.log(event.path);
      event.path.forEach((d) => {
        if (d.id == "deleteID") reset = false;
      });
      if (reset) {
        this.$store.commit("resetSelectedStates");
      }
    },
    //Create the map
    projectStates() {
      //The following lines (Line 55-59) are adapted from the link shown in the lessons: https://bl.ocks.org/cmgiven/abca90f6ba5f0a14c54d1eb952f8949c
      //Line 55-59
      var projection = d3
        .geoAlbersUsa()
        .scale([this.svgWidth + 200])
        .translate([this.svgWidth / 2, this.svgHeight / 2]);
      var path = d3.geoPath().projection(projection);
      var svg = d3
        .select(this.$refs.stateGroup)
        .append("svg")
        .attr("id", "deleteID")
        .attr("width", this.svgWidth)
        .attr("height", this.svgHeight);
      svg
        .selectAll("path")
        .data(mapStatesUSA.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "grey")
        .style("fill", (d) => {
          return this.$store.state.stateColor.get(d.properties.name);
        })
        .style("stroke-width", 1)
        .on("click", this.handleBarClick);
    },
    //Add state to selectedState
    handleBarClick(event, d) {
      this.$store.commit("changeSelectedState", d.properties.name);
    },
  },
  computed: {
    educationRates: {
      get() {
        return this.$store.getters.educationRates;
      },
    },
    personalIncome: {
      get() {
        return this.$store.getters.personalIncome;
      },
    },
    selectedStates: {
      get() {
        return this.$store.getters.selectedStates;
      },
    },
  },
  watch: {
    selectedStates: {
      handler() {
        this.projectStates();
      },
      deep: true,
    },
    stateColor: {
      handler() {
        this.projectStates();
      },
      deep: true,
    },
    personalIncome: {
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
