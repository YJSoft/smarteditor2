import "@src/util/hp_LazyLoader";
import "@src/quick_editor/hp_SE2M_QuickEditor_Common";
import "@src/fundamental/base/hp_SE2M_ColorPalette";

describe("jQuery Ajax migration", () => {
    let ajax;

    beforeEach(() => {
        ajax = jest.spyOn(window.jQuery, "ajax");
    });

    afterEach(() => {
        ajax.mockRestore();
    });

    it("loads LazyLoader HTML and dispatches the original message", () => {
        const target = document.createElement("div");
        const loader = new nhn.husky.LazyLoader([]);
        loader.htMsgInfo = {
            LOAD_FRAGMENT: {
                sURL: "/fragment.html",
                elTarget: target,
                sFailureCallback: "LOAD_FRAGMENT_FAILED",
                nLoadingStatus: 0
            }
        };
        loader.oApp = {
            exec: jest.fn()
        };
        loader._removeHandler = jest.fn();

        loader.$LOCAL_BEFORE_ALL("$BEFORE_LOAD_FRAGMENT", ["arg"]);
        const options = ajax.mock.calls[0][0];
        expect(options).toEqual(expect.objectContaining({
            url: "/fragment.html",
            dataType: "html"
        }));

        options.success("<p>loaded</p>");
        expect(target.innerHTML).toBe("<p>loaded</p>");
        expect(loader.oApp.exec).toHaveBeenCalledWith("LOAD_FRAGMENT", ["arg"]);
    });

    it("dispatches LazyLoader failure messages from jQuery error callbacks", () => {
        const loader = new nhn.husky.LazyLoader([]);
        loader.htMsgInfo = {
            LOAD_FRAGMENT: {
                sURL: "/missing.html",
                elTarget: document.createElement("div"),
                sFailureCallback: "LOAD_FRAGMENT_FAILED",
                nLoadingStatus: 0
            }
        };
        loader.oApp = {
            exec: jest.fn()
        };
        loader._removeHandler = jest.fn();

        loader.$LOCAL_BEFORE_ALL("$BEFORE_LOAD_FRAGMENT", []);
        ajax.mock.calls[0][0].error();

        expect(loader.oApp.exec).toHaveBeenCalledWith("LOAD_FRAGMENT_FAILED", []);
    });

    it("uses JSONP options for QuickEditor and ColorPalette requests", () => {
        const quickEditor = new nhn.husky.SE2M_QuickEditor_Common();
        quickEditor._sBaseAjaxUrl = "/quick-editor/config";
        quickEditor.setData = jest.fn();
        quickEditor.getData();

        const quickEditorOptions = ajax.mock.calls[0][0];
        expect(quickEditorOptions).toEqual(expect.objectContaining({
            url: "/quick-editor/config",
            dataType: "jsonp",
            jsonp: "callback",
            timeout: 1000
        }));
        quickEditorOptions.success({ result: { text_data: "{table:'fold'}" } });
        expect(quickEditor.setData).toHaveBeenCalledWith("{table:'fold'}");

        const palette = new nhn.husky.SE2M_ColorPalette();
        palette.URL_COLOR_ADD = "/colors/add";
        palette.URL_COLOR_UPDATE = "/colors/update";
        palette.URL_COLOR_LIST = "/colors/list";
        palette.aRecentColor = ["#112233"];
        palette._ajaxAddColor();
        palette._ajaxUpdateColor();
        palette._ajaxRecentColor(jest.fn());

        expect(ajax).toHaveBeenCalledTimes(4);
        ajax.mock.calls.slice(1).forEach((call) => {
            expect(call[0]).toEqual(expect.objectContaining({
                dataType: "jsonp",
                jsonp: "callback",
                cache: false
            }));
        });
    });
});
