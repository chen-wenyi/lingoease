"use client";

import { useRef, useState } from "react";

export default function Dropdown() {
  const [val, setVal] = useState("Select key");
  const popoverRef = useRef<HTMLUListElement>(null);
  const keys = ["Key 1", "Key 2q12312123123121231"];

  // Function to close the dropdown
  const closeDropdown = () => {
    if (popoverRef.current && "hidePopover" in popoverRef.current) {
      popoverRef.current.hidePopover();
    }
  };

  const handleSelect = (key: string) => {
    setVal(key);
    closeDropdown(); // Close dropdown after selection
  };

  return (
    <>
      <button
        className="btn btn-neutral block h-20 w-25 overflow-hidden text-ellipsis whitespace-nowrap"
        popoverTarget="popover-1"
        title={val}
        style={{ anchorName: "--anchor-1" } as React.CSSProperties}
      >
        {val}
      </button>

      <ul
        ref={popoverRef}
        className="dropdown menu rounded-box bg-base-100 shadow-sm"
        popover="auto"
        id="popover-1"
        style={{ positionAnchor: "--anchor-1" } as React.CSSProperties}
      >
        <li>
          <a onClick={console.log}>Add New Key</a>
        </li>
        {keys.map((v) => (
          <li key={v}>
            <a onClick={() => handleSelect(v)}>{v}</a>
          </li>
        ))}
      </ul>
    </>
  );
}
