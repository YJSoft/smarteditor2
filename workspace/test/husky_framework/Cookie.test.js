import "@src/husky_framework/Cookie";

describe("Cookie helper", () => {
    it("get > cookie 이름을 decode하고 값을 반환한다.", () => {
        const fakeDocument = { cookie: "plain=value; encoded%20name=hello%20world" };

        expect(nhn.husky.Cookie.get("encoded name", fakeDocument)).toBe("hello world");
        expect(nhn.husky.Cookie.get("missing", fakeDocument)).toBeNull();
    });

    it("set/remove > 만료일과 path를 포함한 cookie를 작성한다.", () => {
        const fakeDocument = { cookie: "" };

        nhn.husky.Cookie.set("notice", 1, 3650, undefined, "/", fakeDocument);
        expect(fakeDocument.cookie).toContain("notice=1");
        expect(fakeDocument.cookie).toContain("path=/");
        expect(fakeDocument.cookie).toContain("expires=");

        nhn.husky.Cookie.remove("notice", undefined, "/", fakeDocument);
        expect(fakeDocument.cookie).toContain("notice=");
    });
});
