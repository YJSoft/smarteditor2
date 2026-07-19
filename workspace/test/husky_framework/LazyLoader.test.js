import "@src/husky_framework/LazyLoader";

describe("nhn.husky.LazyScriptLoader", () => {
    let ajax;

    beforeEach(() => {
        ajax = jest.spyOn(window.jQuery, "ajax").mockImplementation(() => ({
            done(callback) {
                this.doneCallback = callback;
                return this;
            },
            fail(callback) {
                this.failCallback = callback;
                return this;
            }
        }));
    });

    afterEach(() => {
        ajax.mockRestore();
    });

    it("loads a script once and flushes concurrent callbacks", () => {
        const first = jest.fn();
        const second = jest.fn();
        const url = "/lazy-component-success.js";

        nhn.husky.LazyScriptLoader.load(url, first, "utf-8");
        nhn.husky.LazyScriptLoader.load(url, second);

        expect(ajax).toHaveBeenCalledTimes(1);
        expect(ajax).toHaveBeenCalledWith(expect.objectContaining({
            url,
            dataType: "script",
            cache: true,
            beforeSend: expect.any(Function)
        }));

        const request = ajax.mock.results[0].value;
        request.doneCallback();
        expect(first).toHaveBeenCalledTimes(1);
        expect(second).toHaveBeenCalledTimes(1);
    });

    it("calls the error callback when a script fails", () => {
        const onError = jest.fn();
        const url = "/lazy-component-failure.js";

        nhn.husky.LazyScriptLoader.load(url, jest.fn(), null, onError);
        const request = ajax.mock.results[0].value;
        request.failCallback({}, "error", "network");

        expect(onError).toHaveBeenCalledWith("network");
    });
});
