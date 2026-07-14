import type { Certificate } from "@workspace/db";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

async function generateLegacyCertificatePDF(cert: Certificate): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([960, 720]);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSerif = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontSerifBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontSerifItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const width = page.getWidth();
  const height = page.getHeight();

  const formatModeLabel = (mode: string) =>
    mode
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");

  const navy = rgb(0.02, 0.14, 0.44);
  const blue = rgb(0.08, 0.33, 0.8);
  const gold = rgb(0.83, 0.63, 0.22);
  const gray = rgb(0.2, 0.24, 0.3);
  const lightGray = rgb(0.95, 0.96, 0.98);

  const drawCentered = (text: string, y: number, size: number, color = gray, font = fontRegular) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color });
  };

  const drawCenteredAt = (
    text: string,
    centerX: number,
    y: number,
    size: number,
    color = gray,
    font = fontRegular,
  ) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: centerX - textWidth / 2, y, size, font, color });
  };

  const drawFittedCentered = (
    text: string,
    y: number,
    initialSize: number,
    maxWidth: number,
    color = gray,
    font = fontRegular,
    minSize = 28,
  ) => {
    let size = initialSize;
    while (size > minSize && font.widthOfTextAtSize(text, size) > maxWidth) {
      size -= 1;
    }

    drawCentered(text, y, size, color, font);
  };

  const drawArcText = (
    text: string,
    cx: number,
    cy: number,
    radius: number,
    startDeg: number,
    endDeg: number,
    size: number,
    font = fontBold,
    color = blue,
    arc: "top" | "bottom" = "top",
  ) => {
    if (!text.length) return;
    const start = (startDeg * Math.PI) / 180;
    const end = (endDeg * Math.PI) / 180;
    const step = text.length === 1 ? 0 : (end - start) / (text.length - 1);

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const angle = start + step * i;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      const w = font.widthOfTextAtSize(ch, size);
      page.drawText(ch, {
        x: x - w / 2,
        y: y - size / 2,
        size,
        font,
        color,
        rotate:
          arc === "top"
            ? degrees((angle * 180) / Math.PI - 90)
            : degrees((angle * 180) / Math.PI + 90),
      });
    }
  };

  // Background and borders
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 16, y: 16, width: width - 32, height: height - 32, borderColor: blue, borderWidth: 2 });
  page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: gold, borderWidth: 0.8 });

  // Corner accents
  page.drawRectangle({ x: -20, y: 145, width: 90, height: 180, color: navy });
  page.drawRectangle({ x: width - 70, y: 155, width: 90, height: 170, color: blue });
  page.drawRectangle({ x: width - 95, y: 175, width: 90, height: 130, color: navy });

  // Left ribbon + medal (reference style)
  const medalX = 112;
  const medalY = 586;

  // Top hanging strap
  page.drawRectangle({ x: 74, y: 636, width: 76, height: 96, color: navy });
  page.drawRectangle({ x: 77, y: 639, width: 70, height: 90, borderColor: rgb(0.3, 0.47, 0.9), borderWidth: 0.8 });

  // Rosette scalloped edge
  for (let i = 0; i < 28; i++) {
    const a = (Math.PI * 2 * i) / 28;
    page.drawCircle({
      x: medalX + Math.cos(a) * 68,
      y: medalY + Math.sin(a) * 68,
      size: 9,
      color: rgb(0.95, 0.79, 0.36),
    });
  }
  page.drawCircle({ x: medalX, y: medalY, size: 67, color: gold });
  page.drawCircle({ x: medalX, y: medalY, size: 57, color: navy });
  page.drawCircle({ x: medalX, y: medalY, size: 46, borderColor: gold, borderWidth: 2 });

  // Center star
  drawCenteredAt("*", medalX, medalY + 30, 16, gold, fontBold);

  // Laurel style dots (left + right arcs)
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const leftA = ((220 + t * 85) * Math.PI) / 180;
    const rightA = ((320 - t * 85) * Math.PI) / 180;
    page.drawCircle({ x: medalX + Math.cos(leftA) * 35, y: medalY + Math.sin(leftA) * 35, size: 2.1, color: gold });
    page.drawCircle({ x: medalX + Math.cos(rightA) * 35, y: medalY + Math.sin(rightA) * 35, size: 2.1, color: gold });
  }

  drawCenteredAt("EXCELLENCE", medalX, medalY + 12, 10, gold, fontBold);
  drawCenteredAt("THROUGH", medalX, medalY - 2, 9, gold, fontBold);
  drawCenteredAt("PRACTICE", medalX, medalY - 16, 9, gold, fontBold);

  // Bottom curved accent
  page.drawSvgPath(`M ${medalX - 20} ${medalY - 36} Q ${medalX} ${medalY - 48} ${medalX + 20} ${medalY - 36}`, {
    borderColor: gold,
    borderWidth: 1,
  });

  // Ribbon tails
  page.drawSvgPath("M 72 466 L 98 518 L 112 472 L 126 518 L 154 466 L 145 456 L 112 480 L 80 456 Z", {
    color: navy,
  });
  page.drawSvgPath("M 83 466 L 98 500 L 108 470", { borderColor: rgb(0.29, 0.44, 0.84), borderWidth: 1.2 });
  page.drawSvgPath("M 141 466 L 126 500 L 116 470", { borderColor: rgb(0.29, 0.44, 0.84), borderWidth: 1.2 });

  // Branding and metadata (style: typing [keyboard icon] peak)
  const brandY = 638;
  const typingSize = 24;
  const peakSize = 24;
  const iconW = 52;
  const iconH = 22;
  const gap = 10;
  const typingText = "typing";
  const peakText = "peak";
  const typingW = fontBold.widthOfTextAtSize(typingText, typingSize);
  const peakW = fontRegular.widthOfTextAtSize(peakText, peakSize);
  const totalBrandW = typingW + gap + iconW + gap + peakW;
  const brandStartX = (width - totalBrandW) / 2;
  const iconX = brandStartX + typingW + gap;
  const peakX = iconX + iconW + gap;

  page.drawText(typingText, {
    x: brandStartX,
    y: brandY,
    size: typingSize,
    font: fontBold,
    color: rgb(0.08, 0.1, 0.13),
  });

  // Blue keyboard container
  page.drawRectangle({
    x: iconX,
    y: brandY + 3,
    width: iconW,
    height: iconH,
    color: blue,
    borderColor: blue,
    borderWidth: 1.2,
  });

  // Keyboard outer stroke
  page.drawRectangle({
    x: iconX + 3,
    y: brandY + 6,
    width: iconW - 6,
    height: iconH - 6,
    borderColor: rgb(1, 1, 1),
    borderWidth: 1.2,
  });

  // Key blocks (top row)
  const keyY1 = brandY + 17;
  const keyY2 = brandY + 10;
  const keyW = 6;
  const keyH = 4;
  const kx = iconX + 7;
  for (let i = 0; i < 4; i++) {
    page.drawRectangle({ x: kx + i * 9, y: keyY1, width: keyW, height: keyH, color: rgb(1, 1, 1) });
  }

  // Key blocks (bottom row)
  for (let i = 0; i < 4; i++) {
    page.drawRectangle({ x: kx + i * 9, y: keyY2, width: keyW, height: keyH, color: rgb(1, 1, 1) });
  }

  page.drawText(peakText, {
    x: peakX,
    y: brandY,
    size: peakSize,
    font: fontRegular,
    color: blue,
  });

  const issueDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
  const assessmentTitle = `${cert.level ?? "Typing"} ${formatModeLabel(cert.mode)} Test`;
  const verificationUrl = `typingpeak.com/verify-certificate/${cert.certificateId}`;

  page.drawText("CERTIFICATE ID", { x: width - 165, y: 654, size: 10, font: fontBold, color: gray });
  page.drawText(cert.certificateId, { x: width - 190, y: 637, size: 14, font: fontBold, color: blue });
  page.drawText("DATE", { x: width - 121, y: 598, size: 11, font: fontBold, color: gray });
  page.drawText(issueDate, { x: width - 156, y: 582, size: 11, font: fontBold, color: navy });

  // Main title
  drawCentered("CERTIFICATE", 500, 66, navy, fontSerifBold);
  drawCentered("OF EXCELLENCE", 458, 24, rgb(0.1, 0.12, 0.15), fontSerifBold);
  page.drawText("*", { x: 332, y: 462, size: 14, font: fontBold, color: gold });
  page.drawText("*", { x: 618, y: 462, size: 14, font: fontBold, color: gold });

  drawCentered("This is to certify that", 410, 22, gray, fontRegular);

  drawFittedCentered(cert.recipientName, 356, 58, 430, blue, fontSerifItalic, 34);
  page.drawLine({
    start: { x: 272, y: 342 },
    end: { x: 688, y: 342 },
    thickness: 1,
    color: gold,
  });

  drawCentered("has successfully completed the", 304, 18, gray, fontRegular);
  drawCentered(assessmentTitle, 274, 18, blue, fontBold);
  drawCentered("on Typing Peak and demonstrated outstanding performance.", 246, 17, rgb(0.12, 0.13, 0.14), fontRegular);

  // Stats panel
  const panelX = 224;
  const panelY = 146;
  const panelW = 520;
  const panelH = 118;
  page.drawRectangle({ x: panelX, y: panelY, width: panelW, height: panelH, borderColor: rgb(0.72, 0.78, 0.92), borderWidth: 1.5, color: lightGray });

  const statW = panelW / 4;
  for (let i = 1; i < 4; i++) {
    page.drawLine({
      start: { x: panelX + statW * i, y: panelY + 16 },
      end: { x: panelX + statW * i, y: panelY + panelH - 16 },
      thickness: 1,
      color: rgb(0.75, 0.78, 0.84),
    });
  }

  const stats = [
    { value: `${Math.round(cert.wpm)}`, label1: "WPM", label2: "Speed" },
    { value: `${Math.round(cert.accuracy)}%`, label1: "Accuracy", label2: "" },
    { value: `${Math.round(cert.duration)}`, label1: "Seconds", label2: "Test Duration" },
    { value: `${cert.level ?? "Advanced"}`, label1: "Level", label2: "" },
  ];

  for (let i = 0; i < stats.length; i++) {
    const cx = panelX + statW * i + statW / 2;
    page.drawCircle({ x: cx, y: panelY + 90, size: 16, color: blue });
    page.drawText("*", { x: cx - 4, y: panelY + 85, size: 12, font: fontBold, color: rgb(1, 1, 1) });

    const value = stats[i].value;
    const valueSize = i === 3 ? 16 : 40;
    const valueWidth = fontBold.widthOfTextAtSize(value, valueSize);
    page.drawText(value, {
      x: cx - valueWidth / 2,
      y: panelY + 42,
      size: valueSize,
      font: fontBold,
      color: navy,
    });

    const l1Width = fontBold.widthOfTextAtSize(stats[i].label1, 14);
    page.drawText(stats[i].label1, { x: cx - l1Width / 2, y: panelY + 24, size: 11, font: fontBold, color: navy });

    if (stats[i].label2) {
      const l2Width = fontRegular.widthOfTextAtSize(stats[i].label2, 10);
      page.drawText(stats[i].label2, { x: cx - l2Width / 2, y: panelY + 11, size: 9, font: fontRegular, color: gray });
    }
  }

  drawCentered("Keep practicing. Keep improving. Keep reaching your peak!", 108, 16, gray, fontRegular);

  // Bottom-left premium certified seal (matched to preferred sample)
  const sealX = 140;
  const sealY = 90;
  page.drawCircle({ x: sealX, y: sealY, size: 58, color: rgb(1, 1, 1), borderColor: blue, borderWidth: 2.4 });
  page.drawCircle({ x: sealX, y: sealY, size: 50, borderColor: rgb(0.68, 0.8, 0.99), borderWidth: 1.4 });
  page.drawCircle({ x: sealX, y: sealY, size: 38.5, borderColor: blue, borderWidth: 1.6 });

  // Micro dotted security ring
  for (let i = 0; i < 44; i++) {
    const a = (Math.PI * 2 * i) / 44;
    const dx = Math.cos(a) * 44;
    const dy = Math.sin(a) * 44;
    page.drawCircle({ x: sealX + dx, y: sealY + dy, size: 0.55, color: rgb(0.64, 0.74, 0.95) });
  }

  // Side stars and top/bottom dots
  page.drawText("*", { x: sealX - 38, y: sealY - 4, size: 9, font: fontBold, color: blue });
  page.drawText("*", { x: sealX + 31, y: sealY - 4, size: 9, font: fontBold, color: blue });
  page.drawCircle({ x: sealX, y: sealY + 35, size: 1.3, color: blue });
  page.drawCircle({ x: sealX, y: sealY - 35, size: 1.3, color: blue });

  // Tighter curved labels to match sample density
  drawArcText("TYPING PEAK", sealX, sealY, 46, 145, 35, 8, fontBold, blue, "top");
  drawArcText("CERTIFIED", sealX, sealY, 46, 215, 325, 8, fontBold, blue, "bottom");

  // Center keyboard icon block
  page.drawRectangle({
    x: sealX - 19,
    y: sealY - 10,
    width: 38,
    height: 20,
    borderColor: blue,
    borderWidth: 1.3,
    color: rgb(0.96, 0.98, 1),
  });
  page.drawRectangle({ x: sealX - 14, y: sealY + 4, width: 7, height: 3, color: blue });
  page.drawRectangle({ x: sealX - 5, y: sealY + 4, width: 7, height: 3, color: blue });
  page.drawRectangle({ x: sealX + 4, y: sealY + 4, width: 7, height: 3, color: blue });
  page.drawRectangle({ x: sealX - 14, y: sealY - 1, width: 11, height: 3, color: blue });
  page.drawRectangle({ x: sealX - 1, y: sealY - 1, width: 11, height: 3, color: blue });

  // Footer signature block
  drawCentered("Typing Peak", 68, 26, navy, fontSerifItalic);
  page.drawLine({ start: { x: 380, y: 64 }, end: { x: 580, y: 64 }, thickness: 1, color: gold });
  drawCentered("Typing Peak Team", 44, 18, gray, fontBold);
  drawCentered("Empowering Skills. Building Future.", 26, 13, gray, fontRegular);

  // Verify box (QR placeholder style)
  const qrX = width - 192;
  const qrY = 56;
  page.drawRectangle({ x: qrX, y: qrY, width: 88, height: 88, borderColor: gray, borderWidth: 1.2 });
  const cell = 11;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 0 || (r < 2 && c < 2) || (r > 5 && c > 5)) {
        page.drawRectangle({ x: qrX + 2 + c * cell, y: qrY + 2 + r * cell, width: cell - 2, height: cell - 2, color: rgb(0.05, 0.05, 0.05) });
      }
    }
  }
  page.drawText("Verify this certificate at", { x: width - 210, y: 38, size: 9, font: fontRegular, color: gray });
  page.drawText(verificationUrl, { x: width - 210, y: 24, size: 8, font: fontBold, color: blue });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

