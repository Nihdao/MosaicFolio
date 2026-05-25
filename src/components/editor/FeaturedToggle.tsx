"use client";

interface FeaturedToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function FeaturedToggle({
  checked,
  onChange,
}: FeaturedToggleProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          position: "relative",
          width: 40,
          height: 24,
          borderRadius: 9999,
          background: checked ? "var(--accent)" : "var(--border)",
          border: "none",
          cursor: "pointer",
          transition: "background 200ms ease",
          flexShrink: 0,
          padding: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            width: 16,
            height: 16,
            borderRadius: 9999,
            background: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
            transition: "transform 200ms ease",
            transform: checked ? "translateX(16px)" : "translateX(0)",
            display: "block",
          }}
        />
      </button>
      <span
        style={{
          fontSize: 13,
          color: checked ? "var(--foreground)" : "var(--muted-foreground)",
        }}
      >
        {checked ? "Active" : "Inactive"}
      </span>
    </div>
  );
}
