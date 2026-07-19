import "@static/js/lib/jindo2.all";
import "@src/shortcut/shortcut";

describe("Shortcut native collection migration", () => {
    beforeEach(() => {
        Object.keys(window.shortcut.Store.datas).forEach((key) => delete window.shortcut.Store.datas[key]);
    });

    it("interprets modifier keys with native arrays", () => {
        expect(window.shortcut.Helper.keyInterpretor("ctrl+shift+k")).toBe("010175");
    });

    it("removes exceptions and events from their backing arrays", () => {
        const data = new window.shortcut.Data("shortcut-test", "ctrl+k", document);
        const exception = jest.fn(() => true);
        const event = jest.fn();
        data.addException(exception, "ctrl+k");
        data.addEvent(event, "ctrl+k");

        data.removeException(exception, "ctrl+k");
        expect(data.keys["ctrl+k"].commonExceptions).toEqual([]);
        data.removeEvent(event, "ctrl+k");

        expect(data.keys["ctrl+k"]).toBeUndefined();
    });
});
