
/**
 * Mapper from state to a resource
 */
export type To<R = any, S = any> =	(state: S) => R;

/**
 * Mapper from a resource to state
 */
export type From<R = any, S = any> = (resource: R) => S;

/**
 * Transport function
 */
export type Transport<R = any, S = any> = (to: To<R, S>, from: From<R, S>, state: S) => Promise<any>;

/**
 * Actions for strategies
 */
export interface StrategyActions {
	triggers: string[];
	onSuccess?: string[];
	onFailure?: string[];
}

/**
 * Strategy Options
 */
export interface StrategyOptions<R, S> {
	to: To<R, S>;
	from: From<R, S>;
	transport: Transport<R, S>;
	actions: StrategyActions;
	optimistic?: boolean;
}

/**
 * Resource Strategy Wrapper
 */
export class Strategy<R = any, S = any> {
	private _to: To<R, S>;
	private _from: From<R, S>;
	private _transport: Transport<R, S>;
	private _triggers: string[];
	private _onSuccess: string[];
	private _onFailure: string[];
	private _optimistic: boolean;

	constructor(options: StrategyOptions<R, S>) {
		this._to = options.to;
		this._from = options.from;
		this._transport = options.transport;
		this._onSuccess = options.actions.onSuccess || [];
		this._onFailure = options.actions.onFailure || [];
		this._triggers = options.actions.triggers;
		this._optimistic = options.optimistic || false;
	}

	/**
	 * Execute strategy transport
	 * @param state The payload of the trigger action
	 */
	do(state: S): Promise<Error> | Promise<object> {
		return new Promise((resolve) => {
			return this._transport(this._to, this._from, state).then(resolve, (error: Error) => resolve(error));
		});
	}

	get onSuccessActions(): string[] {
		return this._onSuccess;
	}

	get onFailureActions(): string[] {
		return this._onFailure;
	}

	get triggerActions(): string[] {
		return this._triggers;
	}

	get optimistic(): boolean {
		return this._optimistic;
	}
}

export default Strategy;
