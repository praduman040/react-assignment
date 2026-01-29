import { useEffect, useRef } from "react";
import { NodeType } from "../types/workflow";
import { Play, GitBranch, StopCircle } from "lucide-react";

interface NodeControlsProps {
  onAddNode: (type: NodeType) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export function NodeControls({ onAddNode, onClose, position }: NodeControlsProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleSelect = (type: NodeType) => {
    onAddNode(type);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="node-controls"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="node-controls__title">Add Node</div>
      <div className="node-controls__options">
        <button
          className="node-controls__option node-controls__option--action"
          onClick={() => handleSelect("action")}
        >
          <Play size={18} />
          <span>Action</span>
        </button>
        <button
          className="node-controls__option node-controls__option--branch"
          onClick={() => handleSelect("branch")}
        >
          <GitBranch size={18} />
          <span>Branch</span>
        </button>
        <button
          className="node-controls__option node-controls__option--end"
          onClick={() => handleSelect("end")}
        >
          <StopCircle size={18} />
          <span>End</span>
        </button>
      </div>
    </div>
  );
}
