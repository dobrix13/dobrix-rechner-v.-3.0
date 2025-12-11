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
	doc.text(`Tagesreport vom ${data.geschaeftsDatum}`, pageWidth / 2, currentY, { align: 'center' });

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
	doc.text('Tagessummen:', margin, currentY);
	
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

	// Signature line
	currentY = 260; // Fixed position near bottom of page
	
	doc.setFontSize(10);
	doc.text('Manager Unterschrift:', margin, currentY);
	doc.line(margin + 45, currentY, margin + 100, currentY); // Signature line
	
	currentY += 5;
	doc.setFontSize(8);
	doc.text('Datum:', margin, currentY);
	doc.line(margin + 15, currentY, margin + 60, currentY); // Date line

	// Footer with generation timestamp
	doc.setFontSize(8);
	doc.setTextColor(128, 128, 128);
	const timestamp = new Date().toLocaleString('de-DE');
	doc.text(`Erstellt am ${timestamp}`, pageWidth / 2, 287, { align: 'center' });

	// Save the PDF
	const filename = `Tagesreport_${data.restaurantName}_${data.geschaeftsDatum.replace(/\./g, '-')}.pdf`;
	doc.save(filename);
}
