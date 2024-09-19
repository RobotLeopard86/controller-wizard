import actions from "./actions";
import { mutations } from "./muts";
import { createStore } from "vuex";

export default createStore({
	state: {
		value: {}
	},
	actions,
	mutations
});