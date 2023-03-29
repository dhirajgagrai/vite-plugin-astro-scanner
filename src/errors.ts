import type { DiagnosticCode } from '@astrojs/compiler/shared/diagnostics.js';
import type { AstroErrorCodes } from './errors-data.js';

import { getErrorDataByCode } from "./utils";
import { codeFrame } from "./printer";

interface ErrorLocation {
    file?: string;
    line?: number;
    column?: number;
}

type ErrorTypes = 'AstroError' | 'CompilerError' | 'CSSError' | 'MarkdownError' | 'InternalError' | 'AggregateError';

export class AstroError extends Error {
    errorCode: AstroErrorCodes | DiagnosticCode;
    loc: ErrorLocation | undefined;
    title: string | undefined;
    hint: string | undefined;
    frame: string | undefined;
    type: ErrorTypes;

    constructor(props, ...params) {
        let _a;
        super(...params);
        this.type = "AstroError";
        const { code, name, title, message, stack, location, hint, frame } = props;
        this.errorCode = code;
        if (name && name !== "Error") {
            this.name = name;
        } else {
            this.name = ((_a = getErrorDataByCode(this.errorCode)) == null ? void 0 : _a.name) ?? "UnknownError";
        }
        this.title = title;
        if (message)
            this.message = message;
        this.stack = stack ? stack : this.stack;
        this.loc = location;
        this.hint = hint;
        this.frame = frame;
    }
    setErrorCode(errorCode) {
        this.errorCode = errorCode;
    }
    setLocation(location) {
        this.loc = location;
    }
    setName(name) {
        this.name = name;
    }
    setMessage(message) {
        this.message = message;
    }
    setHint(hint) {
        this.hint = hint;
    }
    setFrame(source, location) {
        this.frame = codeFrame(source, location);
    }
    static is(err) {
        return err.type === "AstroError";
    }
}