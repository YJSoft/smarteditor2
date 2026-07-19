import "@static/js/lib/jindo2.all";
import "@src/husky_framework/HuskyCore";
import "@src/util/N_DraggableLayer";

function dispatchMouseEvent(target, type, clientX, clientY, buttons) {
    const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        button: 0,
        buttons,
        clientX,
        clientY
    });
    target.dispatchEvent(event);
}

describe("N_DraggableLayer", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("uses stable jQuery handlers for drag start, move, and one-time end", () => {
        document.body.innerHTML = '<div id="layer"><button id="handle" type="button">move</button></div>';
        const layer = document.getElementById("layer");
        const handle = document.getElementById("handle");
        const onDragStart = jest.fn();
        const onDragEnd = jest.fn();
        new nhn.DraggableLayer(layer, {
            elHandle: handle,
            fnOnDragStart: onDragStart,
            fnOnDragEnd: onDragEnd
        });

        dispatchMouseEvent(handle, "mousedown", 10, 15, 1);
        dispatchMouseEvent(document, "mousemove", 20, 25, 1);
        dispatchMouseEvent(document, "mouseup", 20, 25, 0);
        dispatchMouseEvent(document, "mouseup", 20, 25, 0);

        expect(onDragStart).toHaveBeenCalledTimes(1);
        expect(layer.style.left).toBe("10px");
        expect(layer.style.top).toBe("10px");
        expect(onDragEnd).toHaveBeenCalledTimes(1);
    });
});
