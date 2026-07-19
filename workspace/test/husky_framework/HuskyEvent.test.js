import "@src/husky_framework/HuskyEvent";

describe("HuskyEvent", () => {
    it("exposes target, current target, related target, and the native event", () => {
        const target = document.createElement("button");
        const text = document.createTextNode("button");
        const currentTarget = document.createElement("div");
        const relatedTarget = document.createElement("span");
        target.appendChild(text);
        const nativeEvent = {
            type: "mouseover",
            target: text,
            currentTarget,
            relatedTarget
        };

        const event = new nhn.husky.HuskyEvent(nativeEvent);

        expect(event.type).toBe("mouseover");
        expect(event.element).toBe(target);
        expect(event.currentElement).toBe(currentTarget);
        expect(event.relatedElement).toBe(relatedTarget);
        expect(event.originalEvent).toBe(nativeEvent);
        expect(event.$value()).toBe(nativeEvent);
    });

    it("normalizes key codes and modifiers", () => {
        const event = new nhn.husky.HuskyEvent({
            type: "keydown",
            target: document.body,
            keyCode: 13,
            altKey: true,
            ctrlKey: true,
            metaKey: false,
            shiftKey: true
        });

        expect(event.key()).toEqual({
            keyCode: 13,
            alt: true,
            ctrl: true,
            meta: false,
            shift: true,
            up: false,
            down: false,
            left: false,
            right: false,
            enter: true,
            esc: false
        });
    });

    it("normalizes mouse buttons and wheel direction", () => {
        const event = new nhn.husky.HuskyEvent({
            type: "mousedown",
            target: document.body,
            which: 1,
            wheelDelta: -120
        });

        expect(event.mouse()).toEqual({
            delta: -1,
            left: true,
            middle: false,
            right: false
        });
    });

    it("provides client, page, layer, and target-relative coordinates", () => {
        const target = document.createElement("div");
        target.getBoundingClientRect = jest.fn(() => ({ left: 10, top: 20 }));
        const event = new nhn.husky.HuskyEvent({
            type: "mousemove",
            target,
            clientX: 30,
            clientY: 50,
            pageX: 30,
            pageY: 50,
            offsetX: 20,
            offsetY: 30
        });

        expect(event.pos()).toEqual({
            clientX: 30,
            clientY: 50,
            pageX: 30,
            pageY: 50,
            layerX: 20,
            layerY: 30
        });
        expect(event.pos(true)).toEqual(expect.objectContaining({
            offsetX: 20,
            offsetY: 30
        }));
    });

    it("can cancel default behavior and bubbling independently", () => {
        const nativeEvent = {
            type: "click",
            target: document.body,
            preventDefault: jest.fn(),
            stopPropagation: jest.fn()
        };
        const event = new nhn.husky.HuskyEvent(nativeEvent);

        expect(event.stopDefault()).toBe(event);
        expect(nativeEvent.preventDefault).toHaveBeenCalledTimes(1);
        expect(nativeEvent.stopPropagation).not.toHaveBeenCalled();

        event.stopBubble();
        expect(nativeEvent.stopPropagation).toHaveBeenCalledTimes(1);
        expect(event.canceled).toBe(true);
    });
});
