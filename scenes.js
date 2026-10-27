/* Destination illustrations (inline SVG) in the ASHRF brand style:
 * dusk sky (night → blue → teal), low orange sun, a recognisable silhouette, and the
 * logo's sea waves. Used when a trip has no real photo.
 * Usage: Scenes.render("istanbul") · Scenes.hero()
 */
(() => {
  "use strict";
  const C = { night: "#0B2A57", deep: "#123F80", blue: "#1A5DB8", teal: "#1A8FC9", sun: "#F7A41D", snow: "#EAF2FF" };
  let n = 0;

  // Shared frame: sky, sun, far hills, then the scene's silhouette, then sea + waves.
  function frame(w, h, ground, sunX, silhouette, opts = {}) {
    const id = "sc" + (++n);
    const g = ground;
    const waves = [[0.08, 0.28, C.sun], [0.46, 0.34, C.teal], [0.02, 0.18, C.teal], [0.62, 0.22, C.sun]]
      .map(([x, ww, c], i) => `<rect x="${x * w}" y="${g + 10 + i * 9}" width="${ww * w}" height="3.5" rx="1.75" fill="${c}" opacity="${(0.85 - i * 0.16).toFixed(2)}"/>`).join("");
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${C.night}"/><stop offset=".55" stop-color="${opts.mid || C.blue}"/><stop offset="${(g / h).toFixed(2)}" stop-color="${opts.horizon || C.teal}"/>
        </linearGradient>
        <radialGradient id="${id}u"><stop offset="0" stop-color="${C.sun}"/><stop offset=".6" stop-color="${C.sun}"/><stop offset="1" stop-color="${C.sun}" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#${id}s)"/>
      <circle cx="${sunX}" cy="${g - 6}" r="${h * 0.22}" fill="url(#${id}u)"/>
      <path d="M0 ${g - 10} Q ${w * 0.25} ${g - 34} ${w * 0.5} ${g - 14} T ${w} ${g - 18} V ${h} H 0 Z" fill="${C.deep}" opacity=".55"/>
      ${silhouette}
      <rect x="0" y="${g}" width="${w}" height="${h - g}" fill="${opts.ground || C.night}"/>
      ${opts.sea === false ? "" : waves}
    </svg>`;
  }

  const W = 400, H = 240, G = 168;

  const scenes = {
    // Mosque with four minarets, Galata-style tower and low city
    istanbul() {
      const cx = 255;
      let s = `<g fill="${C.night}">`;
      s += `<rect x="${cx - 55}" y="${G - 22}" width="110" height="22"/><rect x="${cx - 34}" y="${G - 34}" width="68" height="12"/>`;
      s += `<path d="M${cx - 36} ${G - 34} A36 36 0 0 1 ${cx + 36} ${G - 34} Z"/><rect x="${cx - 1}" y="${G - 82}" width="2" height="12"/>`;
      s += `<path d="M${cx - 58} ${G - 22} A17 17 0 0 1 ${cx - 24} ${G - 22} Z"/><path d="M${cx + 24} ${G - 22} A17 17 0 0 1 ${cx + 58} ${G - 22} Z"/>`;
      for (const [mx, mh] of [[cx - 70, 104], [cx + 70, 104], [cx - 86, 88], [cx + 86, 88]]) {
        s += `<rect x="${mx - 2.2}" y="${G - mh}" width="4.4" height="${mh}"/><path d="M${mx - 3} ${G - mh} L${mx} ${G - mh - 16} L${mx + 3} ${G - mh} Z"/><rect x="${mx - 4}" y="${G - mh * 0.72}" width="8" height="2"/>`;
      }
      s += `<rect x="60" y="${G - 62}" width="17" height="62"/><path d="M58 ${G - 62} L68.5 ${G - 84} L79 ${G - 62} Z"/>`;
      for (const [x, w, h] of [[0, 26, 26], [22, 30, 40], [80, 34, 22], [112, 26, 34], [134, 44, 18], [330, 28, 32], [352, 30, 22], [378, 22, 40]]) s += `<rect x="${x}" y="${G - h}" width="${w}" height="${h}"/>`;
      return frame(W, H, G, 110, s + "</g>");
    },

    // Caucasus peaks with snow caps and a hilltop church
    georgia() {
      let s = `<path d="M-10 ${G} L70 ${G - 92} L110 ${G - 60} L170 ${G - 124} L240 ${G - 50} L300 ${G - 104} L410 ${G} Z" fill="${C.deep}"/>`;
      s += `<path d="M152 ${G - 96} L170 ${G - 124} L188 ${G - 98} L178 ${G - 92} L170 ${G - 100} L162 ${G - 90} Z" fill="${C.snow}" opacity=".9"/>`;
      s += `<path d="M284 ${G - 80} L300 ${G - 104} L316 ${G - 82} L306 ${G - 78} L300 ${G - 86} L292 ${G - 76} Z" fill="${C.snow}" opacity=".85"/>`;
      s += `<path d="M58 ${G - 74} L70 ${G - 92} L82 ${G - 76} L74 ${G - 72} Z" fill="${C.snow}" opacity=".8"/>`;
      s += `<g fill="${C.night}"><path d="M-10 ${G} Q 90 ${G - 54} 190 ${G - 30} T 410 ${G - 20} V ${G} Z"/>`;
      s += `<rect x="96" y="${G - 70}" width="34" height="22"/><rect x="106" y="${G - 84}" width="14" height="14"/><path d="M104 ${G - 84} L113 ${G - 100} L122 ${G - 84} Z"/><rect x="112" y="${G - 108}" width="2" height="8"/></g>`;
      return frame(W, H, G, 330, s, { mid: C.blue });
    },

    // Sandstone cliffs with the Treasury façade
    petra() {
      const rock = "#8C4A1A", rockLight = "#B8692E";
      let s = `<path d="M-10 ${G} L-10 ${G - 120} Q 40 ${G - 140} 90 ${G - 128} L150 ${G - 132} L150 ${G} Z" fill="${rock}"/>`;
      s += `<path d="M250 ${G} L250 ${G - 136} Q 320 ${G - 150} 410 ${G - 126} L410 ${G} Z" fill="${rock}"/>`;
      s += `<path d="M150 ${G} L150 ${G - 132} L250 ${G - 136} L250 ${G} Z" fill="${rockLight}"/>`;
      s += `<g fill="${rock}" opacity=".9"><rect x="166" y="${G - 112}" width="68" height="4"/><path d="M168 ${G - 112} L200 ${G - 126} L232 ${G - 112} Z"/><rect x="176" y="${G - 104}" width="48" height="3"/>`;
      for (const x of [170, 184, 210, 224]) s += `<rect x="${x}" y="${G - 60}" width="5" height="60"/><rect x="${x}" y="${G - 100}" width="5" height="32"/>`;
      s += `<rect x="166" y="${G - 64}" width="68" height="4"/><rect x="193" y="${G - 40}" width="14" height="40"/><path d="M196 ${G - 100} h8 v22 h-8 Z"/></g>`;
      s += `<path d="M-10 ${G} Q 120 ${G - 14} 200 ${G - 6} T 410 ${G - 10} V ${G} Z" fill="#5A2E10"/>`;
      // desert: sand ground instead of the sea
      return frame(W, H, G, 200, s, { mid: "#2A5EA8", horizon: "#E0A458", ground: "#5A2E10", sea: false });
    },

    // Burj Khalifa, towers and the sail hotel
    dubai() {
      let s = `<g fill="${C.night}">`;
      s += `<path d="M196 ${G} L196 ${G - 60} L200 ${G - 60} L200 ${G - 100} L203 ${G - 100} L203 ${G - 132} L205 ${G - 132} L206 ${G - 156} L207 ${G - 132} L209 ${G - 132} L209 ${G - 100} L212 ${G - 100} L212 ${G - 60} L216 ${G - 60} L216 ${G} Z"/>`;
      for (const [x, w, h] of [[110, 20, 70], [134, 16, 92], [154, 22, 58], [232, 18, 80], [254, 24, 64], [282, 14, 98], [300, 22, 52], [80, 22, 46]]) s += `<rect x="${x}" y="${G - h}" width="${w}" height="${h}"/>`;
      s += `<path d="M340 ${G} L340 ${G - 84} Q 372 ${G - 66} 374 ${G} Z"/><rect x="336" y="${G - 88}" width="3" height="88"/></g>`;
      return frame(W, H, G, 110, s, { horizon: "#3AA0D8" });
    },

    // Temple spire, palms and karst islands in the sea
    thailand() {
      let s = `<g fill="${C.night}">`;
      s += `<path d="M150 ${G} L150 ${G - 20} L160 ${G - 20} L160 ${G - 34} L168 ${G - 34} L174 ${G - 70} L176 ${G - 96} L178 ${G - 70} L184 ${G - 34} L192 ${G - 34} L192 ${G - 20} L202 ${G - 20} L202 ${G} Z"/>`;
      s += `<path d="M120 ${G} L120 ${G - 16} L132 ${G - 30} L144 ${G - 16} L144 ${G} Z"/><path d="M208 ${G} L208 ${G - 16} L220 ${G - 30} L232 ${G - 16} L232 ${G} Z"/>`;
      for (const [x, h, flip] of [[48, 78, 1], [70, 64, -1], [352, 72, -1]]) {
        s += `<path d="M${x} ${G} Q ${x + 6 * flip} ${G - h / 2} ${x + 2 * flip} ${G - h}" stroke="${C.night}" stroke-width="4" fill="none"/>`;
        const tx = x + 2 * flip, ty = G - h;
        s += `<path d="M${tx} ${ty} q -22 -4 -30 10 q 14 -8 30 -10 Z M${tx} ${ty} q 22 -4 30 10 q -14 -8 -30 -10 Z M${tx} ${ty} q -8 -18 -24 -18 q 14 4 24 18 Z M${tx} ${ty} q 8 -18 24 -18 q -14 4 -24 18 Z"/>`;
      }
      s += `</g><g fill="${C.deep}"><path d="M262 ${G} Q 262 ${G - 46} 280 ${G - 52} Q 296 ${G - 46} 296 ${G} Z"/><path d="M300 ${G} Q 302 ${G - 30} 314 ${G - 34} Q 326 ${G - 28} 326 ${G} Z"/></g>`;
      return frame(W, H, G, 300, s, { horizon: "#26A69A" });
    },

    // Generic: plane over sea with palms (the logo's motif)
    default() { return hero(W, H, G); },
  };

  function hero(w = 800, h = 300, g = 214) {
    let s = `<g fill="${C.night}">`;
    for (const [x, hh, flip] of [[w * 0.07, h * 0.36, 1], [w * 0.11, h * 0.28, -1]]) {
      s += `<path d="M${x} ${g} Q ${x + 8 * flip} ${g - hh / 2} ${x + 3 * flip} ${g - hh}" stroke="${C.night}" stroke-width="5" fill="none"/>`;
      const tx = x + 3 * flip, ty = g - hh;
      s += `<path d="M${tx} ${ty} q -28 -5 -38 12 q 18 -10 38 -12 Z M${tx} ${ty} q 28 -5 38 12 q -18 -10 -38 -12 Z M${tx} ${ty} q -10 -22 -30 -22 q 18 5 30 22 Z M${tx} ${ty} q 10 -22 30 -22 q -18 5 -30 22 Z"/>`;
    }
    s += `</g>`;
    // plane with contrail
    const px = w * 0.62, py = h * 0.3;
    s += `<path d="M${w * 0.18} ${py + 34} Q ${w * 0.4} ${py + 30} ${px - 10} ${py + 6}" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="2" fill="none" stroke-dasharray="6 6"/>`;
    s += `<g transform="translate(${px} ${py}) rotate(-14)" fill="#FFFFFF"><path d="M-30 0 q 0 -5 14 -5 h 38 q 10 0 14 5 q -4 5 -14 5 h -38 q -14 0 -14 -5 Z"/><path d="M-4 3 l -14 18 h 7 l 20 -18 Z" opacity=".9"/><path d="M-4 -3 l -9 -12 h 6 l 14 12 Z" opacity=".9"/><path d="M-27 -2 l -6 -10 h 5 l 9 10 Z" fill="${C.sun}"/></g>`;
    return frame(w, h, g, w * 0.3, s, { sea: false });
  }

  window.Scenes = {
    render(kind) { return (scenes[kind] || scenes.default)(); },
    hero: () => hero(),
    kinds: Object.keys(scenes),
  };
})();
