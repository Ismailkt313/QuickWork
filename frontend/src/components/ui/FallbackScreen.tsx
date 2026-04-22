import React from "react";

const FallbackScreen: React.FC = () => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          border: "5px solid #e2e8f0",
          borderTop: "5px solid #3b82f6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <p
        style={{
          marginTop: 16,
          fontSize: 14,
          color: "#64748b",
          fontWeight: 500,
        }}
      >
        Loading...
      </p>

      <style>
        {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        `}
      </style>
    </div>
  );
};

export default FallbackScreen;
