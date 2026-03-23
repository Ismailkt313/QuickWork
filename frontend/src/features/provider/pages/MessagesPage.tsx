import React from 'react';

const MessagesPage: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="fw-bold mb-4">Messages</h2>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-5 text-center text-secondary">
          <p className="mb-0">Your conversations with clients will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
