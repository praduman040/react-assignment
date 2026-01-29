import { NodePosition } from "../types/workflow";
import { NODE_WIDTH, NODE_HEIGHT } from "../utils/layoutCalculator";

interface ConnectionLineProps {
  from: NodePosition;
  to: NodePosition;
  isBranch?: boolean;
  branchType?: "true" | "false";
}

export function ConnectionLine({ from, to, isBranch, branchType }: ConnectionLineProps) {
  const startX = from.x + NODE_WIDTH / 2;
  const startY = from.y + NODE_HEIGHT;

  let endX: number;
  let endY: number;

  if (isBranch) {
    if (branchType === "true") {
      endX = to.x + NODE_WIDTH / 2;
      endY = to.y;
    } else {
      endX = to.x + NODE_WIDTH / 2;
      endY = to.y;
    }
  } else {
    endX = to.x + NODE_WIDTH / 2;
    endY = to.y;
  }

  const midY = (startY + endY) / 2;

  const pathD = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;

  const lineClass = isBranch
    ? `connection-line connection-line--branch connection-line--branch-${branchType}`
    : "connection-line";

  return (
    <g className={lineClass}>
      <path d={pathD} className="connection-line__path" fill="none" strokeWidth="2" />
      <circle cx={endX} cy={endY} r="4" className="connection-line__endpoint" />
    </g>
  );
}
