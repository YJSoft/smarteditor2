import "@src/husky_framework/DragArea";

describe("nhn.husky.DragArea", () => {
    let area;
    let draggable;

    beforeEach(() => {
        area = window.jQuery("<div>").css({ position: "relative", width: 300, height: 200 }).appendTo(document.body);
        draggable = window.jQuery("<div>")
            .addClass("q_dragable")
            .css({ position: "absolute", left: 10, top: 15, width: 40, height: 30 })
            .appendTo(area);
    });

    afterEach(() => {
        area.remove();
    });

    it("moves the draggable element and emits the lifecycle events", () => {
        const events = [];
        const dragArea = new nhn.husky.DragArea(area.get(0), {
            sClassName: "q_dragable",
            bFlowOut: false,
            nThreshold: 1
        }).attach({
            dragStart: () => events.push("start"),
            beforeDrag: () => events.push("move"),
            dragEnd: () => events.push("end")
        });

        draggable.trigger(window.jQuery.Event("mousedown", { which: 1, pageX: 20, pageY: 25 }));
        window.jQuery(document).trigger(window.jQuery.Event("mousemove", { pageX: 50, pageY: 65 }));
        window.jQuery(document).trigger(window.jQuery.Event("mouseup", { pageX: 50, pageY: 65 }));

        expect(events).toEqual(["start", "move", "end"]);
        expect(draggable.css("left")).toBe("40px");
        expect(draggable.css("top")).toBe("55px");
        expect(dragArea.isDragging()).toBe(false);
    });

    it("allows dragStart to replace the element that moves", () => {
        const wrapper = window.jQuery("<div>").addClass("se2_qmax").css({ position: "absolute", left: 5, top: 5 }).appendTo(area);
        draggable.remove();
        draggable = window.jQuery("<div>").addClass("q_dragable").appendTo(wrapper);
        const dragArea = new nhn.husky.DragArea(area.get(0), { sClassName: "q_dragable", nThreshold: 0 });
        dragArea.attach("dragStart", (event) => {
            event.elDrag = event.elDrag.parentNode;
        });

        draggable.trigger(window.jQuery.Event("mousedown", { which: 1, pageX: 10, pageY: 10 }));
        window.jQuery(document).trigger(window.jQuery.Event("mousemove", { pageX: 20, pageY: 25 }));
        window.jQuery(document).trigger(window.jQuery.Event("mouseup", { pageX: 20, pageY: 25 }));

        expect(wrapper.css("left")).toBe("15px");
        expect(wrapper.css("top")).toBe("20px");
    });
});
