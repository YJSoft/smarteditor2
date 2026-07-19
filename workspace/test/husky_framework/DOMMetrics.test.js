import "@src/husky_framework/DOMMetrics";
import "@src/husky_framework/DOM";

describe("DOM helper", () => {
    it("getElement > ID와 HTML 문자열을 raw DOM으로 반환한다.", () => {
        const element = document.createElement("div");
        element.id = "dom-helper-target";
        document.body.appendChild(element);

        expect(nhn.husky.DOM.getElement("dom-helper-target")).toBe(element);
        const created = nhn.husky.DOM.getElement("<span>created</span>");
        expect(created.tagName).toBe("SPAN");
        expect(created.textContent).toBe("created");

        const list = document.createElement("div");
        list.innerHTML = "<div><span class='first'></span><span class='second'></span></div>";
        expect(nhn.husky.DOM.queryAll(">div>span", list)).toHaveLength(2);
        expect(nhn.husky.DOM.querySingle("span.second", list).className).toBe("second");
        list.firstChild.appendChild(document.createElement("span"));
        expect(nhn.husky.DOM.queryAll(">div>span", list)).toHaveLength(3);

        element.remove();
    });
});

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
