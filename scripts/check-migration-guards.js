const fs = require("fs");
const path = require("path");
const espree = require("espree");

const projectRoot = path.resolve(__dirname, "..");
const sourceGroups = [
    {
        name: "workspace/src",
        root: path.join(projectRoot, "workspace/src"),
        maximumJindoReferences: 371
    },
    {
        name: "workspace/static/js/service",
        root: path.join(projectRoot, "workspace/static/js/service"),
        maximumJindoReferences: 6
    }
];

const prohibitedJQueryPatterns = [
    {
        name: "jQuery.proxy()/$.proxy()",
        pattern: /\b(?:jQuery|\$)\s*\.\s*proxy\s*\(/
    },
    {
        name: "jQuery.trim()/$.trim()",
        pattern: /\b(?:jQuery|\$)\s*\.\s*trim\s*\(/
    },
    {
        name: "legacy jQuery event API",
        pattern: /(?:jQuery|\$)\s*\([^;\n]*\)\s*\.\s*(?:bind|unbind|delegate|undelegate)\s*\(/
    }
];
const removedJindoMembers = ["$Class", "$Event", "$Fn", "$Agent", "$A", "$H", "$Ajax", "$S", "$Document", "$Cookie", "$Date", "$Json"];

function listJavaScriptFiles(root) {
    const files = [];
    const entries = fs.readdirSync(root, { withFileTypes: true });

    entries.forEach((entry) => {
        const entryPath = path.join(root, entry.name);
        if (entry.isDirectory()) {
            files.push(...listJavaScriptFiles(entryPath));
        } else if (entry.isFile() && entry.name.endsWith(".js")) {
            files.push(entryPath);
        }
    });

    return files;
}

function stripComments(source) {
    let result = "";
    let state = "code";

    for (let i = 0; i < source.length; i += 1) {
        const character = source[i];
        const nextCharacter = source[i + 1];

        if (state === "line-comment") {
            if (character === "\n") {
                state = "code";
                result += character;
            } else {
                result += " ";
            }
            continue;
        }

        if (state === "block-comment") {
            if (character === "*" && nextCharacter === "/") {
                state = "code";
                result += "  ";
                i += 1;
            } else {
                result += character === "\n" ? "\n" : " ";
            }
            continue;
        }

        if (state === "single-quote" || state === "double-quote" || state === "template") {
            result += character;
            if (character === "\\") {
                result += nextCharacter || "";
                i += 1;
                continue;
            }
            if (
                (state === "single-quote" && character === "'") ||
                (state === "double-quote" && character === '"') ||
                (state === "template" && character === "`")
            ) {
                state = "code";
            }
            continue;
        }

        if (character === "/" && nextCharacter === "/") {
            state = "line-comment";
            result += "  ";
            i += 1;
        } else if (character === "/" && nextCharacter === "*") {
            state = "block-comment";
            result += "  ";
            i += 1;
        } else {
            result += character;
            if (character === "'") {
                state = "single-quote";
            } else if (character === '"') {
                state = "double-quote";
            } else if (character === "`") {
                state = "template";
            }
        }
    }

    return result;
}

function analyzeJindoReferences(source) {
    const syntaxTree = espree.parse(source, {
        ecmaVersion: 2020,
        sourceType: "module"
    });
    const references = {
        total: 0,
        members: {}
    };

    function visit(node) {
        if (!node || typeof node !== "object") {
            return;
        }
        if (node.type === "MemberExpression" && node.object && node.object.type === "Identifier" && node.object.name === "jindo") {
            references.total += 1;
            if (!node.computed && node.property && node.property.type === "Identifier") {
                references.members[node.property.name] = (references.members[node.property.name] || 0) + 1;
            }
        }
        Object.keys(node).forEach((key) => {
            const child = node[key];
            if (Array.isArray(child)) {
                child.forEach(visit);
            } else {
                visit(child);
            }
        });
    }

    visit(syntaxTree);
    return references;
}

let hasError = false;

sourceGroups.forEach((group) => {
    let jindoReferenceCount = 0;

    listJavaScriptFiles(group.root).forEach((filename) => {
        const relativeFilename = path.relative(projectRoot, filename);
        const originalSource = fs.readFileSync(filename, "utf8");
        const source = stripComments(originalSource);
        const references = analyzeJindoReferences(originalSource);
        jindoReferenceCount += references.total;
        removedJindoMembers.forEach((member) => {
            if (references.members[member]) {
                console.error(`[migration] ${relativeFilename} restored removed jindo.${member}.`);
                hasError = true;
            }
        });

        prohibitedJQueryPatterns.forEach((prohibited) => {
            if (prohibited.pattern.test(source)) {
                console.error(`[migration] ${relativeFilename} uses prohibited ${prohibited.name}.`);
                hasError = true;
            }
        });
    });

    console.log(
        `[migration] ${group.name}: ${jindoReferenceCount}/${group.maximumJindoReferences} Jindo references`
    );
    if (jindoReferenceCount > group.maximumJindoReferences) {
        console.error(`[migration] Jindo references increased in ${group.name}.`);
        hasError = true;
    }
});

const packageJson = require(path.join(projectRoot, "package.json"));
if (!packageJson.devDependencies || packageJson.devDependencies.jquery !== "3.7.1") {
    console.error("[migration] The development baseline must remain jQuery 3.7.1 until intentionally changed.");
    hasError = true;
}

if (hasError) {
    process.exitCode = 1;
}
