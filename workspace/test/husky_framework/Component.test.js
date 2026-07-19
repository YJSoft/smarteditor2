import "@src/husky_framework/Component";

describe("nhn.husky.Component", () => {
    const createComponent = () => nhn.husky.createClass({}).extend(nhn.husky.Component);

    it("stores and reads options", () => {
        const Component = createComponent();
        const component = new Component();

        component.option({ enabled: true, count: 1 });
        expect(component.option("enabled")).toBe(true);
        expect(component.option()).toEqual({ enabled: true, count: 1 });

        component.option("count", 2);
        expect(component.option("count")).toBe(2);
    });

    it("dispatches attached handlers and supports cancellation", () => {
        const onChange = jest.fn();
        const Component = createComponent();
        const component = new Component();

        component.attach("change", onChange);
        expect(component.fireEvent("change", { value: "red" })).toBe(true);
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: "red", sType: "change" }));

        component.attach("beforeChange", (event) => event.stop());
        expect(component.fireEvent("beforeChange")).toBe(false);
        component.detach("change", onChange);
        expect(component.fireEvent("change")).toBe(true);
        expect(onChange).toHaveBeenCalledTimes(1);
    });
});
