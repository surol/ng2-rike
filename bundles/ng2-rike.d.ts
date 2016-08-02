/// <reference types="core-js" />
declare module "ng2-rike/protocol" {
    import { Response, RequestOptionsArgs } from "@angular/http";
    /**
     * Error response.
     *
     * All error handlers operates over it.
     *
     * Typical error handler extends this interface with handler-specific fields and fills them.
     */
    export interface ErrorResponse {
        /**
         * HTTP response.
         */
        response: Response;
        /**
         * Arbitrary error object.
         *
         * This field is filled when HTTP returns something different from `Response` object.
         */
        error?: any;
    }
    /**
     * REST-like operations protocol.
     *
     * It is used by REST-like operations to encode operation requests to HTTP, decode operation responses from HTTP,
     * and handle errors.
     *
     * `IN` is operation request type.
     * `OUT` is operation response type.
     */
    export abstract class Protocol<IN, OUT> {
        /**
         * Prepares HTTP request.
         *
         * The `options` passed have at least `url` and `method` fields set.
         *
         * This method is called for each HTTP request before _writeRequest_ method. When default protocol is set for
         * operation target, this method is called first on the default protocol, and then - on the operation protocol.
         *
         * @param options original HTTP request options.
         *
         * @returns modified HTTP request options to use further instead of original ones. Returns unmodified request
         * `options` by default.
         */
        prepareRequest(options: RequestOptionsArgs): RequestOptionsArgs;
        /**
         * Writes operation request as HTTP request.
         *
         * This method is invoked only for HTTP request methods that expect request body.
         *
         * The `options` are the result of `prepareRequest` method invocation. It is expected the result options to
         * contain a `body` field set.
         *
         * @param request operation request to encode
         * @param options original HTTP request options.
         *
         * @return modified HTTP request options that will be used to perform actual request.
         */
        abstract writeRequest(request: IN, options: RequestOptionsArgs): RequestOptionsArgs;
        /**
         * Reads operation response from HTTP response.
         *
         * @param response HTTP response.
         *
         * @returns operation response.
         */
        abstract readResponse(response: Response): OUT;
        /**
         * Handles HTTP error.
         *
         * Does not modify error response by default.
         *
         * @param error error response to handle.
         *
         * @returns error processing result.
         */
        handleError(error: ErrorResponse): ErrorResponse;
        /**
         * Creates protocol addon able to prepend protocol actions with specified functions.
         *
         * @return {ProtocolAddon<IN, OUT>} protocol addon.
         */
        prior(): ProtocolAddon<IN, OUT>;
        /**
         * Creates protocol addon able to append specified functions to protocol actions.
         *
         * @return {ProtocolAddon<IN, OUT>} protocol addon.
         */
        then(): ProtocolAddon<IN, OUT>;
        /**
         * Creates protocol modifier able to replace protocol actions with specified functions.
         *
         * @return {ProtocolMod<IN, OUT>} protocol modifier.
         */
        instead(): ProtocolMod<IN, OUT>;
    }
    /**
     * Protocol addon. It is able to construct new protocol based on original one by adding specified actions to original
     * ones.
     */
    export interface ProtocolAddon<IN, OUT> {
        /**
         * Constructs new protocol based on this one, which prepares requests with the given function.
         *
         * @param prepare a request preparation function invoked in addition to `Protocol.prepareRequest` method.
         *
         * @return {Protocol<IN, OUT>} new protocol.
         */
        prepareRequest(prepare: (options: RequestOptionsArgs) => RequestOptionsArgs): Protocol<IN, OUT>;
        /**
         * Constructs new protocol based on original one, which updates request options with the given function.
         * The request will be written with original `Protocol.writeRequest()` method.
         *
         * @param update a function updating request options in addition to `Protocol.writeRequest()` method.
         *
         * @return {Protocol<IN, OUT>} new protocol.
         */
        updateRequest(update: (request: IN, options: RequestOptionsArgs) => RequestOptionsArgs): Protocol<IN, OUT>;
        /**
         * Constructs new protocol based on original one, which handles errors with the given function.
         *
         * @param handle a function handling errors in addition to `Protocol.handleError()` method.
         *
         * @return {Protocol<IN, OUT>} new protocol.
         */
        handleError(handle: (error: ErrorResponse) => ErrorResponse): Protocol<IN, OUT>;
        /**
         * Constructs new protocol based on original onw, which prepares requests and handles errors with corresponding
         * `protocol` methods in addition to original ones.
         *
         * @param protocol {Protocol<IN, OUT>} new protocol.
         */
        apply(protocol: Protocol<any, any>): Protocol<IN, OUT>;
    }
    /**
     * Protocol modifier. It is able to construct new protocol based on original one by replacing protocol actions with
     * specified ones.
     */
    export interface ProtocolMod<IN, OUT> {
        /**
         * Constructs new protocol based on original one, which prepares the request with the given function.
         *
         * @param prepare a request preparation function invoked instead of `Protocol.prepareRequest` method.
         *
         * @return {Protocol<IN, OUT>} new protocol.
         */
        prepareRequest(prepare: (options: RequestOptionsArgs) => RequestOptionsArgs): Protocol<IN, OUT>;
        /**
         * Constructs new protocol based on original one, which writes the request with the given function.
         *
         * @param write new request writer function.
         *
         * @return {Protocol<I, OUT>} new protocol.
         */
        writeRequest<I>(write: (request: I, options: RequestOptionsArgs) => RequestOptionsArgs): Protocol<I, OUT>;
        /**
         * Constructs new protocol based on original one, which reads responses with the given function.
         *
         * @param read new response reader function.
         *
         * @return {Protocol<IN, O>} new protocol.
         */
        readResponse<O>(read: (response: Response) => O): Protocol<IN, O>;
        /**
         * Constructs new protocol based on original one, which handles errors with the given function.
         *
         * @param handle a function handling errors instead of `Protocol.handleError()` method.
         *
         * @return {Protocol<IN, OUT>} new protocol.
         */
        handleError(handle: (error: ErrorResponse) => ErrorResponse): Protocol<IN, OUT>;
    }
    /**
     * JSON protocol.
     *
     * Sends and receives arbitrary data as JSON over HTTP.
     *
     * @type {Protocol<any>}
     */
    export const JSON_PROTOCOL: Protocol<any, any>;
    /**
     * Returns JSON protocol.
     *
     * Sends and receives the data of the given type as JSON over HTTP.
     */
    export const jsonProtocol: (<IN, OUT>() => Protocol<IN, OUT>);
    /**
     * HTTP protocol.
     *
     * The request type is any. It is used as request body.
     *
     * @type {Protocol<any, Response>}
     */
    export const HTTP_PROTOCOL: Protocol<any, Response>;
}
declare module "ng2-rike/event" {
    import { EventEmitter } from "@angular/core";
    import { RikeTarget, RikeOperation } from "ng2-rike/rike";
    import { ErrorResponse } from "ng2-rike/protocol";
    /**
     * REST-like resource access event emitter.
     *
     * Multiple instances of this class could be injected into controller or service to listen for Rike events.
     *
     * Use [provideEventSource] function to register event sources.
     */
    export abstract class RikeEventSource {
        /**
         * Rike events emitter.
         */
        readonly abstract rikeEvents: EventEmitter<RikeEvent>;
    }
    /**
     * Basic REST-like resource access event.
     *
     * Such events are emitted by [Rike event sources][RikeEventsSource].
     */
    export abstract class RikeEvent {
        /**
         * Operation target.
         */
        readonly target: RikeTarget<any, any>;
        /**
         * Rike operation.
         */
        readonly abstract operation: RikeOperation<any, any>;
        /**
         * Whether an operation is complete.
         *
         * `true` on error or successful completion event.
         */
        readonly abstract complete: boolean;
        /**
         * The error occurred.
         *
         * `undefined` if this is not an error event.
         */
        readonly abstract error?: any;
        /**
         * Error response.
         */
        readonly abstract errorResponse?: ErrorResponse;
        /**
         * Whether this is an operation cancel.
         *
         * @return {boolean} `true` if operation cancelled, or `false` otherwise.
         */
        readonly cancel: boolean;
        /**
         * The operation that cancelled this operation.
         */
        readonly abstract cancelledBy?: RikeOperationEvent;
        /**
         * Operation result, if any.
         */
        readonly abstract result?: any;
    }
    /**
     * An event emitted when operation on a REST-like resource is started.
     */
    export class RikeOperationEvent extends RikeEvent {
        private _operation;
        constructor(_operation: RikeOperation<any, any>);
        readonly operation: RikeOperation<any, any>;
        readonly complete: boolean;
        readonly error: undefined;
        readonly errorResponse: undefined;
        readonly cancelledBy: undefined;
        readonly result: undefined;
    }
    /**
     * An event emitted when operation on a REST-like resource is successfully completed.
     */
    export class RikeSuccessEvent extends RikeEvent {
        private _operation;
        private _result;
        constructor(_operation: RikeOperation<any, any>, _result: any);
        readonly operation: RikeOperation<any, any>;
        readonly complete: boolean;
        readonly error: undefined;
        readonly errorResponse: undefined;
        readonly cancelledBy: undefined;
        readonly result: any;
    }
    /**
     * An event emitted when operation on a REST-like resource is failed.
     *
     * An object of this type is also reported as an error when some internal exception occurs.
     */
    export abstract class RikeErrorEvent extends RikeEvent {
        private _operation;
        private _error;
        constructor(_operation: RikeOperation<any, any>, _error: any);
        readonly operation: RikeOperation<any, any>;
        readonly complete: boolean;
        readonly error: any;
        readonly errorResponse: ErrorResponse | undefined;
        readonly cancelledBy: RikeOperationEvent | undefined;
        readonly result: undefined;
    }
    /**
     * An event emitted when operation on a REST-like resource caused an exception.
     *
     * An object of this type is reported as an error.
     */
    export class RikeExceptionEvent extends RikeErrorEvent {
        private _errorResponse?;
        constructor(operation: RikeOperation<any, any>, error: any, _errorResponse?: ErrorResponse);
        readonly errorResponse: ErrorResponse | undefined;
    }
    /**
     * An event emitted when operation on a REST-like resource returned error.
     */
    export class RikeErrorResponseEvent extends RikeErrorEvent {
        private _errorResponse;
        constructor(operation: RikeOperation<any, any>, _errorResponse: ErrorResponse);
        readonly errorResponse: ErrorResponse;
    }
    /**
     * An event emitted when operation on a REST-like resource is cancelled.
     */
    export class RikeCancelEvent extends RikeErrorEvent {
        private _cancelledBy?;
        constructor(operation: RikeOperation<any, any>, _cancelledBy?: RikeOperationEvent);
        readonly error: RikeOperationEvent | undefined;
        readonly cancel: boolean;
        readonly cancelledBy: RikeOperationEvent | undefined;
    }
}
declare module "ng2-rike/status-collector" {
    import { EventEmitter } from "@angular/core";
    import { RikeTarget } from "ng2-rike/rike";
    import { RikeEvent, RikeEventSource } from "ng2-rike/event";
    /**
     * Rike operation status labels.
     *
     * Each field corresponds to particular status. The value of this field could be either label, or function returning
     * label, accepting Rike operations target as the only argument.
     *
     * When the label is absent the corresponding status won't be displayed.
     *
     * @param <L> a type of status labels.
     */
    export interface StatusLabels<L> {
        /**
         * Processing label. It is applied when operation is initiated, but not completed yet.
         */
        processing?: L | ((target: RikeTarget<any, any>) => L);
        /**
         * Failure label. It is applied when operation failed due to error.
         */
        failed?: L | ((target: RikeTarget<any, any>) => L);
        /**
         * Cancellation label. It is applied when operation is cancelled.
         */
        cancelled?: L | ((target: RikeTarget<any, any>) => L);
        /**
         * Success label. It is applied when operation succeed.
         */
        succeed?: L | ((target: RikeTarget<any, any>) => L);
    }
    /**
     * A map of Rike operations status labels.
     *
     * Each key corresponds to particular operation name, and it value is status labels to apply to this operation.
     *
     * If labels for the given operation is not specified, or the is no label for the operation status, the label will be
     * searched under the `"*"` key.
     *
     * @param <L> a type of status labels.
     */
    export interface StatusLabelMap<L> {
        [operation: string]: StatusLabels<L>;
    }
    /**
     * Default map of Rike operations status labels.
     *
     * Default status labels are strings.
     */
    export const DEFAULT_STATUS_LABELS: StatusLabelMap<string>;
    /**
     * Rike operations status collecting service.
     *
     * It collects statuses of all available [Rike event sources][RikeEventSource].
     *
     * This service is registered automatically along with every event source by `provideEventSource()` method.
     * But unlike event sources it is not a multi-provider.
     *
     * An instance of this class could be created on its own. Then it is necessary to subscribe it on Rike events with
     * `subscribeOn` method.
     *
     * It is possible to read statuses and string labels from the service itself. Alternatively a view can be created
     * to read labels of arbitrary type.
     */
    export class StatusCollector {
        private _views;
        private _targetStatuses;
        private _defaultView?;
        private _viewIdSeq;
        constructor(eventSources?: RikeEventSource[]);
        /**
         * Current status labels.
         *
         * @return {string[]} array of string labels.
         */
        readonly labels: string[];
        /**
         * Whether some operation is in process.
         */
        readonly processing: boolean;
        /**
         * Whether some operation failed.
         */
        readonly failed: boolean;
        /**
         * Whether some operation cancelled.
         */
        readonly cancelled: boolean;
        /**
         * Whether some operation succeed.
         */
        readonly succeed: boolean;
        /**
         * Subscribes this collector on the given Rike events emitter.
         *
         * @param events Rike events emitter to subscribe on.
         */
        subscribeOn(events: EventEmitter<RikeEvent>): void;
        /**
         * Constructs a Rike operations status view.
         *
         * When the view is no longer needed a {{StatusView.close}} method should be called to release resources
         * associated with it.
         *
         * @param <L> a type of status labels.
         * @param labels a map of Rike operations status labels to use by this view.
         *
         * @return {StatusView<L>} new status view.
         */
        view<L>(labels: StatusLabelMap<L>): StatusView<L>;
        private addView<L>(id, labels);
        private applyEvent(event);
        private initDefaultView(event);
        private updateTargetStatuses(event);
        private resetViews();
    }
    /**
     * Rike operations status view.
     *
     * It could be created by {{StatusCollector.view}} and will be updated with new statuses until the `close()`
     * method call.
     *
     * @param <L> a type of status labels.
     */
    export interface StatusView<L> {
        /**
         * Current status labels.
         *
         * @return {L[]} array of status labels.
         */
        readonly labels: L[];
        /**
         * Whether some operation is in process.
         */
        readonly processing: boolean;
        /**
         * Whether some operation failed.
         */
        readonly failed: boolean;
        /**
         * Whether some operation cancelled.
         */
        readonly cancelled: boolean;
        /**
         * Whether some operation succeed.
         */
        readonly succeed: boolean;
        /**
         * Registers new operation status labels.
         *
         * @param labels a map of operation status labels.
         */
        withLabels(labels: StatusLabelMap<L>): this;
        /**
         * Registers new status labels for the given operation.
         *
         * @param operation target operation name.
         * @param labels operation status labels.
         */
        withOperationLabels(operation: string, labels: StatusLabels<L>): this;
        /**
         * Closes the view.
         *
         * This method should be called when the view is no longer needed. After it is called the view won't be updated
         * any more.
         */
        close(): void;
    }
}
declare module "ng2-rike/options" {
    import { Protocol } from "ng2-rike/protocol";
    import { StatusLabels } from "ng2-rike/status-collector";
    /**
     * Constructs URL relative to base URL.
     *
     * @param baseUrl base URL.
     * @param url URL.
     *
     * @returns {string} If `baseUrl` is not specified, or empty string, or `url` is absolute, then returns unmodified `url`.
     * Otherwise concatenates `baseUrl` and `url` separating them by `/` sign.
     */
    export function relativeUrl(baseUrl: string | undefined, url: string): string;
    /**
     * Global Rike options interface.
     */
    export interface RikeOptionsArgs {
        /**
         * Base URL of all relative URLs.
         *
         * All relative Rike request URLs will be resolved against this one.
         */
        readonly baseUrl?: string;
        /**
         * Default operations protocol.
         *
         * If not specified then `HTTP_PROTOCOL` will be used.
         */
        readonly defaultProtocol?: Protocol<any, any>;
        /**
         * A map of Rike operations status labels to use by default.
         *
         * If not specified the `DEFAULT_STATUS_LABELS` will be used.
         *
         * Default status labels are always strings.
         */
        readonly defaultStatusLabels?: {
            [operation: string]: StatusLabels<any>;
        };
    }
    /**
     * Global Rike options.
     *
     * To overwrite global options add a provider for {{BaseRikeOptions}} instance with {{RikeOptions}} as token:
     * ```ts
     * bootstrap(AppComponent, {provide: RikeOptions, new BaseRikeOptions({baseUrl: "/rike"})});
     * ```
     */
    export abstract class RikeOptions implements RikeOptionsArgs {
        readonly abstract baseUrl?: string;
        readonly abstract defaultProtocol: Protocol<any, any>;
        abstract defaultStatusLabels: {
            [operation: string]: StatusLabels<string>;
        };
        /**
         * Constructs URL relative to `baseUrl`.
         *
         * @param url URL
         *
         * @returns {string} resolved URL.
         */
        relativeUrl(url: string): string;
    }
    /**
     * Basic [global resource options][RikeOptions] implementation.
     *
     * Can be used to override the global resource options.
     */
    export class BaseRikeOptions extends RikeOptions {
        private _baseUrl?;
        private _defaultProtocol;
        private _defaultStatusLabels;
        constructor(opts?: RikeOptionsArgs);
        readonly baseUrl: string | undefined;
        readonly defaultProtocol: Protocol<any, any>;
        readonly defaultStatusLabels: {
            [operation: string]: StatusLabels<string>;
        };
    }
    /**
     * Default resource options.
     *
     * @type {RikeOptions}
     */
    export const DEFAULT_RIKE_OPTIONS: RikeOptions;
}
declare module "ng2-rike/rike" {
    import { EventEmitter } from "@angular/core";
    import { Request, RequestOptionsArgs, Response, Http, RequestMethod, RequestOptions } from "@angular/http";
    import { Observable } from "rxjs/Rx";
    import { RikeEvent, RikeEventSource } from "ng2-rike/event";
    import { RikeOptions } from "ng2-rike/options";
    import { Protocol } from "ng2-rike/protocol";
    export function requestMethod(method: string | RequestMethod): RequestMethod;
    /**
     * REST-like resource operations service.
     *
     * This service can be injected to other services or components.
     *
     * It basically mimics the `Http` interface, but also honors [global Rike options][RikeOptions].
     *
     * It can also be used to perform operations on particular targets.
     */
    export class Rike implements RikeEventSource {
        private _http;
        private readonly _options;
        private readonly _rikeEvents;
        private readonly _internals;
        private _uniqueIdSeq;
        constructor(_http: Http, defaultHttpOptions: RequestOptions, _options?: RikeOptions);
        /**
         * Global REST-like resource access options.
         *
         * @returns {RikeOptions} either pre-configured, or [default][DEFAULT_RIKE_OPTIONS] options.
         */
        readonly options: RikeOptions;
        /**
         * Default Rike protocol.
         *
         * @return {Protocol<any, any>} either {{RikeOptions.defaultProtocol}}, or `HTTP_PROTOCOL`.
         */
        readonly defaultProtocol: Protocol<any, any>;
        /**
         * All REST-like resource operation events emitter.
         *
         * @returns {EventEmitter<RikeEvent>}
         */
        readonly rikeEvents: EventEmitter<RikeEvent>;
        request(request: string | Request, options?: RequestOptionsArgs): Observable<Response>;
        get(url: string, options?: RequestOptionsArgs): Observable<Response>;
        post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;
        put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;
        delete(url: string, options?: RequestOptionsArgs): Observable<Response>;
        patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;
        head(url: string, options?: RequestOptionsArgs): Observable<Response>;
        /**
         * Constructs operation target which operates over `HTTP_PROTOCOL`.
         *
         * Arbitrary value can be used as a request body.
         *
         * @param target arbitrary target value.
         *
         * @returns {RikeTarget} new operation target.
         */
        target(target: any): RikeTarget<any, Response>;
        /**
         * Constructs operations target which operates over the given protocol.
         *
         * @param target arbitrary target value.
         * @param protocol operations protocol.
         *
         * @return {RikeTarget<I, O>} new operations target.
         */
        target<I, O>(target: any, protocol: Protocol<I, O>): RikeTarget<I, O>;
        /**
         * Constructs operations target which operates over [JSON protocol][jsonProtocol].
         *
         * @param target arbitrary target value.
         *
         * @return {RikeTarget<I, O>} new operations target.
         */
        json<I, O>(target: any): RikeTarget<I, O>;
        /**
         * Updates HTTP request options accordingly to global _options_.
         *
         * @param options HTTP request options to update.
         *
         * @returns {RequestOptionsArgs} either new HTTP options instance, or the _options_ argument if no modifications
         * done.
         */
        protected updateRequestOptions(options?: RequestOptionsArgs): RequestOptionsArgs | undefined;
        private prepareRequest(options?);
        /**
         * Wraps the HTTP response observable for the given operation to make it handle errors.
         *
         * @param response response observer to wrap.
         *
         * @returns {Observable<Response>} response observer wrapper.
         */
        private handleErrors(response);
    }
    /**
     * REST-like operations target.
     *
     * Operation targets are created using [Rike.target] method. The actual operations should be created first with
     * `operation` method.
     *
     * Only one operation can be performed on a target at a time. Whenever a new operation on the same target is initiated,
     * the previous one is cancelled.
     *
     * `IN` is a request type this target's operations accept by default.
     * `OUT` is a response type this target's operations return by default.
     */
    export abstract class RikeTarget<IN, OUT> implements RikeEventSource {
        /**
         * `Rike` service instance.
         */
        readonly abstract rike: Rike;
        /**
         * Operation target value.
         *
         * This is the value passed to the [Rike.target] method.
         */
        readonly abstract target: any;
        /**
         * Unique target identifier.
         */
        readonly abstract uniqueId: string;
        /**
         * A currently evaluating operation.
         *
         * `undefined` if no operations currently in process, i.e. operation not started, cancelled, or completed, either
         * successfully or with error.
         */
        readonly abstract currentOperation?: RikeOperation<any, any>;
        /**
         * An emitter of events for operations performed on this target.
         */
        readonly abstract rikeEvents: EventEmitter<RikeEvent>;
        /**
         * An operations protocol to use by default.
         *
         * This is a protocol based on the one passed to [Rike.target] method, which honors {{Rike.defaultProtocol}}.
         */
        readonly abstract protocol: Protocol<IN, OUT>;
        /**
         * Base URL to use by operations.
         */
        readonly abstract baseUrl?: string;
        /**
         * Assigns base URL to use by operations.
         *
         * This URL can be absolute, or relative to the one specified in the [global options][RikeOptions.baseUrl].
         *
         * @param url new base URL or `undefined` to reset it.
         */
        abstract withBaseUrl(url?: string): this;
        /**
         * Constructs an operation on this target which operates over the target's `protocol`.
         *
         * @param name operation name.
         *
         * @return {RikeOperation<IN, OUT>} new operation.
         */
        abstract operation(name: string): RikeOperation<IN, OUT>;
        /**
         * Constructs an operation on this target which operates over the given protocol.
         *
         * @param name operation name.
         * @param protocol operation protocol.
         *
         * @return {RikeOperation<I, O>} new operation.
         */
        abstract operation<I, O>(name: string, protocol: Protocol<I, O>): RikeOperation<I, O>;
        /**
         * Constructs JSON operation on this target.
         *
         * It operates over [JSON protocol][jsonProtocol].
         *
         * @param name operation name.
         *
         * @return {RikeOperation<T, T>} new operation.
         */
        json<I, O>(name: string): RikeOperation<I, O>;
        /**
         * Cancels current operation, if any.
         *
         * @return `true` if operation cancelled, or `false` if there is no operation to cancel.
         */
        abstract cancel(): boolean;
    }
    /**
     * REST-like resource operation.
     *
     * It operates over the given protocol and emits events.
     *
     * To initiate operation just call any of the HTTP access methods. Note that operation always belongs to its target
     * and thus two operations could not be initiated simultaneously.
     *
     * `IN` is a type of requests this operation accepts.
     * `OUT` is a type of responses this operation produces.
     */
    export abstract class RikeOperation<IN, OUT> {
        /**
         * Operation target.
         */
        readonly abstract target: RikeTarget<any, any>;
        /**
         * Operation name.
         */
        readonly abstract name: string;
        /**
         * Operation protocol.
         *
         * This protocol is based on the one passed to the [RikeTarget.operation], but also honors the default protocol
         * set for target.
         */
        readonly abstract protocol: Protocol<IN, OUT>;
        readonly abstract options: RequestOptions;
        abstract withOptions(options?: RequestOptionsArgs): this;
        readonly url: string | undefined;
        withUrl(url: string): this;
        readonly method: RequestMethod | undefined;
        withMethod(method: string | RequestMethod): this;
        abstract load(url?: string, options?: RequestOptionsArgs): Observable<OUT>;
        abstract send(request: IN, url?: string, options?: RequestOptionsArgs): Observable<OUT>;
        abstract get(url?: string, options?: RequestOptionsArgs): Observable<OUT>;
        abstract post(request: IN, url?: string, options?: RequestOptionsArgs): Observable<OUT>;
        abstract put(request: IN, url?: string, options?: RequestOptionsArgs): Observable<OUT>;
        abstract delete(url?: string, options?: RequestOptionsArgs): Observable<OUT>;
        abstract patch(request: IN, url?: string, options?: RequestOptionsArgs): Observable<OUT>;
        abstract head(url?: string, options?: RequestOptionsArgs): Observable<OUT>;
    }
}
declare module "ng2-rike/status.component" {
    import { OnDestroy } from "@angular/core";
    import { StatusLabels, StatusCollector, StatusView } from "ng2-rike/status-collector";
    export class RikeStatusComponent<L> implements OnDestroy {
        private _collector;
        private _statusLabels?;
        private _statusView?;
        private _ownStatusView;
        private _labelText;
        private _labelClass;
        constructor(_collector: StatusCollector);
        readonly collector: StatusCollector;
        readonly statusView: StatusView<L>;
        rikeStatus: StatusView<L> | undefined;
        rikeStatusLabels: {
            [operation: string]: StatusLabels<L>;
        } | undefined;
        rikeStatusLabelText: (label: L) => string;
        rikeStatusLabelClass: (status: StatusView<L>) => string;
        readonly cssClass: string;
        readonly text: string | undefined;
        ngOnDestroy(): void;
        protected createStatusView(): StatusView<L>;
        private releaseStatusView();
    }
}
declare module "ng2-rike/field-error" {
    import { ErrorResponse } from "ng2-rike/protocol";
    /**
     * Error response.
     *
     * Any object can be converted to `ErrorResponse` with `toErrorResponse()` function.
     */
    export interface FieldErrorResponse extends ErrorResponse {
        /**
         * Field errors.
         */
        fieldErrors: FieldErrors;
    }
    /**
     * Field errors.
     *
     * Any field of this object is an arrays of errors corresponding to this field. Such array should never be empty.
     *
     * The special case is field named `"*"`. It contains errors not related to particular field.
     */
    export interface FieldErrors {
        [field: string]: FieldError[];
    }
    /**
     * Field error.
     */
    export interface FieldError {
        /**
         * Optional error code.
         */
        code?: string;
        /**
         * Error message.
         */
        message: string;
    }
    /**
     * Appends field errors to {{ErrorResponse}}.
     *
     * If field errors already present in `ErrorResponse` then does nothing.
     *
     * This function can be used as {{Protocol}} error handler error handler.
     *
     * @param error object to convert.
     *
     * @return {FieldErrorResponse} constructed error httpResponse.
     */
    export function addFieldErrors(error: ErrorResponse): FieldErrorResponse;
}
declare module "ng2-rike/error-collector" {
    import { EventEmitter } from "@angular/core";
    import { AnonymousSubscription } from "rxjs/Subscription";
    import { FieldErrors } from "ng2-rike/field-error";
    import { RikeEventSource, RikeEvent, RikeErrorEvent } from "ng2-rike/event";
    /**
     * Field errors subscription.
     *
     * The `unsubscribe()` method should be called to stop receiving error notifications.
     */
    export interface ErrorSubscription {
        /**
         * After this method called the error notifications won't be sent to subscriber.
         *
         * This method should be called in order to release all resources associated with subscription.
         */
        unsubscribe(): void;
        /**
         * Request field errors to be updated by notifying the subscriber.
         *
         * Does nothing after `unsubscribe()` method called.
         */
        refresh(): this;
    }
    /**
     * An error collecting service.
     *
     * It collects errors from all available [Rike event sources][RikeEventSource]. It uses `fieldErrors()` method
     * to obtain a `FieldErrors` instance from {{RikeErrorEvent}}. Then it notifies all subscribers on when errors received
     * or removed.
     *
     * This service is registered automatically along with every event source by `provideEventSource()` function.
     * But unlike event sources it is not a multi-provider.
     *
     * An instance of this class could be created on its own. Then it is necessary to subscribe it on Rike events with
     * `subscribeOn` method.
     */
    export class ErrorCollector {
        private _eventSources?;
        private readonly _emitters;
        private readonly _targetErrors;
        private _initialized;
        constructor(_eventSources?: RikeEventSource[]);
        /**
         * Subscribes this collector on the given Rike events emitter.
         *
         * @param events Rike events emitter to subscribe on.
         */
        subscribeOn(events: EventEmitter<RikeEvent>): AnonymousSubscription;
        /**
         * Adds subscription for errors corresponding to the given field.
         *
         * If the field name is `"*"`, then subscriber will be notified on error changes for all fields except those ones
         * with existing subscriptions.
         *
         * @param field target field name.
         * @param next function that will be called on every target field errors update.
         * @param error function that will be called on errors.
         * @param complete function that will be called when no more errors will be reported.
         *
         * @return {ErrorSubscription} subscription.
         */
        subscribe(field: string, next: ((errors: FieldErrors) => void), error?: (error: any) => void, complete?: () => void): ErrorSubscription;
        /**
         * Adds subscription for errors corresponding to all fields except those ones with existing subscriptions.
         *
         * Calling this method is the same as calling `subscribe("*", next, error, complete);`.
         *
         * @param next function that will be called on every errors update.
         * @param error function that will be called on errors.
         * @param complete function that will be called when no more errors will be reported.
         *
         * @return {ErrorSubscription} subscription.
         */
        subscribeForRest(next: ((errors: FieldErrors) => void), error?: (error: any) => void, complete?: () => void): ErrorSubscription;
        /**
         * Converts error to `FieldErrors`.
         *
         * This method uses `addFieldErrors` function by default. Override it if you are using custom error handler.
         *
         * @param error arbitrary error passed in [RikeEvent.error] field.
         *
         * @return {FieldErrors} field errors.
         */
        protected fieldErrors(error: RikeErrorEvent): FieldErrors;
        private fieldEmitter(field);
        private init();
        private handleEvent(event);
        private handleError(error);
        private targetErrors(target);
        private clearTargetErrors(target);
        private notify(field);
    }
}
declare module "ng2-rike/errors.component" {
    import { OnInit, OnDestroy } from "@angular/core";
    import { ErrorCollector } from "ng2-rike/error-collector";
    import { FieldErrors, FieldError } from "ng2-rike/field-error";
    export class RikeErrorsComponent implements OnInit, OnDestroy {
        private _collector?;
        private _rikeErrorsField;
        private _errors;
        private _init;
        private _subscription?;
        constructor(_collector?: ErrorCollector);
        rikeErrorsField: string;
        rikeErrors: ErrorCollector;
        readonly errors: FieldError[];
        ngOnInit(): void;
        ngOnDestroy(): void;
        protected createCollector(): ErrorCollector;
        protected updateErrors(errors: FieldErrors): void;
        private subscribe();
        private unsubscribe();
    }
}
declare module "ng2-rike/event-source-provider" {
    import { Type } from "@angular/core";
    /**
     * Constructs provider recipe for {{RikeEventSource}}.
     *
     * @param useClass
     * @param useValue
     * @param useExisting
     * @param useFactory
     * @param deps
     *
     * @return new provider recipe.
     */
    export function provideEventSource({useClass, useValue, useExisting, useFactory, deps}: {
        useClass?: Type;
        useValue?: any;
        useExisting?: any;
        useFactory?: Function;
        deps?: Object[];
        multi?: boolean;
    }): any[];
}
declare module "ng2-rike/resource" {
    import { Observable } from "rxjs/Rx";
    import { Protocol } from "ng2-rike/protocol";
    import { RikeTarget, Rike } from "ng2-rike/rike";
    /**
     * An interface of REST-like resources.
     *
     * An operations target is created per resource with a resource instance as target value. All operations on this
     * resource should be performed using this target.
     *
     * This class can be used as a token for resources. It can be registered as Angular service with {{provideResource}}.
     */
    export abstract class Resource {
        /**
         * Rike operations target for this resource.
         *
         * @return {RikeTarget<any, any>}
         */
        readonly abstract rikeTarget: RikeTarget<any, any>;
    }
    /**
     * Abstract implementation of REST-like resource.
     */
    export abstract class RikeResource implements Resource {
        private _rike;
        private _rikeTarget?;
        constructor(_rike: Rike);
        /**
         * Rike interface instance.
         */
        readonly rike: Rike;
        /**
         * Rike operations target for this resource.
         *
         * @return {RikeTarget<any, any>} the result of `this.getRikeTarget()` call.
         */
        readonly rikeTarget: RikeTarget<any, any>;
        /**
         * Rike operations target for this resource.
         *
         * Creates Rike target when needed by calling `createRikeTarget()` method.
         *
         * @return {RikeTarget<any, any>}
         */
        getRikeTarget(): RikeTarget<any, any>;
        /**
         * Creates Rike operation target for this resource.
         *
         * This method is called by `getRikeTarget()` method on demand.
         *
         * @return {RikeTarget<any, any>} new Rike target.
         */
        protected createRikeTarget(): RikeTarget<any, any>;
    }
    /**
     * Loadable resource.
     *
     * It is able to load arbitrary data from the server. By default expects a JSON data. Override `createRikeTarget()`
     * method to change it. When loaded the data will be cached. Call `reload()` method to reload it.
     *
     * @param <T> loaded data type.
     */
    export abstract class LoadableResource<T> extends RikeResource {
        private _data?;
        constructor(rike: Rike);
        readonly rikeTarget: RikeTarget<T, T>;
        getRikeTarget(): RikeTarget<T, T>;
        /**
         * Loaded data.
         *
         * @return {T} `undefined` if data is not loaded yet.
         */
        readonly data: T | undefined;
        /**
         * Loads data from server if not loaded yet.
         *
         * @return {Observable<T>}
         */
        load(): Observable<T>;
        /**
         * Reloads data from server.
         */
        reload(): Observable<T>;
        /**
         * Resets the resource by cleaning cached data.
         */
        reset(): void;
        protected createRikeTarget(): RikeTarget<T, T>;
    }
    /**
     * CRUD (Create, Load, Update, Delete) resource.
     *
     * It is able to manipulate with server objects. By default it operates over JSON protocol.
     * Override `createRikeTarget()` method to change it.
     */
    export abstract class CRUDResource<T> extends RikeResource {
        constructor(rike: Rike);
        readonly rikeTarget: RikeTarget<T, T>;
        getRikeTarget(): RikeTarget<T, T>;
        /**
         * Creates an object on the server.
         *
         * Sends `POST` HTTP request. Uses protocol returned from `this.objectCreateProtocol(object)` method.
         *
         * @param object an object to create.
         *
         * @return {Observable<O>}
         */
        create(object: T): Observable<T>;
        /**
         * Reads an object from the server.
         *
         * Sends `GET` HTTP request. Uses protocol returned from `this.objectReadProtocol(id)` method call.
         *
         * @param id an identifier of object to read.
         *
         * @return {Observable<O>}
         */
        read(id: any): Observable<T>;
        /**
         * Updates an object on the server.
         *
         * Sends `POST` HTTP request. Uses protocol returned from `this.objectUpdateProtocol(object)` method call.
         *
         * @param object an object to update.
         *
         * @return {Observable<O>}
         */
        update(object: T): Observable<T>;
        /**
         * Deletes an object on the server.
         *
         * Sends `DELETE` HTTP request. Uses protocol returned from `this.objectDeleteProtocol(object)` method call.
         *
         * @param object an object to delete.
         *
         * @return {Observable<any>}
         */
        delete(object: T): Observable<any>;
        protected createRikeTarget(): RikeTarget<T, T>;
        /**
         * Constructs object creation protocol.
         *
         * @param object an object to create.
         *
         * @return {Protocol<T, T>} creation protocol.
         */
        protected objectCreateProtocol(object: T): Protocol<any, T>;
        /**
         * Constructs object read protocol.
         *
         * This protocol updates request URL with `objectUrl()` by default.
         *
         * @param id an identifier of object to read.
         *
         * @return {Protocol<T, T>} read protocol.
         */
        protected objectReadProtocol(id: any): Protocol<any, T>;
        /**
         * Constructs object update protocol.
         *
         * This protocol detects object identifier with `objectId()` method and updates request URL with `objectUrl()`
         * by default.
         *
         * @param object an object to update.
         *
         * @return {Protocol<T, T>} update protocol.
         */
        protected objectUpdateProtocol(object: T): Protocol<T, T>;
        /**
         * Constructs object deletion protocol.
         *
         * This protocol detects object identifier with `objectId()` method and updates request URL with `objectUrl()`
         * by default.
         *
         * @param object an object to delete.
         *
         * @return {Protocol<T, T>} deletion protocol.
         */
        protected objectDeleteProtocol(object: T): Protocol<T, any>;
        /**
         * Detects object identifier.
         *
         * @param object target object.
         *
         * @returns target object's identifier.
         */
        protected abstract objectId(object: T): any;
        /**
         * Updates base URL with object URL.
         *
         * By default append object identifier as URL-encoded string to the base URL.
         *
         * @param baseUrl base URL to update.
         * @param id object identifier.
         *
         * @return {string} updated URL.
         */
        protected objectUrl(baseUrl: string | undefined, id: any): string;
    }
}
declare module "ng2-rike/resource-provider" {
    import { Type } from "@angular/core";
    /**
     * Constructs provider recipe for {{Resource}}.
     *
     * Also registers the resource as source of Rike operation events.
     *
     * @param provide provider token. If not specified the `Resource` will be used.
     * @param useClass
     * @param useValue
     * @param useExisting
     * @param useFactory
     * @param deps
     *
     * @return new provider recipe.
     */
    export function provideResource({provide, useClass, useValue, useExisting, useFactory, deps}: {
        provide: any;
        useClass?: Type;
        useValue?: any;
        useExisting?: any;
        useFactory?: Function;
        deps?: Object[];
        multi?: boolean;
    }): any;
}
declare module "ng2-rike" {
    export * from "ng2-rike/error-collector";
    export * from "ng2-rike/errors.component";
    export * from "ng2-rike/event";
    export * from "ng2-rike/event-source-provider";
    export * from "ng2-rike/field-error";
    export * from "ng2-rike/options";
    export * from "ng2-rike/protocol";
    export * from "ng2-rike/resource";
    export * from "ng2-rike/resource-provider";
    export * from "ng2-rike/rike";
    export * from "ng2-rike/status-collector";
    export * from "ng2-rike/status.component";
    /**
     * Provides a basic set of providers to use REST-like services in application.
     *
     * The `RIKE_PROVIDERS` should be included either in a component's injector, or in the root injector when bootstrapping
     * an application.
     *
     * @type {any[]}
     */
    export const RIKE_PROVIDERS: any[];
}
