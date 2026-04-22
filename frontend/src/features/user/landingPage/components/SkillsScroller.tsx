import React, { useRef } from "react";
import type { Skill } from "../services/landingService";
import SkillCard from "./SkillCard";

interface SkillsScrollerProps {
  skills: Skill[];
  loading?: boolean;
  onSkillClick?: (skill: Skill) => void;
}

const SkeletonCard: React.FC = () => (
  <div
    style={{
      minWidth: 120,
      padding: "20px 12px",
      borderRadius: 14,
      background: "#f8fafc",
      border: "1.5px solid #f1f5f9",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
    }}
  >
    <div
      style={{ width: 56, height: 56, borderRadius: 12, background: "#e2e8f0" }}
    />
    <div
      style={{ width: 70, height: 12, borderRadius: 6, background: "#e2e8f0" }}
    />
  </div>
);

const SkillsScroller: React.FC<SkillsScrollerProps> = ({
  skills,
  loading,
  onSkillClick,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  const items = loading ? Array.from({ length: 8 }) : skills;

  return (
    <div className="position-relative">
      <button
        onClick={() => scroll("left")}
        style={{
          position: "absolute",
          left: -20,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
          width: 38,
          height: 38,
          borderRadius: "50%",
          border: "1.5px solid #e2e8f0",
          background: "#fff",
          cursor: "pointer",
          fontSize: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ‹
      </button>

      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          scrollbarWidth: "none",
          paddingBottom: 4,
          WebkitOverflowScrolling: "touch",
        }}
        onWheel={(e) => {
          e.preventDefault();
          scrollRef.current?.scrollBy({
            left: e.deltaY * 2,
            behavior: "smooth",
          });
        }}
      >
        <style>{`.skill-scroller::-webkit-scrollbar { display: none; }`}</style>
        {items.map((skill, i) =>
          loading ? (
            <SkeletonCard key={i} />
          ) : (
            <SkillCard
              key={(skill as Skill)._id}
              skill={skill as Skill}
              onClick={onSkillClick}
            />
          ),
        )}
      </div>

      <button
        onClick={() => scroll("right")}
        style={{
          position: "absolute",
          right: -20,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
          width: 38,
          height: 38,
          borderRadius: "50%",
          border: "1.5px solid #e2e8f0",
          background: "#fff",
          cursor: "pointer",
          fontSize: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ›
      </button>
    </div>
  );
};

export default SkillsScroller;
