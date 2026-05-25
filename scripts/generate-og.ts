import fs from "fs";
import path from "path";
import { createElement } from "react";
import YAML from "yaml";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

interface Link {
  type: string;
  url: string;
  label: string;
  size: string;
}

function parseLinks(raw: string): Link[] {
  return raw
    .split("---")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((block) => YAML.parse(block) as Link);
}

function lighten(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

const ICON_PATHS: Record<string, { d: string; fill: string }> = {
  LinkedIn: {
    fill: "#0A66C2",
    d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  GitHub: {
    fill: "#1A1A1A",
    d: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
  },
  X: {
    fill: "#1A1A1A",
    d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
};

function makeSvgDataUri(label: string): string {
  const icon = ICON_PATHS[label];
  if (!icon) return "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${icon.fill}"><path d="${icon.d}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// Layout constants
// 1200 = 60(padL) + left(flexible) + 40(gap) + 300(right) + 50(padR)
// Right section = ~1/8 of total width → long names never collide with tiles
const RIGHT_W = 300;
const TILE_GAP = 10;
const TILE_RADIUS = "10px";

function makeBentoTiles(accent: string) {
  const accentLight = lighten(accent, 0.72);
  const accentMid = lighten(accent, 0.4);
  const accentSoft = lighten(accent, 0.2);

  // TileA + TileB row: 140 + 10 + 150 = 300
  const tileA = createElement(
    "div",
    {
      style: {
        width: "140px",
        height: "100px",
        backgroundColor: accentLight,
        borderRadius: TILE_RADIUS,
        overflow: "hidden",
        position: "relative",
        display: "flex",
      },
    },
    createElement("div", {
      style: {
        position: "absolute",
        width: "90px",
        height: "90px",
        borderRadius: "45px",
        backgroundColor: accentMid,
        top: "-22px",
        left: "-18px",
      },
    }),
    createElement("div", {
      style: {
        position: "absolute",
        width: "65px",
        height: "65px",
        borderRadius: "33px",
        backgroundColor: accent,
        bottom: "-18px",
        right: "10px",
      },
    }),
    createElement("div", {
      style: {
        position: "absolute",
        width: "48px",
        height: "48px",
        borderRadius: "24px",
        backgroundColor: accentSoft,
        top: "26px",
        left: "56px",
      },
    }),
  );

  const tileB = createElement(
    "div",
    {
      style: {
        width: "150px",
        height: "100px",
        backgroundColor: "#1a1a1a",
        borderRadius: TILE_RADIUS,
        overflow: "hidden",
        position: "relative",
        display: "flex",
      },
    },
    createElement("div", {
      style: {
        position: "absolute",
        width: "110px",
        height: "110px",
        borderRadius: "55px",
        backgroundColor: "#2a2a2a",
        top: "-35px",
        right: "-22px",
      },
    }),
    createElement("div", {
      style: {
        position: "absolute",
        width: "42px",
        height: "42px",
        borderRadius: "21px",
        backgroundColor: accent,
        bottom: "14px",
        left: "18px",
      },
    }),
    createElement("div", {
      style: {
        position: "absolute",
        width: "18px",
        height: "18px",
        borderRadius: "9px",
        backgroundColor: accentLight,
        top: "18px",
        left: "62px",
      },
    }),
    createElement("div", {
      style: {
        position: "absolute",
        width: "9px",
        height: "9px",
        borderRadius: "5px",
        backgroundColor: accentMid,
        top: "52px",
        right: "36px",
      },
    }),
  );

  // TileC:
  const tileC = createElement(
    "div",
    {
      style: {
        width: `${RIGHT_W}px`,
        height: "62px",
        backgroundColor: accent,
        borderRadius: TILE_RADIUS,
        overflow: "hidden",
        position: "relative",
        display: "flex",
      },
    },
    createElement("div", {
      style: {
        position: "absolute",
        width: "150px",
        height: "150px",
        borderRadius: "75px",
        backgroundColor: "rgba(255,255,255,0.06)",
        top: "-65px",
        right: "-15px",
      },
    }),
    createElement("div", {
      style: {
        position: "absolute",
        width: "90px",
        height: "90px",
        borderRadius: "45px",
        backgroundColor: "rgba(255,255,255,0.05)",
        bottom: "-35px",
        left: "40px",
      },
    }),
    createElement("div", {
      style: {
        position: "absolute",
        width: "8px",
        height: "8px",
        borderRadius: "4px",
        backgroundColor: "rgba(255,255,255,0.30)",
        top: "18px",
        left: "28px",
      },
    }),
    createElement("div", {
      style: {
        position: "absolute",
        width: "6px",
        height: "6px",
        borderRadius: "3px",
        backgroundColor: "rgba(255,255,255,0.20)",
        top: "40px",
        left: "56px",
      },
    }),
    createElement("div", {
      style: {
        position: "absolute",
        width: "8px",
        height: "8px",
        borderRadius: "4px",
        backgroundColor: "rgba(255,255,255,0.28)",
        top: "16px",
        left: "110px",
      },
    }),
    createElement("div", {
      style: {
        position: "absolute",
        width: "6px",
        height: "6px",
        borderRadius: "3px",
        backgroundColor: "rgba(255,255,255,0.20)",
        top: "38px",
        left: "160px",
      },
    }),
    createElement("div", {
      style: {
        position: "absolute",
        width: "8px",
        height: "8px",
        borderRadius: "4px",
        backgroundColor: "rgba(255,255,255,0.24)",
        top: "20px",
        left: "218px",
      },
    }),
    createElement("div", {
      style: {
        position: "absolute",
        width: "6px",
        height: "6px",
        borderRadius: "3px",
        backgroundColor: "rgba(255,255,255,0.18)",
        top: "40px",
        left: "260px",
      },
    }),
  );

  return createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: `${TILE_GAP}px`,
        width: `${RIGHT_W}px`,
      },
    },
    createElement(
      "div",
      {
        style: { display: "flex", flexDirection: "row", gap: `${TILE_GAP}px` },
      },
      tileA,
      tileB,
    ),
    tileC,
  );
}

async function main() {
  const configPath = path.join(process.cwd(), "content", "config.yaml");
  const linksPath = path.join(process.cwd(), "content", "links.yaml");
  const avatarPath = path.join(process.cwd(), "public", "profile.png");

  let configRaw: string;
  try {
    configRaw = fs.readFileSync(configPath, "utf-8");
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error("Missing required content file: content/config.yaml");
    }
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Cannot read content/config.yaml: ${msg}`);
  }
  const config = YAML.parse(configRaw) as {
    name: string;
    tagline: string;
    accent?: string;
  };
  const { name, tagline } = config;
  const accent = config.accent ?? "#9c88ff";

  const linksRaw = fs.readFileSync(linksPath, "utf-8");
  const socialLinks = parseLinks(linksRaw).filter(
    (l) => l.url && l.label && ICON_PATHS[l.label],
  );

  const avatarBuffer = fs.readFileSync(avatarPath);
  const avatarSrc = `data:image/png;base64,${avatarBuffer.toString("base64")}`;

  const fontRes = await fetch(
    "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf",
  );
  if (!fontRes.ok)
    throw new Error(`Failed to fetch Inter font: ${fontRes.status}`);
  const fontData = await fontRes.arrayBuffer();

  const element = createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "1200px",
        height: "630px",
        backgroundColor: "#fafafa",
      },
    },
    // Top band
    createElement("div", {
      style: {
        width: "1200px",
        height: "32px",
        backgroundColor: accent,
        flexShrink: 0,
      },
    }),
    // Content row — left centered, right top-aligned
    createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "row",
          flex: 1,
          paddingLeft: "60px",
          paddingRight: "50px",
          gap: "40px",
        },
      },
      // Left: avatar + text, vertically centered
      createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "32px",
            width: "490px",
            flexShrink: 0,
          },
        },
        createElement("img", {
          src: avatarSrc,
          width: 150,
          height: 150,
          style: {
            borderRadius: "75px",
            width: "150px",
            height: "150px",
            objectFit: "cover",
            flexShrink: 0,
          },
        }),
        createElement(
          "div",
          { style: { display: "flex", flexDirection: "column" } },
          createElement(
            "h1",
            {
              style: {
                fontSize: "46px",
                fontWeight: 700,
                color: "#1a1a1a",
                margin: 0,
                lineHeight: 1.1,
              },
            },
            name,
          ),
          createElement(
            "p",
            {
              style: {
                fontSize: "20px",
                color: "#737373",
                marginTop: "10px",
                marginBottom: 0,
                lineHeight: 1.4,
              },
            },
            tagline,
          ),
          createElement(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "row",
                gap: "16px",
                marginTop: "20px",
              },
            },
            ...socialLinks.map((link) =>
              createElement("img", {
                key: link.label,
                src: makeSvgDataUri(link.label),
                width: 24,
                height: 24,
                style: { width: "24px", height: "24px" },
              }),
            ),
          ),
        ),
      ),
      // Right: bento tiles anchored to top
      createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-end",
            flex: 1,
            paddingTop: "36px",
          },
        },
        makeBentoTiles(accent),
      ),
    ),
    // Bottom band
    createElement("div", {
      style: {
        width: "1200px",
        height: "32px",
        backgroundColor: accent,
        flexShrink: 0,
      },
    }),
  );

  const svg = await satori(element, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Inter", data: fontData, weight: 400, style: "normal" },
      { name: "Inter", data: fontData, weight: 700, style: "normal" },
    ],
  });

  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  const outputPath = path.join(process.cwd(), "public", "og.png");
  fs.writeFileSync(outputPath, pngBuffer);
  console.log("OG image generated at public/og.png");
}

main().catch((err) => {
  console.error("Failed to generate OG image:", err);
  process.exit(1);
});
