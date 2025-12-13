import React, { useState, useEffect } from "react";

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
	const [totalSales, setTotalSales] = useState<number | "">(existingAbrechnung?.totalSales || "");
	const [cashSales, setCashSales] = useState<number | "">(existingAbrechnung?.salesInCash || "");
	const [anfangsbestand, setAnfangsbestand] = useState<number | "">("");
	const [endbestand, setEndbestand] = useState<number | "">(existingAbrechnung?.privatTips ? "" : "");
	const [showPrivate, setShowPrivate] = useState(!!existingAbrechnung?.privatTips);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<boolean>(false);
	const [restaurantFloat, setRestaurantFloat] = useState<number | "">(0); // Default to 0
	const [fetchedTeamTip, setFetchedTeamTip] = useState<number>(2); // default fallback
	const [showFloat, setShowFloat] = useState(false); // New state for showing restaurant float input
	const [initialFloat, setInitialFloat] = useState<number>(0); // New state for initial float
	const [station, setStation] = useState<string>(existingAbrechnung?.station || ""); // Station number/name


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
			if (totalSales === "") {
				setError("Gesamtumsatz ist erforderlich");
				setLoading(false);
				return;
			}
			if (cashSales === "") {
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
						<input
							type="number"
							step="any"
							value={totalSales}
							onChange={(e) =>
								setTotalSales(
									e.target.value === "" ? "" : Number(e.target.value)
								)
							}
							required
							className="px-3 py-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-cyan-300 dark:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
							style={{ MozAppearance: "textfield" }}
							inputMode="decimal"
							pattern="[0-9]*"
							onWheel={(e) => e.currentTarget.blur()} // disables value change on scroll
						/>
					</div>
					<div className="flex flex-col gap-2 w-full max-w-xs mt-4">
						<label className="text-cyan-200 font-medium mb-1">Barumsatz:</label>
						<input
							type="number"
							step="any"
							value={cashSales}
							onChange={(e) =>
								setCashSales(
									e.target.value === "" ? "" : Number(e.target.value)
								)
							}
							required
							className="px-3 py-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-cyan-300 dark:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
							style={{ MozAppearance: "textfield" }}
							inputMode="decimal"
							pattern="[0-9]*"
							onWheel={(e) => e.currentTarget.blur()} // disables value change on scroll
						/>
					</div>
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
									type="number"
									step="any"
									value={anfangsbestand}
									onChange={(e) =>
										setAnfangsbestand(
											e.target.value === ""
												? ""
												: Number(e.target.value)
										)
									}
									className="px-3 py-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-cyan-300 dark:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
								/>
								<label className="text-cyan-200 font-medium mb-1">
									Endbestand:
								</label>
								<input
									type="number"
									step="any"
									value={endbestand}
									onChange={(e) =>
										setEndbestand(
											e.target.value === ""
												? ""
												: Number(e.target.value)
										)
									}
									className="px-3 py-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-cyan-300 dark:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
									type="number"
									step="any"
									value={restaurantFloat}
									onChange={(e) =>
										setRestaurantFloat(
											e.target.value === ""
												? initialFloat
												: Number(e.target.value)
										)
									}
									className="px-3 py-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-cyan-300 dark:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
									style={{ MozAppearance: "textfield" }}
									inputMode="decimal"
									pattern="[0-9]*"
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
		</div>
	);
};

export default AbrechnungForm;