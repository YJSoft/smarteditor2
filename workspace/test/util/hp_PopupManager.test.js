import "@src/util/hp_PopupManager";

describe("PopUpManager native hash migration", () => {
    beforeEach(() => {
        nhn.husky.PopUpManager._instance = null;
        nhn.husky.PopUpManager._pluginKeyCnt = 0;
    });

    it("routes callbacks through a plain object registry", () => {
        const app = {
            exec: jest.fn(),
            getValue: jest.fn(() => "value")
        };
        const popupWindow = {};
        const manager = nhn.husky.PopUpManager.getInstance(app);
        manager._whtPluginWin.plugin_0 = popupWindow;

        expect(manager.getPlugin().plugin_0).toBe(app);
        expect(manager.getCorrectKey(manager.getPluginWin(), popupWindow)).toBe("plugin_0");

        nhn.husky.PopUpManager.setCallback(popupWindow, "POPUP_CALLBACK", ["data"]);
        expect(app.exec).toHaveBeenCalledWith("POPUP_CALLBACK", ["data"]);
        expect(nhn.husky.PopUpManager.getFunc(popupWindow, "getValue")).toBe("value");
    });
});
