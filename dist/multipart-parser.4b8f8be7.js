function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
var $parcel$global =
typeof globalThis !== 'undefined'
  ? globalThis
  : typeof self !== 'undefined'
  ? self
  : typeof window !== 'undefined'
  ? window
  : typeof global !== 'undefined'
  ? global
  : {};
var parcelRequire = $parcel$global["parcelRequire2c7c"];
parcelRequire.register("9wyl8", function(module, exports) {

$parcel$export(module.exports, "toFormData", () => $6ef1bd64f122bca8$export$10ae0d317ea97f8b);

var $5L7Gm = parcelRequire("5L7Gm");

var $jw5hj = parcelRequire("jw5hj");
let $6ef1bd64f122bca8$var$s = 0;
const $6ef1bd64f122bca8$var$S = {
    START_BOUNDARY: $6ef1bd64f122bca8$var$s++,
    HEADER_FIELD_START: $6ef1bd64f122bca8$var$s++,
    HEADER_FIELD: $6ef1bd64f122bca8$var$s++,
    HEADER_VALUE_START: $6ef1bd64f122bca8$var$s++,
    HEADER_VALUE: $6ef1bd64f122bca8$var$s++,
    HEADER_VALUE_ALMOST_DONE: $6ef1bd64f122bca8$var$s++,
    HEADERS_ALMOST_DONE: $6ef1bd64f122bca8$var$s++,
    PART_DATA_START: $6ef1bd64f122bca8$var$s++,
    PART_DATA: $6ef1bd64f122bca8$var$s++,
    END: $6ef1bd64f122bca8$var$s++
};
let $6ef1bd64f122bca8$var$f = 1;
const $6ef1bd64f122bca8$var$F = {
    PART_BOUNDARY: $6ef1bd64f122bca8$var$f,
    LAST_BOUNDARY: $6ef1bd64f122bca8$var$f *= 2
};
const $6ef1bd64f122bca8$var$LF = 10;
const $6ef1bd64f122bca8$var$CR = 13;
const $6ef1bd64f122bca8$var$SPACE = 32;
const $6ef1bd64f122bca8$var$HYPHEN = 45;
const $6ef1bd64f122bca8$var$COLON = 58;
const $6ef1bd64f122bca8$var$A = 97;
const $6ef1bd64f122bca8$var$Z = 122;
const $6ef1bd64f122bca8$var$lower = (c)=>c | 0x20;
const $6ef1bd64f122bca8$var$noop = ()=>{};
class $6ef1bd64f122bca8$var$MultipartParser {
    /**
	 * @param {string} boundary
	 */ constructor(boundary){
        this.index = 0;
        this.flags = 0;
        this.onHeaderEnd = $6ef1bd64f122bca8$var$noop;
        this.onHeaderField = $6ef1bd64f122bca8$var$noop;
        this.onHeadersEnd = $6ef1bd64f122bca8$var$noop;
        this.onHeaderValue = $6ef1bd64f122bca8$var$noop;
        this.onPartBegin = $6ef1bd64f122bca8$var$noop;
        this.onPartData = $6ef1bd64f122bca8$var$noop;
        this.onPartEnd = $6ef1bd64f122bca8$var$noop;
        this.boundaryChars = {};
        boundary = "\r\n--" + boundary;
        const ui8a = new Uint8Array(boundary.length);
        for(let i = 0; i < boundary.length; i++){
            ui8a[i] = boundary.charCodeAt(i);
            this.boundaryChars[ui8a[i]] = true;
        }
        this.boundary = ui8a;
        this.lookbehind = new Uint8Array(this.boundary.length + 8);
        this.state = $6ef1bd64f122bca8$var$S.START_BOUNDARY;
    }
    /**
	 * @param {Uint8Array} data
	 */ write(data) {
        let i = 0;
        const length_ = data.length;
        let previousIndex = this.index;
        let { lookbehind: lookbehind , boundary: boundary , boundaryChars: boundaryChars , index: index , state: state , flags: flags  } = this;
        const boundaryLength = this.boundary.length;
        const boundaryEnd = boundaryLength - 1;
        const bufferLength = data.length;
        let c;
        let cl;
        const mark = (name)=>{
            this[name + "Mark"] = i;
        };
        const clear = (name)=>{
            delete this[name + "Mark"];
        };
        const callback = (callbackSymbol, start, end, ui8a)=>{
            if (start === undefined || start !== end) this[callbackSymbol](ui8a && ui8a.subarray(start, end));
        };
        const dataCallback = (name, clear)=>{
            const markSymbol = name + "Mark";
            if (!(markSymbol in this)) return;
            if (clear) {
                callback(name, this[markSymbol], i, data);
                delete this[markSymbol];
            } else {
                callback(name, this[markSymbol], data.length, data);
                this[markSymbol] = 0;
            }
        };
        for(i = 0; i < length_; i++){
            c = data[i];
            switch(state){
                case $6ef1bd64f122bca8$var$S.START_BOUNDARY:
                    if (index === boundary.length - 2) {
                        if (c === $6ef1bd64f122bca8$var$HYPHEN) flags |= $6ef1bd64f122bca8$var$F.LAST_BOUNDARY;
                        else if (c !== $6ef1bd64f122bca8$var$CR) return;
                        index++;
                        break;
                    } else if (index - 1 === boundary.length - 2) {
                        if (flags & $6ef1bd64f122bca8$var$F.LAST_BOUNDARY && c === $6ef1bd64f122bca8$var$HYPHEN) {
                            state = $6ef1bd64f122bca8$var$S.END;
                            flags = 0;
                        } else if (!(flags & $6ef1bd64f122bca8$var$F.LAST_BOUNDARY) && c === $6ef1bd64f122bca8$var$LF) {
                            index = 0;
                            callback("onPartBegin");
                            state = $6ef1bd64f122bca8$var$S.HEADER_FIELD_START;
                        } else return;
                        break;
                    }
                    if (c !== boundary[index + 2]) index = -2;
                    if (c === boundary[index + 2]) index++;
                    break;
                case $6ef1bd64f122bca8$var$S.HEADER_FIELD_START:
                    state = $6ef1bd64f122bca8$var$S.HEADER_FIELD;
                    mark("onHeaderField");
                    index = 0;
                // falls through
                case $6ef1bd64f122bca8$var$S.HEADER_FIELD:
                    if (c === $6ef1bd64f122bca8$var$CR) {
                        clear("onHeaderField");
                        state = $6ef1bd64f122bca8$var$S.HEADERS_ALMOST_DONE;
                        break;
                    }
                    index++;
                    if (c === $6ef1bd64f122bca8$var$HYPHEN) break;
                    if (c === $6ef1bd64f122bca8$var$COLON) {
                        if (index === 1) // empty header field
                        return;
                        dataCallback("onHeaderField", true);
                        state = $6ef1bd64f122bca8$var$S.HEADER_VALUE_START;
                        break;
                    }
                    cl = $6ef1bd64f122bca8$var$lower(c);
                    if (cl < $6ef1bd64f122bca8$var$A || cl > $6ef1bd64f122bca8$var$Z) return;
                    break;
                case $6ef1bd64f122bca8$var$S.HEADER_VALUE_START:
                    if (c === $6ef1bd64f122bca8$var$SPACE) break;
                    mark("onHeaderValue");
                    state = $6ef1bd64f122bca8$var$S.HEADER_VALUE;
                // falls through
                case $6ef1bd64f122bca8$var$S.HEADER_VALUE:
                    if (c === $6ef1bd64f122bca8$var$CR) {
                        dataCallback("onHeaderValue", true);
                        callback("onHeaderEnd");
                        state = $6ef1bd64f122bca8$var$S.HEADER_VALUE_ALMOST_DONE;
                    }
                    break;
                case $6ef1bd64f122bca8$var$S.HEADER_VALUE_ALMOST_DONE:
                    if (c !== $6ef1bd64f122bca8$var$LF) return;
                    state = $6ef1bd64f122bca8$var$S.HEADER_FIELD_START;
                    break;
                case $6ef1bd64f122bca8$var$S.HEADERS_ALMOST_DONE:
                    if (c !== $6ef1bd64f122bca8$var$LF) return;
                    callback("onHeadersEnd");
                    state = $6ef1bd64f122bca8$var$S.PART_DATA_START;
                    break;
                case $6ef1bd64f122bca8$var$S.PART_DATA_START:
                    state = $6ef1bd64f122bca8$var$S.PART_DATA;
                    mark("onPartData");
                // falls through
                case $6ef1bd64f122bca8$var$S.PART_DATA:
                    previousIndex = index;
                    if (index === 0) {
                        // boyer-moore derrived algorithm to safely skip non-boundary data
                        i += boundaryEnd;
                        while(i < bufferLength && !(data[i] in boundaryChars))i += boundaryLength;
                        i -= boundaryEnd;
                        c = data[i];
                    }
                    if (index < boundary.length) {
                        if (boundary[index] === c) {
                            if (index === 0) dataCallback("onPartData", true);
                            index++;
                        } else index = 0;
                    } else if (index === boundary.length) {
                        index++;
                        if (c === $6ef1bd64f122bca8$var$CR) // CR = part boundary
                        flags |= $6ef1bd64f122bca8$var$F.PART_BOUNDARY;
                        else if (c === $6ef1bd64f122bca8$var$HYPHEN) // HYPHEN = end boundary
                        flags |= $6ef1bd64f122bca8$var$F.LAST_BOUNDARY;
                        else index = 0;
                    } else if (index - 1 === boundary.length) {
                        if (flags & $6ef1bd64f122bca8$var$F.PART_BOUNDARY) {
                            index = 0;
                            if (c === $6ef1bd64f122bca8$var$LF) {
                                // unset the PART_BOUNDARY flag
                                flags &= ~$6ef1bd64f122bca8$var$F.PART_BOUNDARY;
                                callback("onPartEnd");
                                callback("onPartBegin");
                                state = $6ef1bd64f122bca8$var$S.HEADER_FIELD_START;
                                break;
                            }
                        } else if (flags & $6ef1bd64f122bca8$var$F.LAST_BOUNDARY) {
                            if (c === $6ef1bd64f122bca8$var$HYPHEN) {
                                callback("onPartEnd");
                                state = $6ef1bd64f122bca8$var$S.END;
                                flags = 0;
                            } else index = 0;
                        } else index = 0;
                    }
                    if (index > 0) // when matching a possible boundary, keep a lookbehind reference
                    // in case it turns out to be a false lead
                    lookbehind[index - 1] = c;
                    else if (previousIndex > 0) {
                        // if our boundary turned out to be rubbish, the captured lookbehind
                        // belongs to partData
                        const _lookbehind = new Uint8Array(lookbehind.buffer, lookbehind.byteOffset, lookbehind.byteLength);
                        callback("onPartData", 0, previousIndex, _lookbehind);
                        previousIndex = 0;
                        mark("onPartData");
                        // reconsider the current character even so it interrupted the sequence
                        // it could be the beginning of a new sequence
                        i--;
                    }
                    break;
                case $6ef1bd64f122bca8$var$S.END:
                    break;
                default:
                    throw new Error(`Unexpected state entered: ${state}`);
            }
        }
        dataCallback("onHeaderField");
        dataCallback("onHeaderValue");
        dataCallback("onPartData");
        // Update properties for the next call
        this.index = index;
        this.state = state;
        this.flags = flags;
    }
    end() {
        if (this.state === $6ef1bd64f122bca8$var$S.HEADER_FIELD_START && this.index === 0 || this.state === $6ef1bd64f122bca8$var$S.PART_DATA && this.index === this.boundary.length) this.onPartEnd();
        else if (this.state !== $6ef1bd64f122bca8$var$S.END) throw new Error("MultipartParser.end(): stream ended unexpectedly");
    }
}
function $6ef1bd64f122bca8$var$_fileName(headerValue) {
    // matches either a quoted-string or a token (RFC 2616 section 19.5.1)
    const m = headerValue.match(/\bfilename=("(.*?)"|([^()<>@,;:\\"/[\]?={}\s\t]+))($|;\s)/i);
    if (!m) return;
    const match = m[2] || m[3] || "";
    let filename = match.slice(match.lastIndexOf("\\") + 1);
    filename = filename.replace(/%22/g, '"');
    filename = filename.replace(/&#(\d{4});/g, (m, code)=>{
        return String.fromCharCode(code);
    });
    return filename;
}
async function $6ef1bd64f122bca8$export$10ae0d317ea97f8b(Body, ct) {
    if (!/multipart/i.test(ct)) throw new TypeError("Failed to fetch");
    const m = ct.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!m) throw new TypeError("no or bad content-type header, no multipart boundary");
    const parser = new $6ef1bd64f122bca8$var$MultipartParser(m[1] || m[2]);
    let headerField;
    let headerValue;
    let entryValue;
    let entryName;
    let contentType;
    let filename;
    const entryChunks = [];
    const formData = new (0, $jw5hj.FormData)();
    const onPartData = (ui8a)=>{
        entryValue += decoder.decode(ui8a, {
            stream: true
        });
    };
    const appendToFile = (ui8a)=>{
        entryChunks.push(ui8a);
    };
    const appendFileToFormData = ()=>{
        const file = new (0, $5L7Gm.File)(entryChunks, filename, {
            type: contentType
        });
        formData.append(entryName, file);
    };
    const appendEntryToFormData = ()=>{
        formData.append(entryName, entryValue);
    };
    const decoder = new TextDecoder("utf-8");
    decoder.decode();
    parser.onPartBegin = function() {
        parser.onPartData = onPartData;
        parser.onPartEnd = appendEntryToFormData;
        headerField = "";
        headerValue = "";
        entryValue = "";
        entryName = "";
        contentType = "";
        filename = null;
        entryChunks.length = 0;
    };
    parser.onHeaderField = function(ui8a) {
        headerField += decoder.decode(ui8a, {
            stream: true
        });
    };
    parser.onHeaderValue = function(ui8a) {
        headerValue += decoder.decode(ui8a, {
            stream: true
        });
    };
    parser.onHeaderEnd = function() {
        headerValue += decoder.decode();
        headerField = headerField.toLowerCase();
        if (headerField === "content-disposition") {
            // matches either a quoted-string or a token (RFC 2616 section 19.5.1)
            const m = headerValue.match(/\bname=("([^"]*)"|([^()<>@,;:\\"/[\]?={}\s\t]+))/i);
            if (m) entryName = m[2] || m[3] || "";
            filename = $6ef1bd64f122bca8$var$_fileName(headerValue);
            if (filename) {
                parser.onPartData = appendToFile;
                parser.onPartEnd = appendFileToFormData;
            }
        } else if (headerField === "content-type") contentType = headerValue;
        headerValue = "";
        headerField = "";
    };
    for await (const chunk of Body)parser.write(chunk);
    parser.end();
    return formData;
}

});


//# sourceMappingURL=multipart-parser.4b8f8be7.js.map
