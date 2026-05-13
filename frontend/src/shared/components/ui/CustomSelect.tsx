import React from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { RiArrowDownSLine, RiCheckLine } from "react-icons/ri";

/** Radix forbids empty-string values on SelectItem.
 *  We transparently map "" → "__NONE__" inside the component. */
const NONE = "__NONE__";
const toRadix  = (v: string) => (v === "" ? NONE : v);
const fromRadix = (v: string) => (v === NONE ? "" : v);

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectGroup {
  label?: string;
  options: SelectOption[];
}

export interface CustomSelectProps {
  /** Current selected value */
  value: string;
  /** Called when selection changes */
  onChange: (value: string) => void;
  /** Flat list of options OR grouped list */
  options?: SelectOption[];
  groups?: SelectGroup[];
  /** Placeholder shown when nothing is selected */
  placeholder?: string;
  /** Disable the entire dropdown */
  disabled?: boolean;
  /** Full-width on its parent container */
  fullWidth?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Optional leading icon shown in the trigger */
  icon?: React.ReactNode;
  /** Used for aria-label */
  label?: string;
  /** Extra CSS class for the trigger */
  className?: string;
  /** Show an error state */
  error?: boolean;
}

const sizeMap: Record<NonNullable<CustomSelectProps["size"]>, React.CSSProperties> = {
  sm: { height: 36, fontSize: "0.8125rem", padding: "0 12px" },
  md: { height: 44, fontSize: "0.9375rem", padding: "0 14px" },
  lg: { height: 52, fontSize: "0.9375rem", padding: "0 18px" },
};

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  groups,
  placeholder = "Select…",
  disabled = false,
  fullWidth = false,
  size = "md",
  icon,
  label,
  className = "",
  error = false,
}) => {
  /** Flatten to find the current label */
  const allOptions: SelectOption[] = groups
    ? groups.flatMap((g) => g.options)
    : (options ?? []);

  const selected = allOptions.find((o) => o.value === value);
  const sz = sizeMap[size];

  const triggerStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    width: fullWidth ? "100%" : undefined,
    height: sz.height,
    padding: icon ? `0 14px 0 ${size === "sm" ? 10 : 14}px` : sz.padding as string,
    fontSize: sz.fontSize,
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    color: selected ? "#1e293b" : "#94a3b8",
    background: disabled ? "#f8fafc" : "#ffffff",
    border: `1.5px solid ${error ? "#ef4444" : "#e2e8f0"}`,
    borderRadius: 10,
    cursor: disabled ? "not-allowed" : "pointer",
    outline: "none",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    userSelect: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    position: "relative",
  };

  return (
    <>
      <style>{`
        .qw-select-trigger:hover:not([data-disabled]) {
          border-color: #94a3b8 !important;
        }
        .qw-select-trigger:focus-within,
        .qw-select-trigger[data-state="open"] {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important;
        }
        .qw-select-trigger[data-disabled] {
          opacity: 0.55;
          cursor: not-allowed !important;
        }
        .qw-select-chevron {
          margin-left: auto;
          color: #94a3b8;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }
        [data-state="open"] .qw-select-chevron {
          transform: rotate(-180deg);
        }

        .qw-select-content {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06);
          overflow: hidden;
          animation: qwSelectIn 0.15s ease;
          z-index: 9999;
          min-width: var(--radix-select-trigger-width);
          max-height: 320px;
        }
        @keyframes qwSelectIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }

        .qw-select-viewport {
          padding: 6px;
        }

        .qw-select-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #1e293b;
          cursor: pointer;
          outline: none;
          transition: background 0.1s ease, color 0.1s ease;
          user-select: none;
          position: relative;
        }
        .qw-select-item[data-highlighted] {
          background: #eff6ff;
          color: #1d4ed8;
        }
        .qw-select-item[data-state="checked"] {
          font-weight: 600;
          color: #2563eb;
        }
        .qw-select-item[data-disabled] {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .qw-select-group-label {
          padding: 8px 12px 4px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }
        .qw-select-separator {
          height: 1px;
          background: #f1f5f9;
          margin: 4px 0;
        }
        .qw-select-check {
          margin-left: auto;
          color: #2563eb;
          flex-shrink: 0;
        }
        .qw-select-scroll-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 28px;
          background: #f8fafc;
          cursor: default;
          color: #64748b;
        }
      `}</style>

      <RadixSelect.Root
        value={value !== undefined && value !== "" ? toRadix(value) : undefined}
        onValueChange={(v) => onChange(fromRadix(v))}
        disabled={disabled}
      >
        <RadixSelect.Trigger
          className={`qw-select-trigger ${className}`}
          style={triggerStyle}
          aria-label={label}
        >
          {icon && <span style={{ color: "#94a3b8", display: "flex", flexShrink: 0 }}>{icon}</span>}

          <RadixSelect.Value placeholder={placeholder}>
            {selected ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                {selected.icon && <span style={{ flexShrink: 0 }}>{selected.icon}</span>}
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selected.label}
                </span>
              </span>
            ) : undefined}
          </RadixSelect.Value>

          <RadixSelect.Icon className="qw-select-chevron">
            <RiArrowDownSLine size={18} />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            className="qw-select-content"
            position="popper"
            sideOffset={6}
            align="start"
          >
            <RadixSelect.ScrollUpButton className="qw-select-scroll-btn">▲</RadixSelect.ScrollUpButton>

            <RadixSelect.Viewport className="qw-select-viewport">
              {groups ? (
                groups.map((group, gi) => (
                  <React.Fragment key={gi}>
                    {gi > 0 && <RadixSelect.Separator className="qw-select-separator" />}
                    <RadixSelect.Group>
                      {group.label && (
                        <RadixSelect.Label className="qw-select-group-label">
                          {group.label}
                        </RadixSelect.Label>
                      )}
                      {group.options.map((opt) => (
                        <SelectItem key={opt.value} option={opt} />
                      ))}
                    </RadixSelect.Group>
                  </React.Fragment>
                ))
              ) : (
                allOptions.map((opt) => (
                  <SelectItem key={opt.value} option={opt} />
                ))
              )}
            </RadixSelect.Viewport>

            <RadixSelect.ScrollDownButton className="qw-select-scroll-btn">▼</RadixSelect.ScrollDownButton>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </>
  );
};

/* ── Internal SelectItem ── */
const SelectItem: React.FC<{ option: SelectOption }> = ({ option }) => (
  <RadixSelect.Item
    value={toRadix(option.value)}
    disabled={option.disabled}
    className="qw-select-item"
  >
    {option.icon && <span style={{ flexShrink: 0 }}>{option.icon}</span>}
    <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
    <RadixSelect.ItemIndicator className="qw-select-check">
      <RiCheckLine size={15} />
    </RadixSelect.ItemIndicator>
  </RadixSelect.Item>
);

export default CustomSelect;
