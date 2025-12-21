import React, { useState, useEffect, useRef } from "react";
import NumericKeyboard from "./NumericKeyboard";
import { createWorker } from 'tesseract.js';

interface ExistingAbrechnungData {
	_id?: string;
	totalSales: number;
	salesInCash: number;
	teamTipsPaid: number;
	privatTips: number;
	finalAmountInCash: number;
	station?: string;
}

interface AbrechnungFormProps {
	user: { name: string; organisation?: string; restaurant?: string; userId?: string; _id?: string };
	restaurantId: string;
	orgId: string;
	teamTips?: number; // Pass team tips from parent if available
	onClose?: () => void; // Callback to close form
	refresh?: number; // New prop to trigger refresh
	existingAbrechnung?: ExistingAbrechnungData; // Pre-fill data if viewing existing
}

const AbrechnungForm: React.FC<AbrechnungFormProps> = ({
	user,
	restaurantId,
	orgId,
	teamTips,
	onClose,
	refresh,
	existingAbrechnung,
}) => {
	const [totalSales, setTotalSales] = useState<number | "" | "-">(existingAbrechnung?.totalSales || "");
	const [cashSales, setCashSales] = useState<number | "" | "-">(existingAbrechnung?.salesInCash || "");
	const [anfangsbestand, setAnfangsbestand] = useState<number | "" | "-">("");
	const [endbestand, setEndbestand] = useState<number | "" | "-">(existingAbrechnung?.privatTips ? "" : "");
	const [showPrivate, setShowPrivate] = useState(!!existingAbrechnung?.privatTips);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<boolean>(false);
	const [restaurantFloat, setRestaurantFloat] = useState<number | "" | "-">(0); // Default to 0
	const [fetchedTeamTip, setFetchedTeamTip] = useState<number>(2); // default fallback
	const [showFloat, setShowFloat] = useState(false); // New state for showing restaurant float input
	const [initialFloat, setInitialFloat] = useState<number>(0); // New state for initial float
	const [station, setStation] = useState<string>(existingAbrechnung?.station || ""); // Station number/name
	const [activeKeyboard, setActiveKeyboard] = useState<"totalSales" | "cashSales" | "anfangsbestand" | "endbestand" | "restaurantFloat" | null>(null);
	const [ocrProcessing, setOcrProcessing] = useState(false);
	const totalSalesFileRef = useRef<HTMLInputElement>(null);
	const cashSalesFileRef = useRef<HTMLInputElement>(null);


	useEffect(() => {
		async function fetchTeamTip() {
			if (restaurantId && orgId) {
				try {
					const res = await fetch(
						`/api/organizations/${orgId}/restaurants/${restaurantId}`
					);
					if (res.ok) {
						const data = await res.json();
						setFetchedTeamTip(data.teamTipPercentage ?? 2);
					}
				} catch (e: any) {
					setFetchedTeamTip(2); // fallback
				}
			}
		}
		fetchTeamTip();
	}, [restaurantId, orgId, refresh]);

	useEffect(() => {
		async function fetchFloat() {
			if (restaurantId && orgId) {
				try {
					const res = await fetch(
						`/api/organizations/${orgId}/restaurants/${restaurantId}`
					);
					if (res.ok) {
						const data = await res.json();
						setInitialFloat(data.floatAmount ?? 0);
						setRestaurantFloat(data.floatAmount ?? 0);
					}
				} catch (e: any) {
					setInitialFloat(0);
					setRestaurantFloat(0);
				}
			}
		}
		fetchFloat();
	}, [restaurantId, orgId]);

	// Calculate team tips as percent of total sales
	const teamTipPercent = fetchedTeamTip; // always use fetched value
	const calculatedTeamTips =
		totalSales !== "" && teamTipPercent > 0
			? Number(totalSales) * (teamTipPercent / 100)
			: 0;

	// Calculate Zum auszahlen: waiter cash out = salesInCash + calculatedTeamTips + restaurantFloat
	const zumAuszahlen =
		cashSales !== "" && restaurantFloat !== "" && totalSales !== ""
			? Number(cashSales) + calculatedTeamTips + Number(restaurantFloat)
			: "";

	const handleOCR = async (file: File, fieldType: 'totalSales' | 'cashSales') => {
		setOcrProcessing(true);
		setError(null);
		try {
			const worker = await createWorker('deu');
			const { data: { text } } = await worker.recognize(file);
			await worker.terminate();

			// Process the OCR text
			const lines = text.split('\n');
			let extractedValue: number | null = null;

			if (fieldType === 'totalSales') {
				// Look for "Einnahme Gesamt" or similar patterns
				for (let i = 0; i < lines.length; i++) {
					const line = lines[i].toLowerCase();
					if (line.includes('einnahme') && line.includes('gesamt')) {
						// Extract number from this line or next line
						const numberMatch = lines[i].match(/[\d.,]+/);
						if (numberMatch) {
							extractedValue = parseFloat(numberMatch[0].replace(',', '.').replace(/\./g, ''));
							if (numberMatch[0].includes(',')) {
								const parts = numberMatch[0].split(',');
								extractedValue = parseFloat(parts[0].replace(/\./g, '') + '.' + parts[1]);
							}
							break;
						} else if (i + 1 < lines.length) {
							const nextLineMatch = lines[i + 1].match(/[\d.,]+/);
							if (nextLineMatch) {
								extractedValue = parseFloat(nextLineMatch[0].replace(',', '.').replace(/\./g, ''));
								if (nextLineMatch[0].includes(',')) {
									const parts = nextLineMatch[0].split(',');
									extractedValue = parseFloat(parts[0].replace(/\./g, '') + '.' + parts[1]);
								}
								break;
							}
						}
					}
				}
			} else if (fieldType === 'cashSales') {
				// Look for "Gesamt (Bar)" or similar patterns
				for (let i = 0; i < lines.length; i++) {
					const line = lines[i].toLowerCase();
					if ((line.includes('gesamt') && line.includes('bar')) || line.includes('gesamt(bar)')) {
						// Extract number from this line or next line
						const numberMatch = lines[i].match(/[\d.,]+/);
						if (numberMatch) {
							extractedValue = parseFloat(numberMatch[0].replace(',', '.').replace(/\./g, ''));
							if (numberMatch[0].includes(',')) {
								const parts = numberMatch[0].split(',');
								extractedValue = parseFloat(parts[0].replace(/\./g, '') + '.' + parts[1]);
							}
							break;
						} else if (i + 1 < lines.length) {
							const nextLineMatch = lines[i + 1].match(/[\d.,]+/);
							if (nextLineMatch) {
								extractedValue = parseFloat(nextLineMatch[0].replace(',', '.').replace(/\./g, ''));
								if (nextLineMatch[0].includes(',')) {
									const parts = nextLineMatch[0].split(',');
									extractedValue = parseFloat(parts[0].replace(/\./g, '') + '.' + parts[1]);
								}
								break;
							}
						}
					}
				}
			}

			if (extractedValue !== null && !isNaN(extractedValue)) {
				if (fieldType === 'totalSales') {
					setTotalSales(extractedValue);
				} else {
					setCashSales(extractedValue);
				}
			} else {
				setError('Konnte keinen Wert im Bild finden. Bitte versuchen Sie es erneut.');
			}
		} catch (err) {
			console.error('OCR Error:', err);
			setError('Fehler beim Scannen des Bildes. Bitte versuchen Sie es erneut.');
		}
		setOcrProcessing(false);
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, fieldType: 'totalSales' | 'cashSales') => {
		const file = event.target.files?.[0];
		if (file) {
			handleOCR(file, fieldType);
		}
	};

	// Calculate privatTips - default anfangsbestand to 0 if only endbestand is entered
	const privatTips =
		endbestand !== ""
			? Number(endbestand) - (anfangsbestand !== "" ? Number(anfangsbestand) : 0)
			: "";

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			if (!user.userId) {
				setError("Benutzer-ID fehlt. Bitte neu einloggen oder wenden Sie sich an den Administrator.");
				setLoading(false);
				return;
			}
			
			// Validate required fields
			if (totalSales === "" || totalSales === "-") {
				setError("Gesamtumsatz ist erforderlich");
				setLoading(false);
				return;
			}
			if (cashSales === "" || cashSales === "-") {
				setError("Barumsatz ist erforderlich");
				setLoading(false);
				return;
			}
			
			const isUpdating = existingAbrechnung?._id;
			const url = isUpdating
				? `/api/abrechnungen/${existingAbrechnung._id}?userId=${user.userId}&restaurantId=${restaurantId}`
				: `/api/abrechnungen?restaurantId=${restaurantId}&userId=${user.userId}&organizationId=${orgId}`;
			
			const res = await fetch(
				url,
				{
					method: isUpdating ? "PATCH" : "POST",
					headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					totalSales: Number(totalSales),
					salesInCash: Number(cashSales),
					finalAmountInCash: typeof zumAuszahlen === "number" ? zumAuszahlen : 0,
					privatTips: typeof privatTips === "number" ? privatTips : 0,
					teamTips: calculatedTeamTips || 0,
					restaurantFloat: restaurantFloat === "" ? 0 : Number(restaurantFloat),
					teamTipsPaid: calculatedTeamTips || 0,
					station: station.trim() || undefined,
				}),
				}
			);

			if (!res.ok) {
				const errorData = await res.json();
				console.error("Server error response:", errorData);
				console.error("Server error details:", JSON.stringify(errorData.details, null, 2));
				const errorMsg = errorData.details?.message || errorData.error || "Failed to save data.";
				throw new Error(errorMsg);
			}

			setSuccess(true);
			setTotalSales("");
			setCashSales("");
			setAnfangsbestand("");
			setEndbestand("");
			// Close form after successful submission
			if (onClose) {
				setTimeout(() => onClose(), 1500); // Close after showing success message
			}
		} catch (err: any) {
			console.error("Submit error:", err);
			setError(err.message || "An error occurred.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative w-full flex items-center justify-center py-0 z-10">
			{/* Transparent background - no gradient */}
			<div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
			</div>
			<div className="flex flex-col w-full max-w-[600px] px-0">
				<div
					className="px-4 flex items-center w-full justify-between"
					style={{
						height: "auto",
						borderTopLeftRadius: "10px",
						borderTopRightRadius: "10px",
						border: "2px solid rgba(0,255,247,0.18)",
						background: "rgba(30, 40, 60, 0.45)",
						boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)",
						backdropFilter: "blur(12px)",
						WebkitBackdropFilter: "blur(12px)",
						borderBottom: "none",
						fontSize: "0.85rem",
					}}
				>
					<div className="flex flex-col w-full">
						<h3 className="text-lg font-semibold text-center mb-2 text-cyan-100">
									Abrechnung eingeben von {user && user.name ? user.name : (user && user.userId ? user.userId : "")}
							<span className="block text-cyan-300 text-base mt-1">
								Team tip abgabe % ={" "}
								{teamTipPercent.toLocaleString("de-DE", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</span>
						</h3>
					</div>
				</div>
				<form
					onSubmit={handleSubmit}
					className="flex flex-col items-center px-8 py-8"
					style={{
						borderBottomLeftRadius: "10px",
						borderBottomRightRadius: "10px",
						border: "2px solid rgba(0,255,247,0.18)",
						borderTop: "none",
						background: "rgba(30, 40, 60, 0.35)",
						boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)",
						backdropFilter: "blur(12px)",
						WebkitBackdropFilter: "blur(12px)",
					}}
				>
					{/* Main inputs: gesamt umsatz and bar umsatz, disable scroll/spinner */}
					<div className="flex flex-col gap-2 w-full max-w-xs">
						<label className="text-cyan-200 font-medium mb-1">
							Gesamtumsatz:
						</label>
						<div className="relative">
							<input
							type="text"
							value={totalSales === "" ? "" : String(totalSales)}
							onFocus={() => setActiveKeyboard("totalSales")}
							readOnly
							required
							className="px-3 py-2 pr-10 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-cyan-300 dark:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer w-full"
							/>
							<input
								type="file"
								accept="image/*"
								capture="environment"
								ref={totalSalesFileRef}
								onChange={(e) => handleFileSelect(e, 'totalSales')}
								className="hidden"
							/>
							<button
								type="button"
								onClick={() => totalSalesFileRef.current?.click()}
								disabled={ocrProcessing}
								className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
								title="Beleg scannen"
							>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
								</svg>
							</button>
						</div>
					</div>
					<div className="flex flex-col gap-2 w-full max-w-xs mt-4">
						<label className="text-cyan-200 font-medium mb-1">Barumsatz:</label>
						<div className="relative">
							<input
							type="text"
							value={cashSales === "" ? "" : String(cashSales)}
							onFocus={() => setActiveKeyboard("cashSales")}
							readOnly
							required
							className="px-3 py-2 pr-10 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-cyan-300 dark:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer w-full"
							/>
							<input
								type="file"
								accept="image/*"
								capture="environment"
								ref={cashSalesFileRef}
								onChange={(e) => handleFileSelect(e, 'cashSales')}
								className="hidden"
							/>
							<button
								type="button"
								onClick={() => cashSalesFileRef.current?.click()}
								disabled={ocrProcessing}
								className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
								title="Beleg scannen"
							>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
								</svg>
							</button>
						</div>
					</div>
					{/* OCR Processing indicator */}
					{ocrProcessing && (
						<div className="flex items-center justify-center gap-2 w-full max-w-xs mt-4 text-cyan-300">
							<svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							<span>Scanne Beleg...</span>
						</div>
					)}
					{/* Team tips percent and calculated value */}
					<div className="flex flex-col gap-2 w-full max-w-xs mt-4">
						<div className="mt-2 text-cyan-300 font-medium">
							Team-Tipps Betrag:{" "}
							{calculatedTeamTips.toLocaleString("de-DE", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}{" "}
							€
						</div>
					</div>
					{/* Zum auszahlen value */}
					<div className="flex flex-col gap-2 w-full max-w-xs mt-4">
						<label className="text-cyan-300 font-medium mb-1">Zum auszahlen:</label>
						<div className="px-3 py-2 rounded bg-zinc-900 text-cyan-200 border border-cyan-700 font-bold">
							{zumAuszahlen !== ""
								? `${Number(zumAuszahlen).toLocaleString("de-DE", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
								  })} €`
								: "-"}
						</div>
					</div>
					{/* Collapsible Private Statistik Section */}
					<div className="w-full max-w-xs mt-6">
						<button
							type="button"
							className="w-full py-2.5 px-4 rounded-lg border-2 border-cyan-400/30 bg-cyan-900/20 text-cyan-100 font-medium hover:bg-cyan-800/30 hover:border-cyan-400/50 transition-all duration-200 backdrop-blur-sm flex items-center justify-between"
							onClick={() => setShowPrivate((v) => !v)}
						>
							<span>Private Statistik</span>
							<span className="text-cyan-300 text-lg">{showPrivate ? "▲" : "▼"}</span>
						</button>
						{showPrivate && (
							<div className="mt-4 flex flex-col gap-2">
								<label className="text-cyan-200 font-medium mb-1">
									Anfangsbestand:
								</label>
							<input
								type="text"
								value={anfangsbestand === "" ? "" : String(anfangsbestand)}
								onFocus={() => setActiveKeyboard("anfangsbestand")}
								readOnly
								className="px-3 py-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-cyan-300 dark:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
							/>
								<label className="text-cyan-200 font-medium mb-1">
									Endbestand:
								</label>
							<input
								type="text"
								value={endbestand === "" ? "" : String(endbestand)}
								onFocus={() => setActiveKeyboard("endbestand")}
								readOnly
								className="px-3 py-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-cyan-300 dark:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
							/>
								<div className="mt-2 text-cyan-300 font-medium">
									Differenz:{" "}
									{privatTips !== ""
										? `${Number(privatTips).toLocaleString("de-DE", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
										  })} €`
										: "-"}
								</div>
								<label className="text-cyan-200 font-medium mb-1 mt-4">
									Station (optional):
								</label>
								<input
									type="text"
									value={station}
									onChange={(e) => setStation(e.target.value)}
									placeholder="z.B. Station 1, Bar, Terrasse"
									className="px-3 py-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-cyan-300 dark:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
								/>
							</div>
						)}
					</div>
					{/* Restaurant float, hidden unless expanded */}
					<div className="w-full max-w-xs mt-4">
						<button
							type="button"
							className="w-full py-2.5 px-4 rounded-lg border-2 border-cyan-400/30 bg-cyan-900/20 text-cyan-100 font-medium hover:bg-cyan-800/30 hover:border-cyan-400/50 transition-all duration-200 backdrop-blur-sm flex items-center justify-between"
							onClick={() => setShowFloat((v) => !v)}
						>
							<span>Restaurant Wechselgeld</span>
							<span className="text-cyan-300 text-lg">{showFloat ? "▲" : "▼"}</span>
						</button>
						{showFloat && (
							<div className="mt-4 flex flex-col gap-2">
								<label className="text-cyan-200 font-medium mb-1">
									Wechselgeld:
								</label>
								<input
									type="text"
									value={restaurantFloat === "" ? "" : String(restaurantFloat)}
									onFocus={() => setActiveKeyboard("restaurantFloat")}
									readOnly
									className="px-3 py-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-cyan-300 dark:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
								/>
							</div>
						)}
					</div>
					<div className="flex flex-row gap-4 mt-8">
						<button
							type="submit"
							disabled={loading}
							className="py-2 px-8 rounded-full bg-cyan-500 text-white font-semibold text-lg shadow-lg hover:bg-cyan-600 transition disabled:opacity-50"
						>
							{loading ? "Speichern..." : "Speichern"}
						</button>
						<button
							type="button"
							className="py-2 px-8 rounded-full bg-zinc-700 text-white font-semibold text-lg shadow-lg hover:bg-zinc-800 transition"
							onClick={onClose}
						>
							Schließen
						</button>
					</div>
					{error && (
						<div className="text-red-500 text-sm text-center mt-2">
							{error}
						</div>
					)}
					{success && (
						<div className="text-green-500 text-sm text-center mt-2">
							Erschfolgreich gespeichert!
						</div>
					)}
				</form>
			</div>

			{/* Custom Numeric Keyboards */}
			{activeKeyboard === "totalSales" && (
				<NumericKeyboard
					value={totalSales}
					onChange={setTotalSales}
					onClose={() => setActiveKeyboard(null)}
					label="Gesamtumsatz"
				/>
			)}
			{activeKeyboard === "cashSales" && (
				<NumericKeyboard
					value={cashSales}
					onChange={setCashSales}
					onClose={() => setActiveKeyboard(null)}
					label="Barumsatz"
				/>
			)}
			{activeKeyboard === "anfangsbestand" && (
				<NumericKeyboard
					value={anfangsbestand}
					onChange={setAnfangsbestand}
					onClose={() => setActiveKeyboard(null)}
					label="Anfangsbestand"
				/>
			)}
			{activeKeyboard === "endbestand" && (
				<NumericKeyboard
					value={endbestand}
					onChange={setEndbestand}
					onClose={() => setActiveKeyboard(null)}
					label="Endbestand"
				/>
			)}
			{activeKeyboard === "restaurantFloat" && (
				<NumericKeyboard
					value={restaurantFloat}
					onChange={(val) => {
						setRestaurantFloat(val === "" ? initialFloat : val);
					}}
					onClose={() => setActiveKeyboard(null)}
					label="Wechselgeld"
				/>
			)}
		</div>
	);
};

export default AbrechnungForm;