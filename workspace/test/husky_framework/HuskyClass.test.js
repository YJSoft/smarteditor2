import "@src/husky_framework/HuskyClass";

describe("HuskyClass", () => {
    it("runs $init with constructor arguments", () => {
        const HuskyClass = nhn.husky.createClass({
            $init: function(value) {
                this.value = value;
            },
            getValue: function() {
                return this.value;
            }
        });

        const instance = new HuskyClass("value");

        expect(instance.getValue()).toBe("value");
    });

    it("supports construction without the new keyword", () => {
        const HuskyClass = nhn.husky.createClass({});

        expect(HuskyClass()).toBeInstanceOf(HuskyClass);
    });

    it("uses a real prototype chain and initializes parent before child", () => {
        const calls = [];
        const ParentClass = nhn.husky.createClass({
            $init: function() {
                calls.push("parent");
            },
            parentMethod: function() {
                return true;
            }
        });
        const ChildClass = nhn.husky.createClass({
            $init: function() {
                calls.push("child");
            }
        }).extend(ParentClass);

        const instance = new ChildClass();

        expect(instance).toBeInstanceOf(ChildClass);
        expect(instance).toBeInstanceOf(ParentClass);
        expect(instance.parentMethod()).toBe(true);
        expect(calls).toEqual(["parent", "child"]);
    });

    it("copies static members and inherited static values", () => {
        const ParentClass = nhn.husky.createClass({
            $static: {
                PARENT_VALUE: 1
            }
        });
        const ChildClass = nhn.husky.createClass({
            $static: {
                CHILD_VALUE: 2
            }
        }).extend(ParentClass);

        expect(ChildClass.PARENT_VALUE).toBe(1);
        expect(ChildClass.CHILD_VALUE).toBe(2);
    });
});
