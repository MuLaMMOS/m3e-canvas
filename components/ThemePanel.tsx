"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ENTRANCES, EntranceScheme, FONTS, Palette, SHAPES, ShapeScale, Theme, entranceCssVars } from "@/lib/tokens";
import { ensureFontLoaded } from "@/lib/theme";
import { Lang, UIKey, t, useLang } from "@/lib/i18n";
import { Icon } from "./M3Node";
import { Toggle } from "./ui";

/** each entrance recipe is its own button, so each needs its own name */
const ENTRANCE_KEY: Record<EntranceScheme, UIKey> = {
  off: "entranceOff",
  soft: "entranceSoft",
  tip: "entranceTip",
  modal: "entranceModal",
  slide: "entranceSlide",
};

/** The art for a recipe: a solid square where the part lands, a dashed outline where it starts
 *  (bigger the harder it compresses, or displaced downward for the slide), so the five buttons
 *  read differently at a glance even before they play. */
function EntranceArt({ k, p }: { k: EntranceScheme; p: Palette }) {
  const c = 28;
  const ghost: Record<EntranceScheme, { s: number; dy: number }> = {
    off: { s: 0, dy: 0 },
    soft: { s: 18, dy: 0 },
    tip: { s: 22, dy: 0 },
    modal: { s: 26, dy: 0 },
    slide: { s: 12, dy: 9 },
  };
  const g = ghost[k];
  return (
    <svg width="56" height="34" viewBox="0 0 56 34" aria-hidden>
      <rect x={c - 6} y={17 - 6} width="12" height="12" rx="3.5" fill={p.primary} opacity="0.9" />
      {g.s > 0 && (
        <rect
          x={c - g.s / 2}
          y={17 - g.s / 2 + g.dy}
          width={g.s}
          height={g.s}
          rx={4}
          fill="none"
          stroke={p.outline}
          strokeDasharray="3 3"
        />
      )}
      {k === "slide" && (
        <g stroke={p.outline} strokeWidth="1.5" fill="none" strokeLinecap="round">
          <path d={`M${c + 13} 29 L${c + 13} 15`} />
          <path d={`M${c + 9} 19 L${c + 13} 15 L${c + 17} 19`} />
        </g>
      )}
    </svg>
  );
}

const shapeLabel = (k: ShapeScale, lang: Lang) => (k === "square" ? t("shapeSquare", lang) : k === "full" ? t("shapeFull", lang) : t("shapeRounded", lang));

/** the corner radius a 28dp default becomes under each scale, for the option art */
const previewR = (k: ShapeScale) => (k === "square" ? 6 : k === "full" ? 28 : 16);

function Hint({ p, children }: { p: Palette; children: React.ReactNode }) {
  return <div style={{ fontSize: 11, lineHeight: 1.5, color: p.onSurfaceVariant, padding: "0 4px" }}>{children}</div>;
}

function OptionCard({
  on,
  onClick,
  p,
  label,
  children,
}: {
  on: boolean;
  onClick: () => void;
  p: Palette;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="m3-press"
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "12px 8px 10px",
        borderRadius: 16,
        border: "none",
        background: on ? p.secondaryContainer : p.surfaceContainerLow,
        color: on ? p.onSecondaryContainer : p.onSurface,
        cursor: "pointer",
        outline: on ? `2px solid ${p.primary}` : "2px solid transparent",
        outlineOffset: 1,
      }}
    >
      {children}
      <span style={{ fontSize: 12, fontWeight: 600, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
    </button>
  );
}

/** Three cards, each drawing a button, a FAB and a card at that corner scale. */
export function ShapePanel({ p, theme, onChange }: { p: Palette; theme: Theme; onChange: (patch: Partial<Theme>) => void }) {
  const lang = useLang();
  return (
    <div className="no-scrollbar" style={{ height: "100%", overflowY: "auto", padding: "12px 12px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: p.onSurfaceVariant, padding: "0 4px" }}>{t("shapeScale", lang)}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {SHAPES.map((sh) => {
          const r = previewR(sh.key);
          const on = theme.shape === sh.key;
          return (
            <button
              key={sh.key}
              onClick={() => onChange({ shape: sh.key })}
              aria-pressed={on}
              className="m3-press"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 10,
                padding: "12px 14px 14px",
                borderRadius: 16,
                border: "none",
                background: on ? p.secondaryContainer : p.surfaceContainerLow,
                color: on ? p.onSecondaryContainer : p.onSurface,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shapeLabel(sh.key, lang)}</span>
                {on && <Icon name="check" size={20} />}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 64, height: 26, borderRadius: r, background: p.primary }} />
                <span style={{ width: 26, height: 26, borderRadius: Math.round(r * 0.6), background: p.primaryContainer }} />
                <span style={{ width: 40, height: 26, borderRadius: Math.round(r * 0.7), background: p.surfaceContainerHighest, border: `1px solid ${p.outlineVariant}`, boxSizing: "border-box" }} />
              </span>
            </button>
          );
        })}
      </div>
      <Hint p={p}>{t("shapeHint", lang)}</Hint>
    </div>
  );
}

