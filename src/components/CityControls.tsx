'use client';

import React from 'react';

interface CityControlsProps {
  onGatherPlaza: () => void;
  onTriggerCollab: () => void;
  onTriggerMentorship: () => void;
}

export const CityControls: React.FC<CityControlsProps> = ({
  onGatherPlaza,
  onTriggerCollab,
  onTriggerMentorship
}) => {
  return (
    <div id="scenario-bar">
      <span className="scenario-title">City Dynamics:</span>
      <button className="hud-btn" onClick={onGatherPlaza}>
        Gather at Central Plaza
      </button>
      <button className="hud-btn" onClick={onTriggerCollab}>
        Simulate Collaborative Job
      </button>
      <button className="hud-btn" onClick={onTriggerMentorship}>
        Skill Mentorship Session
      </button>
    </div>
  );
};
