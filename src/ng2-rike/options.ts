import {StatusLabels, DEFAULT_STATUS_LABELS} from "./status-collector";
/**
 * Constructs URL relative to base URL.
 *
 * @param baseUrl base URL.
 * @param url URL.
 *
 * @returns {string} If `baseUrl` is not specified, or empty string, or `url` is absolute, then returns unmodified `url`.
 * Otherwise concatenates `baseUrl` and `url` separating them by `/` sign.
 */
export function relativeUrl(baseUrl: string | undefined, url: string): string {
    if (!baseUrl) {
        return url;
    }
    if (url[0] === "/") {
        return url;// Absolute URL
    }
    if (url.match(/^(\w*:)?\/\//)) {
        return url;// Full URL
    }
    return baseUrl + "/" + url;
}

/**
 * Global Rike options interface.
 */
export interface RikeOptionsArgs {

    /**
     * Base URL of all relative URLs
     */
    readonly baseUrl?: string;

    /**
     * Default error handler to use, if any.
     */
    readonly defaultErrorHandler?: (error: any) => any;

    /**
     * Rike operation status labels to use by default.
     */
    readonly defaultStatusLabels?: {[operation: string]: StatusLabels<any>};

}

/**
 * Global Rike options.
 *
 * To overwrite global options add a provider for [BaseRikeOptions] instance with [RikeOptions] as a key:
 * ```ts
 * bootstrap(AppComponent, {provide: RikeOptions, new BaseRikeOptions({baseDir: "/rike"})});
 * ```
 */
export abstract class RikeOptions implements RikeOptionsArgs {

    abstract readonly baseUrl?: string;

    abstract readonly defaultErrorHandler?: (error: any) => any;

    abstract defaultStatusLabels?: {[operation: string]: StatusLabels<any>};

    /**
     * Constructs URL relative to `baseUrl`.
     *
     * @param url URL
     *
     * @returns {string} resolved URL.
     */
    relativeUrl(url: string): string {
        return relativeUrl(this.baseUrl, url);
    }

}

/**
 * Basic [global resource options][RikeOptions] implementation.
 *
 * Can be used to override the global resource options.
 */
export class BaseRikeOptions extends RikeOptions {

    private _baseUrl?: string;
    private _defaultErrorHandler?: (error: any) => any;
    private _defaultStatusLabels = DEFAULT_STATUS_LABELS;

    constructor(opts?: RikeOptionsArgs) {
        super();
        if (opts) {
            this._baseUrl = opts.baseUrl;
            this._defaultErrorHandler = opts.defaultErrorHandler;
            if (opts.defaultStatusLabels) {
                this._defaultStatusLabels = opts.defaultStatusLabels;
            }
        }
    }

    get baseUrl(): string | undefined {
        return this._baseUrl;
    }

    get defaultErrorHandler(): ((error: any) => any) | undefined {
        return this._defaultErrorHandler;
    }

    get defaultStatusLabels():{[operation: string]: StatusLabels<any>} | undefined {
        return this._defaultStatusLabels;
    }

}

/**
 * Default resource options.
 *
 * @type {RikeOptions}
 */
export const DEFAULT_RIKE_OPTIONS: RikeOptions = new BaseRikeOptions();
