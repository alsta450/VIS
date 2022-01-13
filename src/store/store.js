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
    barData: new Set
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




      // let returnMap = new Map();
      // for (let i = 0; i < stateList.length; i++) {
      //   for (let i = state.covid_data - 1; i >= 0; --i) {
      //     if (!returnMap.has(state.covid[i].location)) {
      //       if (!state.covid[i].icu_patients == "") {
      //         returnMap.set(state.covid[i].location, {
      //           location: state.covid[i].location,
      //           smokers:
      //             +state.covid[i].male_smokers + +state.covid[i].female_smokers,
      //           icu_patients: +state.covid[i].icu_patients_per_million,
      //         });
      //       }
      //     }

      //   }
      //   returnMap.set(stateList[i],stateList[i]);
      // }
      // state.barData = Array.from(["test","tresdf"])
    }
  },
  getters: {
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
