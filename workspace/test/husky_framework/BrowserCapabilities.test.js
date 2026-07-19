describe("BrowserCapabilities", () => {
    it("exposes stable browser and operating system capability objects", () => {
        expect(nhn.husky.Browser.navigator()).toBe(nhn.husky.Browser.navigator());
        expect(nhn.husky.Browser.os()).toBe(nhn.husky.Browser.os());
    });

    it("provides the legacy flags used by editor plugins without Jindo", () => {
        const browser = nhn.husky.Browser.navigator();
        const os = nhn.husky.Browser.os();

        ["chrome", "edge", "firefox", "ie", "opera", "safari", "webkit", "mobile", "msafari"].forEach((name) => {
            expect(typeof browser[name]).toBe("boolean");
        });
        expect(typeof browser.version).toBe("number");
        expect(typeof browser.nativeVersion).toBe("number");
        ["android", "ios", "linux", "mac", "win", "winxp"].forEach((name) => {
            expect(typeof os[name]).toBe("boolean");
        });
        expect(typeof os.version).toBe("string");
    });
});
