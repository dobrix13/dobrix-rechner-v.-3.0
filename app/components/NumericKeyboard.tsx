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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(108, 43, 189, 0.15) 0%, rgba(0, 140, 140, 0.1) 50%, rgba(179, 106, 0, 0.15) 100%)'
      }}
    >
      <div 
        className="relative rounded-2xl shadow-2xl p-6 w-full max-w-sm backdrop-blur-xl border border-white/10"
        style={{
          background: 'linear-gradient(135deg, rgba(28, 28, 28, 0.7) 0%, rgba(40, 40, 60, 0.6) 100%)',
          boxShadow: '0 8px 32px 0 rgba(108, 43, 189, 0.3), 0 0 60px rgba(0, 140, 140, 0.2), inset 0 0 80px rgba(179, 106, 0, 0.05)'
        }}
      >
        <div 
          className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 20% 20%, rgba(108, 43, 189, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0, 140, 140, 0.4) 0%, transparent 50%)'
          }}
        />
        
        {/* Display */}
        <div className="relative mb-4">
          <div className="text-sm text-cyan-300 mb-2 font-medium">{label}</div>
          <div 
            className="text-2xl text-white font-mono text-right px-4 py-2 rounded-lg border border-white/10 backdrop-blur-sm min-h-[50px] flex items-center justify-end"
            style={{
              background: 'rgba(20, 20, 40, 0.6)',
              boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(108, 43, 189, 0.1)'
            }}
          >
            {displayValue || "0"}
          </div>
        </div>

        {/* Keyboard */}
        <div className="relative">
          <div className="grid grid-cols-3 gap-2 mb-2">
            {keys.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {row.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className="h-12 text-lg font-semibold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 140, 140, 0.5) 0%, rgba(108, 43, 189, 0.5) 100%)',
                      boxShadow: '0 2px 10px rgba(108, 43, 189, 0.3), 0 0 20px rgba(0, 140, 140, 0.2)',
                      color: 'white'
                    }}
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
              className="h-12 text-lg font-semibold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20"
              style={{
                background: 'linear-gradient(135deg, rgba(179, 106, 0, 0.6) 0%, rgba(255, 153, 0, 0.5) 100%)',
                boxShadow: '0 2px 10px rgba(179, 106, 0, 0.3), 0 0 20px rgba(255, 153, 0, 0.2)',
                color: 'white'
              }}
            >
              +/−
            </button>
            <button
              onClick={() => handleKeyPress("clear")}
              className="h-12 text-base font-semibold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20"
              style={{
                background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.6) 0%, rgba(185, 28, 28, 0.5) 100%)',
                boxShadow: '0 2px 10px rgba(220, 38, 38, 0.3), 0 0 20px rgba(185, 28, 28, 0.2)',
                color: 'white'
              }}
            >
              C
            </button>
            <button
              onClick={handleDone}
              className="h-12 text-base font-semibold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.6) 0%, rgba(22, 163, 74, 0.5) 100%)',
                boxShadow: '0 2px 10px rgba(34, 197, 94, 0.3), 0 0 20px rgba(22, 163, 74, 0.2)',
                color: 'white'
              }}
            >
              Ok
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumericKeyboard;
