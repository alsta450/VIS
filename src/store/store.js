import Vue from "vue";
import Vuex from "vuex";
import * as d3 from "d3";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    selectedYear: 2006,
    selectedStates: new Set,
    educationRates: [],
    personalIncome: [],
    stateColor: new Map(),
    covid_data: [],
    barData: new Set,
    lineData: []
  },
  mutations: {
    changeSelectedYear(state, year) {
      state.selectedYear = year;
    },
    changeSelectedState(state, val) {
      state.selectedStates.add(val);
    },
    addColorToState(state, map) {
      state.stateColor = map;
    },
    resetSelectedStates(state) {
      state.selectedStates = [];

    },
    removeState(state, val) {
      state.selectedStates.delete(val);
    },
    addbardata(state, val) {
      for (var i = state.covid_data.length - 1; i >= 0; --i) {
        if (val == state.covid_data[i].location) {
          if (! (state.covid_data[i].icu_patients_per_million == "")) {
            state.barData.add({
              state: val,
              icu: +state.covid_data[i].icu_patients_per_million,
              smokers: +state.covid_data[i].male_smokers + +state.covid_data[i].female_smokers
            }
            );
            break;
          }
        }
      }

    },

    addLineData(state,val){
      var tempMax = 0;
      var tempDate = NaN;
      var parseDate = d3.timeParse("%Y-%m-%d");
      var temp = {State: val, values:[],max:0, maxDate:parseDate("2000-01-01"), minDate:parseDate("2030-01-01")};
      for (var i = 0; i < state.covid_data.length; ++i) {
        if (val == state.covid_data[i].location) {
          tempDate = parseDate(state.covid_data[i].date);
          if(tempDate > temp["maxDate"]){
            temp["maxDate"] = tempDate;
          }
          if(tempDate < temp["minDate"]){
            temp["minDate"] = tempDate;
          }
          tempMax = +state.covid_data[i].new_cases_per_million;
          if(tempMax > temp["max"]){
            temp["max"] = tempMax;
          }
          temp["values"].push({year:parseDate(state.covid_data[i].date) ,cases: +state.covid_data[i].new_cases_per_million})
        }
      }
      state.lineData.push(temp);

    },

  },
  getters: {
    getLineData: (state) => state.lineData,
    getBarData: (state) => state.barData,
    covid(state) { return state.covid_data },
    selectedYear: (state) => state.selectedYear,
    selectedStates: (state) => state.selectedStates,
    educationRates(state) {
      let result = [];
      for (let i = 0; i < state.educationRates.length; i++) {
        if (state.selectedYear in state.educationRates[i]) {
          result.push({
            state: state.educationRates[i].State,
            value: +state.educationRates[i][state.selectedYear],
          });
        }
      }
      return result;
    },
    personalIncome(state) {
      let result = [];
      for (let i = 0; i < state.personalIncome.length; i++) {
        if (state.selectedYear in state.personalIncome[i]) {
          result.push({
            state: state.personalIncome[i].State,
            value: state.personalIncome[i][state.selectedYear],
          });
        }
      }
      return result;
    },
    getColor(state) {
      return state.stateColor;
    },

  },
  actions: {
    loadData({ state }) {
      d3.csv("./usa_ba-degree-or-higher_2006-2019.csv").then((data) => {
        state.educationRates = data;
      });

      d3.csv("./usa_personal-income-by-state_2006-2019.csv").then((data) => {
        state.personalIncome = data;
      });

      d3.csv("./owid-covid-data.csv").then((data) => {
        state.covid_data = data;
      });
    },
  },
});

export default store;
