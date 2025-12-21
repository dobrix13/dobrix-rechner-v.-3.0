import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AbrechnungData {
	_id: string;
	waiter: {
		name: string;
	};
	umsatz: number;
	bargeld: number;
	team_tip: number;
	date: string;
}

interface ReportData {
	firmName: string;
	restaurantName: string;
	geschaeftsDatum: string;
	abrechnungen: AbrechnungData[];
	totals: {
		umsatz: number;
		bargeld: number;
		teamTip: number;
	};
	tresorbestand?: string;
	safebagNr?: string;
	safebagBreakdown?: {
		bills500: number;
		bills200: number;
		bills100: number;
		bills50: number;
		bills20: number;
		bills10: number;
		bills5: number;
		munzen: number;
		total: number;
	};
}

export function generatePdfReport(data: ReportData) {
	const doc = new jsPDF({
		orientation: 'portrait',
		unit: 'mm',
		format: 'a4'
	});

	// A4 dimensions: 210mm x 297mm
	const pageWidth = 210;
	const margin = 15;
	const contentWidth = pageWidth - 2 * margin;

	let currentY = 20;

	// Header - Firm and Restaurant Name
	doc.setFontSize(20);
	doc.setFont('helvetica', 'bold');
	doc.text(data.firmName, pageWidth / 2, currentY, { align: 'center' });
	
	currentY += 8;
	doc.setFontSize(16);
	doc.text(data.restaurantName, pageWidth / 2, currentY, { align: 'center' });

	// Date
	currentY += 10;
	doc.setFontSize(12);
	doc.setFont('helvetica', 'normal');
	doc.text(`Kassenbericht Tagesumsatz vom ${data.geschaeftsDatum}`, pageWidth / 2, currentY, { align: 'center' });

	// Table with abrechnungen
	currentY += 10;

	const tableData = data.abrechnungen.map(abr => {
		const date = new Date(abr.date);
		const dateStr = date.toLocaleDateString('de-DE', { 
			day: '2-digit', 
			month: '2-digit', 
			year: 'numeric' 
		});
		const timeStr = date.toLocaleTimeString('de-DE', { 
			hour: '2-digit', 
			minute: '2-digit' 
		});
		
		return [
			abr.waiter.name,
			`€${abr.umsatz.toFixed(2)}`,
			`€${abr.bargeld.toFixed(2)}`,
			`€${abr.team_tip.toFixed(2)}`,
			`${dateStr} ${timeStr}`
		];
	});

	autoTable(doc, {
		startY: currentY,
		head: [['Kellner', 'Umsatz', 'Bargeld', 'Team Tip', 'Datum/Uhrzeit']],
		body: tableData,
		theme: 'grid',
		headStyles: {
			fillColor: [0, 180, 216], // Cyan color matching the app
			textColor: [255, 255, 255],
			fontStyle: 'bold',
			fontSize: 10
		},
		bodyStyles: {
			fontSize: 9
		},
		columnStyles: {
			0: { cellWidth: 40 }, // Kellner
			1: { cellWidth: 30, halign: 'right' }, // Umsatz
			2: { cellWidth: 30, halign: 'right' }, // Bargeld
			3: { cellWidth: 30, halign: 'right' }, // Team Tip
			4: { cellWidth: 45 } // Datum/Uhrzeit
		},
		margin: { left: margin, right: margin }
	});

	// Get the Y position after the table
	const finalY = (doc as any).lastAutoTable.finalY || currentY + 50;

	// Totals section
	currentY = finalY + 10;
	
	doc.setFontSize(12);
	doc.setFont('helvetica', 'bold');
	doc.text('Gesamt:', margin, currentY);
	
	currentY += 8;
	doc.setFont('helvetica', 'normal');
	doc.text(`Tages Umsatz:`, margin + 10, currentY);
	doc.text(`€${data.totals.umsatz.toFixed(2)}`, margin + 80, currentY, { align: 'right' });
	
	currentY += 7;
	doc.text(`Bargeld:`, margin + 10, currentY);
	doc.text(`€${data.totals.bargeld.toFixed(2)}`, margin + 80, currentY, { align: 'right' });
	
	currentY += 7;
	doc.text(`Team Tip:`, margin + 10, currentY);
	doc.text(`€${data.totals.teamTip.toFixed(2)}`, margin + 80, currentY, { align: 'right' });

	// Add Tresorbestand and Safebag if provided
	if (data.tresorbestand) {
		currentY += 7;
		doc.text(`Tresorbestand:`, margin + 10, currentY);
		doc.text(`€${parseFloat(data.tresorbestand).toFixed(2)}`, margin + 80, currentY, { align: 'right' });
	}

	if (data.safebagNr) {
		currentY += 7;
		doc.text(`Safebag Nr.:`, margin + 10, currentY);
		doc.text(data.safebagNr, margin + 80, currentY, { align: 'right' });
		
		// Add safebag breakdown if provided
		if (data.safebagBreakdown) {
			currentY += 10;
			doc.setFontSize(10);
			doc.setFont('helvetica', 'bold');
			doc.text('Safebag Inhalt:', margin + 10, currentY);
			doc.setFont('helvetica', 'normal');
			doc.setFontSize(9);
			
			currentY += 5;
			const breakdown = data.safebagBreakdown;
			const leftCol = margin + 15;
			const rightCol = margin + 60;
			
			if (breakdown.bills500 > 0) {
				currentY += 4;
				doc.text(`€500 x ${breakdown.bills500}`, leftCol, currentY);
				doc.text(`= €${(breakdown.bills500 * 500).toFixed(2)}`, rightCol, currentY);
			}
			if (breakdown.bills200 > 0) {
				currentY += 4;
				doc.text(`€200 x ${breakdown.bills200}`, leftCol, currentY);
				doc.text(`= €${(breakdown.bills200 * 200).toFixed(2)}`, rightCol, currentY);
			}
			if (breakdown.bills100 > 0) {
				currentY += 4;
				doc.text(`€100 x ${breakdown.bills100}`, leftCol, currentY);
				doc.text(`= €${(breakdown.bills100 * 100).toFixed(2)}`, rightCol, currentY);
			}
			if (breakdown.bills50 > 0) {
				currentY += 4;
				doc.text(`€50 x ${breakdown.bills50}`, leftCol, currentY);
				doc.text(`= €${(breakdown.bills50 * 50).toFixed(2)}`, rightCol, currentY);
			}
			if (breakdown.bills20 > 0) {
				currentY += 4;
				doc.text(`€20 x ${breakdown.bills20}`, leftCol, currentY);
				doc.text(`= €${(breakdown.bills20 * 20).toFixed(2)}`, rightCol, currentY);
			}
			if (breakdown.bills10 > 0) {
				currentY += 4;
				doc.text(`€10 x ${breakdown.bills10}`, leftCol, currentY);
				doc.text(`= €${(breakdown.bills10 * 10).toFixed(2)}`, rightCol, currentY);
			}
			if (breakdown.bills5 > 0) {
				currentY += 4;
				doc.text(`€5 x ${breakdown.bills5}`, leftCol, currentY);
				doc.text(`= €${(breakdown.bills5 * 5).toFixed(2)}`, rightCol, currentY);
			}
			if (breakdown.munzen > 0) {
				currentY += 4;
				doc.text(`Münzen`, leftCol, currentY);
				doc.text(`= €${breakdown.munzen.toFixed(2)}`, rightCol, currentY);
			}
			
			currentY += 5;
			doc.setFont('helvetica', 'bold');
			doc.text('Safebag Gesamt:', leftCol, currentY);
			doc.text(`€${breakdown.total.toFixed(2)}`, rightCol, currentY);
			doc.setFont('helvetica', 'normal');
		}
	}

	// Signature line
	currentY = 260; // Fixed position near bottom of page
	
	doc.setFontSize(10);
	doc.text('Unterschrift Schichtleiter:', margin, currentY);
	doc.line(margin + 55, currentY, margin + 120, currentY); // Signature line

	// Footer with generation timestamp
	doc.setFontSize(8);
	doc.setTextColor(128, 128, 128);
	const timestamp = new Date().toLocaleString('de-DE');
	doc.text(`Erstellt am ${timestamp} mit Dobrix-Rechner`, pageWidth / 2, 287, { align: 'center' });

	// Save the PDF
	const filename = `Tagesreport_${data.restaurantName}_${data.geschaeftsDatum.replace(/\./g, '-')}.pdf`;
	doc.save(filename);
	return filename;
}
