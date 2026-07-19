describe("jQuery DOM element replacements", () => {
    let container;

    beforeEach(() => {
        container = window.jQuery("<div>").appendTo(document.body);
    });

    afterEach(() => {
        container.remove();
    });

    it("class/style/attribute operations > jQuery 결과가 raw DOM 상태를 갱신한다.", () => {
        const element = window.jQuery("<span>").appendTo(container);

        element.addClass("active").css("opacity", 0.4).attr("data-state", "ready");

        expect(element.hasClass("active")).toBe(true);
        expect(element.css("opacity")).toBe("0.4");
        expect(element.attr("data-state")).toBe("ready");
        expect(element.get(0).className).toBe("active");
    });

    it("html/geometry/mutation operations > 기존 raw DOM 반환 규약을 유지한다.", () => {
        const element = window.jQuery("<span>").html("text").appendTo(container);
        const sibling = window.jQuery("<em>").text("sibling");

        element.width(120).height(40).after(sibling);
        expect(element.html()).toBe("text");
        expect(element.width()).toBe(120);
        expect(element.height()).toBe(40);
        expect(container.children().length).toBe(2);

        sibling.remove();
        expect(container.children().length).toBe(1);
    });
});
