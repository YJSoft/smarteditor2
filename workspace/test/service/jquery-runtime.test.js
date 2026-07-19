import fs from "fs";
import path from "path";
import jQuery from "jquery";

const skinFiles = [
    "SmartEditor2Skin.html",
    "SmartEditor2Skin_ko_KR.html",
    "SmartEditor2Skin_en_US.html",
    "SmartEditor2Skin_ja_JP.html",
    "SmartEditor2Skin_zh_CN.html",
    "SmartEditor2Skin_zh_TW.html",
    "index.html"
];

describe("jQuery runtime", () => {
    it("uses jQuery 3.7.1 as the development baseline", () => {
        expect(jQuery.fn.jquery).toBe("3.7.1");
    });

    it.each(skinFiles)("loads jQuery before Jindo during migration: %s", (skinFile) => {
        const html = fs.readFileSync(path.join(process.cwd(), "workspace/static", skinFile), "utf8");
        const jQueryIndex = html.indexOf("./js/lib/jquery.min.js");
        const jindoIndex = html.indexOf("./js/lib/jindo2.all.js");

        expect(jQueryIndex).toBeGreaterThan(-1);
        expect(jindoIndex).toBeGreaterThan(jQueryIndex);
    });
});
