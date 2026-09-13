import { useState } from "react";
import { HelpCircle } from "lucide-react";

interface QuestionIconProps {
  helpText: string;
  size?: number;
}

export default function QuestionIcon({ helpText, size = 14 }: QuestionIconProps) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="question-icon-wrapper"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow((v) => !v)}
    >
      <HelpCircle size={size} className="question-icon" aria-label="Help" />

      {show && (
        <span className="question-tooltip" role="tooltip">
          {helpText}
        </span>
      )}
    </span>
  );
}