/** Typeface rows rendered in their own face, and the emphasized switch with a live sample. */
export function TypePanel({ p, theme, onChange }: { p: Palette; theme: Theme; onChange: (patch: Partial<Theme>) => void }) {
  const lang = useLang();
  return (
    <div className="no-scrollbar" style={{ height: "100%", overflowY: "auto", padding: "12px 12px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: p.onSurfaceVariant, padding: "0 4px" }}>{t("fontFamily", lang)}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {FONTS.map((f) => {
          const on = theme.font === f.key;
          ensureFontLoaded(f.key);
          return (
            <button
              key={f.key}
              onClick={() => onChange({ font: f.key })}
              aria-pressed={on}
              className="m3-press"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                height: 52,
                padding: "0 14px 0 12px",
                borderRadius: 16,
                border: "none",
                background: on ? p.secondaryContainer : p.surfaceContainerLow,
                color: on ? p.onSecondaryContainer : p.onSurface,
                cursor: "pointer",
                textAlign: "left",
                fontFamily: f.family,
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 600, width: 36, flex: "0 0 auto" }}>Aa</span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.label}</span>
              {on && <Icon name="check" size={20} />}
            </button>
          );
        })}
      </div>

      <div style={{ padding: 12, borderRadius: 16, background: p.surfaceContainerLow, display: "flex", flexDirection: "column", gap: 8 }}>
        <Toggle on={theme.emphasized} onChange={(emphasized) => onChange({ emphasized })} p={p} icon="format_bold" label={t("emphasized", lang)} grow />
        <Hint p={p}>{t("emphasizedHint", lang)}</Hint>
      </div>
    </div>
  );
}

/** Two option cards that replay their own motion when chosen, plus a tap-to-try dot. */
export function MotionPanel({ p, theme, onChange }: { p: Palette; theme: Theme; onChange: (patch: Partial<Theme>) => void }) {
  const lang = useLang();
  const [tick, setTick] = useState(0);
  const expressive = theme.motion === "expressive";
  return (
    <div className="no-scrollbar" style={{ height: "100%", overflowY: "auto", padding: "12px 12px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: p.onSurfaceVariant, padding: "0 4px" }}>{t("motionScheme", lang)}</div>
      <div style={{ display: "flex", gap: 6 }}>
        <OptionCard on={!expressive} onClick={() => { onChange({ motion: "standard" }); setTick((n) => n + 1); }} p={p} label={t("motionStandard", lang)}>
          <svg width="64" height="36" viewBox="0 0 64 36" aria-hidden>
            <path d="M4 32 C 24 32, 30 4, 60 4" fill="none" stroke={p.primary} strokeWidth="3" strokeLinecap="round" />
          </svg>
        </OptionCard>
        <OptionCard on={expressive} onClick={() => { onChange({ motion: "expressive" }); setTick((n) => n + 1); }} p={p} label={t("motionExpressive", lang)}>
          <svg width="64" height="36" viewBox="0 0 64 36" aria-hidden>
            <path d="M4 32 C 16 32, 20 -6, 32 6 S 48 10, 60 4" fill="none" stroke={p.primary} strokeWidth="3" strokeLinecap="round" />
          </svg>
        </OptionCard>
      </div>
      <Hint p={p}>{t("motionHint", lang)}</Hint>

      <div style={{ fontSize: 12, fontWeight: 700, color: p.onSurfaceVariant, padding: "0 4px", marginTop: 4 }}>{t("entrance", lang)}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        {ENTRANCES.map((e) => (
          <button
            key={e.key}
            onClick={() => {
              onChange({ entrance: e.key });
              setTick((n) => n + 1);
            }}
            aria-pressed={theme.entrance === e.key}
            title={`${t(ENTRANCE_KEY[e.key], lang)} · ${e.ms ? `${e.ms}ms` : "—"}`}
            className="m3-press"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              padding: "9px 4px 7px",
              borderRadius: 14,
              border: "none",
              background: theme.entrance === e.key ? p.secondaryContainer : p.surfaceContainerLow,
              color: theme.entrance === e.key ? p.onSecondaryContainer : p.onSurface,
              cursor: "pointer",
              outline: theme.entrance === e.key ? `2px solid ${p.primary}` : "2px solid transparent",
              outlineOffset: 1,
            }}
          >
            <EntranceArt k={e.key} p={p} />
            <span style={{ fontSize: 11, fontWeight: 600, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {t(ENTRANCE_KEY[e.key], lang)}
            </span>
            <span style={{ fontSize: 10, fontVariantNumeric: "tabular-nums", color: p.onSurfaceVariant }}>{e.ms ? `${e.ms}ms` : "—"}</span>
          </button>
        ))}
      </div>
      <Hint p={p}>{t("entranceHint", lang)}</Hint>

      <button
        onClick={() => setTick((n) => n + 1)}
        className="m3-press"
        title={t("tryIt", lang)}
        aria-label={t("tryIt", lang)}
        style={{
          position: "relative",
          height: 96,
          borderRadius: 16,
          border: "none",
          background: p.surfaceContainerLow,
          cursor: "pointer",
          overflow: "hidden",
          padding: 0,
          display: "grid",
          placeItems: "center",
        }}
      >
        <motion.span
          key={`${theme.motion}:${theme.entrance}:${tick}`}
          initial={false}
          style={{
            /* the same BoardUI entrance the canvas parts arrive with, replayed on demand */
            ...entranceCssVars(theme.entrance),
            animation: "var(--m3e-in-name, m3e-in) var(--m3e-in-dur, 150ms) var(--m3e-in-ease, cubic-bezier(0.22, 1, 0.36, 1))",
            width: 48,
            height: 48,
            borderRadius: expressive ? 14 : 24,
            background: p.primary,
            display: "grid",
            placeItems: "center",
            color: p.onPrimary,
          }}
        >
          <Icon name="arrow_forward" size={24} />
        </motion.span>
      </button>
    </div>
  );
}
