import React from "react";

export default function NavItems({ items, onItemClick }) {
  return (
    <div className="aceternity-navitems">
      {items.map((item, idx) => (
        <a
          key={item.name + idx}
          href={item.link}
          className="aceternity-navitem-link"
          onClick={onItemClick}
        >
          {item.name}
        </a>
      ))}
    </div>
  );
} 