/** The downloadable certificate intentionally mirrors the in-app preview. */
export async function generateCertificatePDF(cert: Certificate): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([960, 720]);
  const sans = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const serif = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const width = page.getWidth();

  const navy = rgb(0.04, 0.1, 0.2);
  const blue = rgb(0.09, 0.35, 0.71);
  const gold = rgb(0.85, 0.67, 0.25);
  const muted = rgb(0.32, 0.4, 0.53);
  const paper = rgb(0.992, 0.984, 0.95);

  const centered = (text: string, y: number, size: number, font = sans, color = navy) => {
    page.drawText(text, { x: (width - font.widthOfTextAtSize(text, size)) / 2, y, size, font, color });
  };

  const fittedCentered = (text: string, y: number, size: number, maxWidth: number, font = serifBold, color = blue) => {
    let fitted = size;
    while (fitted > 28 && font.widthOfTextAtSize(text, fitted) > maxWidth) fitted -= 1;
    centered(text, y, fitted, font, color);
  };

  // Paper and the same double blue / gold frame used in the browser preview.
  page.drawRectangle({ x: 0, y: 0, width: 960, height: 720, color: paper });
  page.drawRectangle({ x: 18, y: 18, width: 924, height: 684, borderColor: rgb(0.22, 0.5, 0.9), borderWidth: 2 });
  page.drawRectangle({ x: 25, y: 25, width: 910, height: 670, borderColor: rgb(0.22, 0.5, 0.9), borderWidth: 1 });
  page.drawRectangle({ x: 42, y: 42, width: 876, height: 636, borderColor: gold, borderWidth: 0.8 });

  // TypingPeak brand mark: the same typing + keyboard + peak identity used by the site navbar.
  const brandY = 586;
  const typing = "typing";
  const peak = "peak";
  const typingSize = 22;
  const peakSize = 20;
  const keyboardWidth = 36;
  const typingWidth = sansBold.widthOfTextAtSize(typing, typingSize);
  const peakWidth = sans.widthOfTextAtSize(peak, peakSize);
  const startX = (width - typingWidth - peakWidth - keyboardWidth - 18) / 2;
  page.drawText(typing, { x: startX, y: brandY, size: typingSize, font: sansBold, color: navy });
  const keyboardX = startX + typingWidth + 8;
  page.drawRectangle({ x: keyboardX, y: brandY + 1, width: keyboardWidth, height: 17, borderColor: blue, borderWidth: 1.3 });
  for (let row = 0; row < 2; row++) {
    for (let column = 0; column < 4; column++) {
      page.drawRectangle({ x: keyboardX + 4 + column * 7, y: brandY + 5 + row * 5, width: 4, height: 3, color: blue });
    }
  }
  page.drawText(peak, { x: keyboardX + keyboardWidth + 8, y: brandY + 1, size: peakSize, font: sans, color: blue });

  centered("Certificate of Achievement", 520, 48, serifBold, navy);
  centered("This certificate is proudly presented to", 466, 16, sans, muted);
  fittedCentered(cert.recipientName, 404, 48, 620);
  page.drawLine({ start: { x: 415, y: 382 }, end: { x: 545, y: 382 }, thickness: 1, color: gold });
  centered("for demonstrating excellent typing performance with speed, precision, and", 338, 15, sans, muted);
  centered("consistency.", 316, 15, sans, muted);

  const statsY = 220;
  const left = 270;
  const statWidth = 140;
  page.drawLine({ start: { x: left, y: statsY + 54 }, end: { x: left + statWidth * 3, y: statsY + 54 }, thickness: 0.8, color: gold });
  page.drawLine({ start: { x: left, y: statsY - 32 }, end: { x: left + statWidth * 3, y: statsY - 32 }, thickness: 0.8, color: gold });
  for (let i = 1; i < 3; i++) {
    page.drawLine({ start: { x: left + statWidth * i, y: statsY - 14 }, end: { x: left + statWidth * i, y: statsY + 36 }, thickness: 0.6, color: gold });
  }
  const stats = [
    { value: `${Math.round(cert.wpm)}`, label: "WPM", size: 27 },
    { value: `${Math.round(cert.accuracy)}%`, label: "ACCURACY", size: 27 },
    { value: cert.level, label: "LEVEL", size: 18 },
  ];
  stats.forEach((stat, index) => {
    const centerX = left + statWidth * index + statWidth / 2;
    page.drawText(stat.value, { x: centerX - sansBold.widthOfTextAtSize(stat.value, stat.size) / 2, y: statsY + 2, size: stat.size, font: sansBold, color: index === 0 ? blue : navy });
    const labelSize = 9;
    page.drawText(stat.label, { x: centerX - sans.widthOfTextAtSize(stat.label, labelSize) / 2, y: statsY - 17, size: labelSize, font: sans, color: muted });
  });

  const issued = new Date(cert.issuedAt).toLocaleDateString("en-US");
  page.drawText(`Issued ${issued}`, { x: 90, y: 90, size: 12, font: sans, color: muted });
  const id = `ID: ${cert.certificateId}`;
  page.drawText(id, { x: 870 - sans.widthOfTextAtSize(id, 12), y: 90, size: 12, font: sans, color: muted });

  return Buffer.from(await pdfDoc.save());
}
