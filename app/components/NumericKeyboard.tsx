import React, { useState, useEffect } from "react";

interface NumericKeyboardProps {
  value: number | "" | "-";
  onChange: (value: number | "" | "-") => void;
  onClose: () => void;
  label: string;
}

const NumericKeyboard: React.FC<NumericKeyboardProps> = ({ value, onChange, onClose, label }) => {
  const [displayValue, setDisplayValue] = useState<string>(value === "" ? "" : String(value));

  useEffect(() => {
    setDisplayValue(value === "" ? "" : String(value));
  }, [value]);

  const handleKeyPress = (key: string) => {
    let newValue = displayValue;

    if (key === "clear") {
      newValue = "";
    } else if (key === "backspace") {
      newValue = displayValue.slice(0, -1);
    } else if (key === "-") {
      if (displayValue === "" || displayValue === "0") {
        newValue = "-";
      } else if (displayValue.startsWith("-")) {
        newValue = displayValue.substring(1);
      } else {
        newValue = "-" + displayValue;
      }
    } else if (key === ".") {
      if (!displayValue.includes(".")) {
        newValue = displayValue === "" ? "0." : displayValue + ".";
      }
    } else {
      // Number key
      if (displayValue === "0") {
        newValue = key;
      } else if (displayValue === "-0") {
        newValue = "-" + key;
      } else {
        newValue = displayValue + key;
      }
    }

    setDisplayValue(newValue);
    
    // Update parent value
    if (newValue === "" || newValue === "-") {
      onChange(newValue);
    } else {
      const numValue = Number(newValue);
      if (!isNaN(numValue)) {
        onChange(numValue);
      }
    }
  };

  const handleDone = () => {
    if (displayValue === "" || displayValue === "-") {
      onChange("");
    } else {
      const numValue = Number(displayValue);
      if (!isNaN(numValue)) {
        onChange(numValue);
      }
    }
    onClose();
  };

  const keys = [
    ["7", "8", "9"],
    ["4", "5", "6"],
    ["1", "2", "3"],
    [".", "0", "backspace"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gradient-to-b from-zinc-900 to-black border-t-2 border-cyan-500/30 rounded-t-2xl shadow-2xl">
        {/* Display */}
        <div className="p-4 border-b border-cyan-500/20">
          <div className="text-sm text-cyan-300 mb-2">{label}</div>
          <div className="text-3xl text-white font-mono text-right bg-zinc-800/50 px-4 py-3 rounded-lg border border-cyan-500/20 min-h-[60px] flex items-center justify-end">
            {displayValue || "0"}
          </div>
        </div>

        {/* Keyboard */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 mb-2">
            {keys.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {row.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className="aspect-square text-2xl font-semibold rounded-xl transition-all active:scale-95 bg-zinc-800 text-white hover:bg-zinc-700 border border-cyan-500/20"
                  >
                    {key === "backspace" ? "⌫" : key}
                  </button>
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* Bottom row with special keys */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleKeyPress("-")}
              className="py-4 text-2xl font-semibold rounded-xl transition-all active:scale-95 bg-amber-600 text-white hover:bg-amber-500 border border-amber-500/30"
            >
              +/−
            </button>
            <button
              onClick={() => handleKeyPress("clear")}
              className="py-4 text-xl font-semibold rounded-xl transition-all active:scale-95 bg-red-600 text-white hover:bg-red-500 border border-red-500/30"
            >
              Clear
            </button>
            <button
              onClick={handleDone}
              className="py-4 text-xl font-semibold rounded-xl transition-all active:scale-95 bg-green-600 text-white hover:bg-green-500 border border-green-500/30"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumericKeyboard;
