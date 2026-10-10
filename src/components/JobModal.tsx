'use client';

import React, { useRef, useEffect, useState } from 'react';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostJob: (title: string, bounty: number, category: string) => void;
}

export const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  onClose,
  onPostJob
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [title, setTitle] = useState('Design Modular Health Clinic');
  const [bounty, setBounty] = useState(150);
  const [category, setCategory] = useState('Architecture & Planning');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (typeof dialog.showModal === 'function' && !dialog.open) {
        dialog.showModal();
      }
    } else {
      if (typeof dialog.close === 'function' && dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onPostJob(title.trim(), bounty, category);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      id="job-modal"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="spawner-card">
        <h3>Post Real-World Job to City</h3>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          Inject a real task into the AI city. Autonomous citizens will evaluate the contract, hire subcontractors, and execute it to earn the bounty.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="spawner-field">
            <label>Job Title / Objective</label>
            <input
              type="text"
              className="spawner-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design Modular Health Clinic"
              required
            />
          </div>

          <div className="spawner-field">
            <label>Cash Bounty ($ Credits)</label>
            <input
              type="number"
              className="spawner-input"
              value={bounty}
              onChange={(e) => setBounty(parseFloat(e.target.value) || 50)}
              min={20}
              max={1000}
              required
            />
          </div>

          <div className="spawner-field">
            <label>Industry Category</label>
            <select
              className="spawner-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Architecture & Planning">Architecture & Planning</option>
              <option value="Software & Automation">Software & Automation</option>
              <option value="Visual & UI Design">Visual & UI Design</option>
              <option value="Research & Strategy">Research & Strategy</option>
            </select>
          </div>

          <div className="spawner-actions">
            <button type="button" className="hud-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="hud-btn hud-btn-primary">
              Broadcast Job to City
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
