function normalize(s) {
    if (!s) return '';
    return s.replace(/\s+/g, '');
}

function getTopLevelOrClauses(s) {
    let content = s;
    // Strip outer parens logic
    while (true) {
        if (content.startsWith('(') && content.endsWith(')')) {
            let depth = 0;
            let balancedAtEnd = true;
            for (let i = 0; i < content.length; i++) {
                if (content[i] === '(') depth++;
                else if (content[i] === ')') depth--;
                if (depth === 0 && i < content.length - 1) {
                    balancedAtEnd = false;
                    break;
                }
            }
            if (balancedAtEnd) {
                console.log("  Stripping outer parens...");
                content = content.substring(1, content.length - 1);
            } else {
                break;
            }
        } else {
            break;
        }
    }

    console.log("  Content to split:", content);

    const clauses = [];
    let depth = 0;
    let lastIndex = 0;

    for (let i = 0; i < content.length; i++) {
        if (content[i] === '(') depth++;
        else if (content[i] === ')') depth--;

        if (depth === 0) {
            if (content.substring(i, i + 2) === 'OR') {
                clauses.push(content.substring(lastIndex, i));
                lastIndex = i + 2;
                i++;
            }
        }
    }
    clauses.push(content.substring(lastIndex));

    return clauses.map(c => normalize(c));
}

const allQual = "((tenant_id IS NULL) OR (tenant_id IN ( SELECT profiles.tenant_id FROM profiles WHERE (profiles.user_id = ( SELECT auth.uid() AS uid)))))";
const selQual = "(tenant_id IN ( SELECT profiles.tenant_id FROM profiles WHERE (profiles.user_id = ( SELECT auth.uid() AS uid))))";

console.log("Testing ALL Qual parse:");
const normAll = normalize(allQual);
console.log("Norm ALL:", normAll);
const clauses = getTopLevelOrClauses(normAll);
console.log("Clauses:", clauses);

console.log("\nTesting SELECT Qual parse:");
let normSel = normalize(selQual);
console.log("Norm SEL:", normSel);

// Logic from script for stripping sel qual
let content = normSel;
while (true) {
    if (content.startsWith('(') && content.endsWith(')')) {
        let depth = 0;
        let balancedAtEnd = true;
        for (let i = 0; i < content.length; i++) {
            if (content[i] === '(') depth++;
            else if (content[i] === ')') depth--;
            if (depth === 0 && i < content.length - 1) { balancedAtEnd = false; break; }
        }
        if (balancedAtEnd) content = content.substring(1, content.length - 1);
        else break;
    } else break;
}
const strippedSel = content;
console.log("Stripped SEL:", strippedSel);

console.log("\nMatch check:");
if (clauses.includes(strippedSel)) {
    console.log("MATCH FOUND!");
} else {
    console.log("NO MATCH.");
    clauses.forEach((c, i) => {
        console.log(`Clause ${i} vs Sel:`);
        console.log(`  C: ${c}`);
        console.log(`  S: ${strippedSel}`);
        console.log(`  Equal? ${c === strippedSel}`);
    });
}
