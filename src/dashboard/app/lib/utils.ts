export function itFormatter(
    v: bigint | number,
    fractionDigits: number
): string {
    // XXX last division by 1000 should be made using number type
    // to allow decimals
    let cs: number = 0;
    let s = ["", "K", "M", "G", "T", "P"];
    let r: number;

    if (typeof v !== "number") {
        const n1000 = BigInt(1000);
        const n0 = BigInt(0);

        if (v == n0) return "0 ";

        while (v >= 1000000 && cs < s.length) {
            v = v / n1000;
            cs = cs + 1;
        }
        r = Number(v);
    } else {
        if (v == 0) return "0 ";
        if (v < 1) return "< 1 ";

        r = v;
        cs = 0;
        while (r >= 1000000 && cs < s.length) {
            r = r / 1000;
            cs = cs + 1;
        }
    }

    if (r >= 1000 && cs < s.length) {
        r = r / 1000;
        cs = cs + 1;
    }

    return `${r.toFixed(fractionDigits)} ${s[cs]}`;
}
