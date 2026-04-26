//https://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
export class ColorGenerator {
    constructor(params = {}) {
        this.hue = Math.random() * 360;

        this.sat = params.sat ?? 0.7;
        this.light = params.light ?? 0.45;

        this.goldenAngle = 137.508;
    }

    next() {
        this.hue = (this.hue + this.goldenAngle) % 360;
        return this.hslToHex(this.hue, this.sat, this.light);
    }

    hslToHex(h, s, l) {

        const hueRot = n => (n + h / 30) % 12;
        const chroma = s * Math.min(l, 1 - l);
        const channelVal = n =>
            l - chroma * Math.max(-1, Math.min(hueRot(n) - 3, Math.min(9 - hueRot(n), 1)));

        const r = Math.round(255 * channelVal(0));
        const g = Math.round(255 * channelVal(8));
        const b = Math.round(255 * channelVal(4));

        return (r << 16) + (g << 8) + b;
    }
}