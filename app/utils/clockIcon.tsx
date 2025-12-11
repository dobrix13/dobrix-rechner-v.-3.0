import React, { useEffect, useState } from "react";

const CLOCK_SIZE = 32; // px
const CENTER = CLOCK_SIZE / 2;
const HAND_LENGTHS = {
	hour: CLOCK_SIZE * 0.25,
	minute: CLOCK_SIZE * 0.4,
};

function getClockAngles(date: Date) {
	const hours = date.getHours() % 12;
	const minutes = date.getMinutes();
	const hourAngle = (hours + minutes / 60) * 30; // 360/12
	const minuteAngle = minutes * 6; // 360/60
	return { hourAngle, minuteAngle };
}

function getHandCoords(angle: number, length: number) {
	const rad = ((angle - 90) * Math.PI) / 180;
	return {
		x: CENTER + length * Math.cos(rad),
		y: CENTER + length * Math.sin(rad),
	};
}

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => {
	const [now, setNow] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	const { hourAngle, minuteAngle } = getClockAngles(now);

	const hourHand = getHandCoords(hourAngle, HAND_LENGTHS.hour);
	const minuteHand = getHandCoords(minuteAngle, HAND_LENGTHS.minute);

	return (
		   <svg width={CLOCK_SIZE} height={CLOCK_SIZE} viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`} className={className}>
			   {/* Only 12 dots for hours, no outer circle */}
			   {/* 12 dots for hours */}
			   {Array.from({ length: 12 }).map((_, i) => {
				   const angle = (i * 30 - 90) * Math.PI / 180;
				   const dotRadius = 1.5;
				   const dotDist = CLOCK_SIZE / 2 - 5;
				   const x = CENTER + dotDist * Math.cos(angle);
				   const y = CENTER + dotDist * Math.sin(angle);
				   return (
					   <circle key={i} cx={x} cy={y} r={dotRadius} fill="#fff" />
				   );
			   })}
			   {/* Hour hand */}
			   <line
				   x1={CENTER}
				   y1={CENTER}
				   x2={hourHand.x}
				   y2={hourHand.y}
				   stroke="#fff"
				   strokeWidth={3}
				   strokeLinecap="round"
			   />
			   {/* Minute hand */}
			   <line
				   x1={CENTER}
				   y1={CENTER}
				   x2={minuteHand.x}
				   y2={minuteHand.y}
				   stroke="#fff"
				   strokeWidth={2}
				   strokeLinecap="round"
			   />
			   {/* Center dot */}
			   <circle cx={CENTER} cy={CENTER} r={2} fill="#fff" />
		   </svg>
	);
};

export default ClockIcon;