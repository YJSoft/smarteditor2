import "@src/husky_framework/DOMMetrics";

describe("DOMMetrics", () => {
    const fakeDocument = {
        defaultView: {
            pageXOffset: 20,
            pageYOffset: 30,
            innerWidth: 1024,
            innerHeight: 768
        },
        body: {
            scrollLeft: 5,
            scrollTop: 6,
            clientWidth: 700,
            clientHeight: 500
        },
        documentElement: {
            scrollLeft: 11,
            scrollTop: 12,
            clientWidth: 800,
            clientHeight: 600
        }
    };

    it("scrollPosition > document의 scroll 값을 반환한다.", () => {
        expect(nhn.husky.DOMMetrics.scrollPosition(fakeDocument)).toEqual({ left: 5, top: 6 });
    });

    it("clientSize > viewport 크기를 반환한다.", () => {
        expect(nhn.husky.DOMMetrics.clientSize(fakeDocument)).toEqual({ width: 800, height: 600 });
    });
});
