import "@src/util/hp_SE2M_Utils";

describe("StringBuffer", () => {
    it("toString > 저장된 문자열을 반환한다.", () => {
        // given
        const sb = new StringBuffer("hello");

        // when
        const str = sb.toString();

        // then
        expect(str).toEqual("hello");
    });

    it("append > 문자열을 덧붙인다.", () => {
        // given
        const sb = new StringBuffer("hello");

        // when
        sb.append(" ").append("world");

        // then
        expect(sb.toString()).toEqual("hello world");
    });
});

describe("SE2M_Utils native replacements", () => {
    it("stripStringTags > DOM 텍스트로 태그를 제거한다.", () => {
        expect(nhn.husky.SE2M_Utils.stripStringTags("<p>Hello <strong>world</strong> &amp;!</p>")).toEqual("Hello world &!");
    });

    it("getJsonDatafromXML > Jindo wrapper 없이 plain object를 반환한다.", () => {
        const result = nhn.husky.SE2M_Utils.getJsonDatafromXML("<root><title>Hello</title></root>");

        expect(result.constructor).toBe(Object);
        expect(result.root.title).toBe("Hello");
    });
});
