import Map from '@dojo/shim/Map';
import Evented from '@dojo/core/Evented';

import { Strategy } from './Strategy';

/**
 * Interface that represents the action argument for a reducer
 */
export interface Action {
	type: string;
	payload?: any;
}

/**
 * State reducer function
 */
export interface StateReducer<S = any> {
	(state: S, payload: Action): S;
}

export class Store<S = any> extends Evented {

	private _state: S;
	private _reducers: StateReducer<S>[] = [];
	private _beforeActions = new Map<string, string[]>();
	private _afterActions = new Map<string, string[]>();
	private _beforeStrategyMap = new Map<string, Strategy[]>();
	private _afterStrategyMap = new Map<string, Strategy[]>();

	/**
	 * Register a reducer that will be executed when an action is dispatched.
	 * If a target is passed, the reducer will be executed against the specified
	 * section of the state.
	 */
	public registerReducers(reducer: StateReducer<S>, target?: string) {
		if (target) {
			this._reducers.push((newState: any, action: Action) => {
				const newStateSection = reducer(newState[target], action);
				return {
					...newState,
					[ target ]: newStateSection
				};
			});
		}
		else {
			this._reducers.push(reducer);
		}
	}

	public dispatch(action: Action) {
		const beforeStrategies = this._beforeStrategyMap.get(action.type);
		if (beforeStrategies) {
			Promise.all(beforeStrategies.map((strategy) => {
				return strategy.do(action.payload);
			})).then((results) => {
				const success = results.every((result: any) => result.status === 200);
				if (success) {
					this._dispatch(action);
				}
			});
		}
		else {
			this._dispatch(action);
		}
	}

	public getState(): Readonly<S> {
		return this._state;
	}

	public add(strategies: Strategy | Strategy[]) {
		strategies = Array.isArray(strategies) ? strategies : [ strategies ];
		strategies.forEach((strategy) => this._add(strategy));
	}

	private _add(strategy: Strategy) {
		if (strategy.optimistic) {
			strategy.triggerActions.forEach((actionType) => {
				const beforeStrategies = this._beforeStrategyMap.get(actionType);
				if (!beforeStrategies) {
					this._beforeStrategyMap.set(actionType, [ strategy ]);
				}
				else {
					this._beforeStrategyMap.set(actionType, beforeStrategies.concat(strategy));
				}
			});
		}
		else {
			strategy.triggerActions.forEach((actionType) => {
				const afterStrategies = this._afterStrategyMap.get(actionType);
				if (!afterStrategies) {
					this._afterStrategyMap.set(actionType, [ strategy ]);
					this.on(actionType, (action: Action) => {
						const strategies = this._afterStrategyMap.get(actionType);
						if (strategies) {
							Promise.all(strategies.map((strategy: Strategy) => strategy.do(action.payload)))
								.then((doResults) => {
									doResults.forEach((result: any, index) => {
									const payload = {
										original: action.payload,
										data: result
									};
									const actions = result.type === 'error' ?
										strategies[index].onFailureActions : strategies[index].onSuccessActions;
									actions.forEach((type) => {
										this.dispatch({ type, payload });
									});
								});
							});
						}
					});
				}
				else {
					this._afterStrategyMap.set(actionType, afterStrategies.concat(strategy));
				}
			});
		}
	}

	public beforeAction(action: string, beforeAction: string[]) {
		const existingBeforeActions = this._beforeActions.get(action);
		if (existingBeforeActions) {
			existingBeforeActions.concat(beforeAction);
		}
		else {
			this._beforeActions.set(action, beforeAction);
		}
	}

	public afterAction(action: string, afterActions: string[]) {
		const existingAfterActions = this._afterActions.get(action);
		if (existingAfterActions) {
			existingAfterActions.concat(afterActions);
		}
		else {
			this._afterActions.set(action, afterActions);
		}
	}

	public start(initialState?: S) {
		if (initialState) {
			this._state = initialState;
		}
		this.dispatch({ type: 'INITIAL' });
	}

	private _dispatch(action: Action) {
		this._state = this._reducers.reduce((newState, reducer) => {
			const beforeActions = this._beforeActions.get(action.type);
			const afterActions = this._afterActions.get(action.type);
			if (beforeActions) {
				newState = beforeActions.reduce((newState, beforeAction) => {
					return reducer(newState, { type: beforeAction, payload: action.payload });
				}, newState);
			}
			newState = reducer(newState, action);
			if (afterActions) {
				newState = afterActions.reduce((newState, afterAction) => {
					return reducer(newState, { type: afterAction, payload: action.payload });
				}, newState);
			}
			return newState;
		}, this._state);
		this.emit<any>({ type: action.type, payload: action.payload });
		this.emit({ type: 'invalidate' });
	}
}

export function createStore<S extends object>(): Store<S> {
	return new Store<S>();
}

export default createStore;
