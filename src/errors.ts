import type { DiagnosticCode } from "@astrojs/compiler/shared/diagnostics";
import type { AstroErrorCodes } from "./errors-data";

import { getErrorDataByCode } from "./utils";
import { codeFrame } from "./printer";

export interface ErrorLocation {
    file?: string;
    line?: number;
    column?: number;
}

interface ErrorProperties {
	code: AstroErrorCodes | DiagnosticCode;
	title?: string;
	name?: string;
	message?: string;
	location?: ErrorLocation;
	hint?: string;
	stack?: string;
	frame?: string;
}

type ErrorTypes = 'AstroError' | 'CompilerError' | 'CSSError' | 'MarkdownError' | 'InternalError' | 'AggregateError';

export class AstroError extends Error {
	// NOTE: If this property is named `code`, Rollup will use it to fill the `pluginCode` property downstream
	// This cause issues since we expect `pluginCode` to be a string containing code
	// @see https://github.com/rollup/rollup/blob/9a741639f69f204ded8ea404675f725b8d56adca/src/utils/error.ts#L725
	public errorCode: AstroErrorCodes | DiagnosticCode;
	public loc: ErrorLocation | undefined;
	public title: string | undefined;
	public hint: string | undefined;
	public frame: string | undefined;

	type: ErrorTypes = 'AstroError';

	constructor(props: ErrorProperties, ...params: any) {
		super(...params);

		const { code, name, title, message, stack, location, hint, frame } = props;

		this.errorCode = code;
		if (name && name !== 'Error') {
			this.name = name;
		} else {
			// If we don't have a name, let's generate one from the code
			this.name = getErrorDataByCode(this.errorCode)?.name ?? 'UnknownError';
		}
		this.title = title;
		if (message) this.message = message;
		// Only set this if we actually have a stack passed, otherwise uses Error's
		this.stack = stack ? stack : this.stack;
		this.loc = location;
		this.hint = hint;
		this.frame = frame;
	}

	public setErrorCode(errorCode: AstroErrorCodes) {
		this.errorCode = errorCode;
	}

	public setLocation(location: ErrorLocation): void {
		this.loc = location;
	}

	public setName(name: string): void {
		this.name = name;
	}

	public setMessage(message: string): void {
		this.message = message;
	}

	public setHint(hint: string): void {
		this.hint = hint;
	}

	public setFrame(source: string, location: ErrorLocation): void {
		this.frame = codeFrame(source, location);
	}

	static is(err: Error | unknown): err is AstroError {
		return (err as AstroError).type === 'AstroError';
	}
}
