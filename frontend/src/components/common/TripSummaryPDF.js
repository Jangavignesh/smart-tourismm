// ============================================================
// src/components/common/TripSummaryPDF.js - V2
// Enhanced PDF with weather, hotel, flight info
// ============================================================

import React, { useState } from "react";

const TripSummaryPDF = ({ destination, budgetData, travelInfo, weatherData }) => {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      if (!window.jspdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const pageH = 297;
      const margin = 15;
      let y = 0;

      // Colors
      const blue     = [37, 99, 235];
      const darkBlue = [30, 64, 175];
      const green    = [22, 163, 74];
      const orange   = [234, 88, 12];
      const purple   = [124, 58, 237];
      const gray     = [100, 116, 139];
      const lightGray= [241, 245, 249];
      const white    = [255, 255, 255];
      const dark     = [15, 23, 42];
      const teal     = [13, 148, 136];

      const fmt = (n) => `Rs.${Math.round(n).toLocaleString("en-IN")}`;

      const drawRect = (x, y, w, h, color, radius = 0) => {
        doc.setFillColor(...color);
        doc.roundedRect(x, y, w, h, radius, radius, "F");
      };

      const drawBorder = (x, y, w, h, color, radius = 0) => {
        doc.setDrawColor(...color);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, y, w, h, radius, radius, "S");
      };

      const txt = (text, x, y, opts = {}) => {
        const { size = 9, color = dark, bold = false, align = "left" } = opts;
        doc.setFontSize(size);
        doc.setTextColor(...color);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.text(String(text ?? ""), x, y, { align });
      };

      const line = (x1, y1, x2, y2, color = [226, 232, 240]) => {
        doc.setDrawColor(...color);
        doc.setLineWidth(0.3);
        doc.line(x1, y1, x2, y2);
      };

      const checkPage = (needed = 20) => {
        if (y + needed > pageH - 20) {
          doc.addPage();
          y = 20;
          return true;
        }
        return false;
      };

      const sectionHeader = (title, color = blue, icon = "") => {
        checkPage(18);
        drawRect(margin, y, pageW - margin * 2, 9, [...color, 0.1].slice(0,3).map((c,i) => i < 3 ? Math.min(255, c + 180) : c), 2);
        drawRect(margin, y, 3, 9, color, 1);
        txt(`${icon}  ${title}`, margin + 6, y + 6, { size: 9, color, bold: true });
        y += 13;
      };

      // ══════════════════════════════════════════════════════
      // PAGE 1 HEADER
      // ══════════════════════════════════════════════════════
      drawRect(0, 0, pageW, 58, darkBlue);
      drawRect(0, 0, pageW, 45, blue);

      txt("SmartTrip", margin, 15, { size: 11, color: [147, 197, 253] });
      txt("AI Tourism Platform", margin, 21, { size: 7, color: [147, 197, 253] });

      txt("TRIP SUMMARY", pageW / 2, 30, { size: 20, color: white, bold: true, align: "center" });
      txt("Your Complete Travel Plan", pageW / 2, 38, { size: 9, color: [191, 219, 254], align: "center" });

      const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
      drawRect(pageW - margin - 42, 10, 42, 10, [30, 64, 175], 3);
      txt(`Generated: ${today}`, pageW - margin - 21, 16.5, { size: 6, color: [191, 219, 254], align: "center" });

      drawRect(0, 45, pageW, 18, lightGray);
      y = 68;

      // ══════════════════════════════════════════════════════
      // DESTINATION CARD
      // ══════════════════════════════════════════════════════
      drawRect(margin, y, pageW - margin * 2, 48, white);
      drawBorder(margin, y, pageW - margin * 2, 48, [226, 232, 240], 3);
      drawRect(margin, y, 4, 48, blue, 2);

      txt(destination?.name || "Destination", margin + 8, y + 11, { size: 15, color: dark, bold: true });
      txt(`${destination?.location?.city || ""}, ${destination?.location?.state || "India"}`, margin + 8, y + 18, { size: 8, color: gray });

      const rating = destination?.rating || 4.5;
      const stars = "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
      txt(`${stars} ${rating}/5`, margin + 8, y + 26, { size: 9, color: orange, bold: true });
      txt(`${(destination?.reviewCount || 0).toLocaleString()} TripAdvisor reviews`, margin + 8, y + 33, { size: 7.5, color: gray });

      // Right column
      const rx = pageW - margin - 65;
      drawRect(rx, y + 5, 63, 10, lightGray, 2);
      txt("Best Time to Visit", rx + 3, y + 10, { size: 6.5, color: gray });
      txt(destination?.bestTimeToVisit || "October to March", rx + 3, y + 16, { size: 7.5, color: dark, bold: true });

      drawRect(rx, y + 18, 63, 10, lightGray, 2);
      txt("Entry Fee", rx + 3, y + 23, { size: 6.5, color: gray });
      txt(destination?.entryFee || "Check locally", rx + 3, y + 29, { size: 7.5, color: dark, bold: true });

      drawRect(rx, y + 31, 63, 10, lightGray, 2);
      txt("Trip Duration", rx + 3, y + 36, { size: 6.5, color: gray });
      txt(`${budgetData?.days || 3} Days / ${budgetData?.people || 2} People`, rx + 3, y + 42, { size: 7.5, color: dark, bold: true });

      y += 54;

      // Categories
      const CATEGORY_META = {
        historical:"Historical", nature:"Nature", beach:"Beach", adventure:"Adventure",
        wildlife:"Wildlife", pilgrimage:"Pilgrimage", hill_stations:"Hill Station",
        food:"Food", culture:"Culture", offbeat:"Offbeat",
      };

      if (destination?.categories?.length > 0) {
        let catX = margin;
        destination.categories.forEach(cat => {
          const label = CATEGORY_META[cat] || cat;
          const w = label.length * 2.2 + 8;
          drawRect(catX, y - 3, w, 7, [219, 234, 254], 2);
          txt(label, catX + w / 2, y + 1.5, { size: 6.5, color: blue, align: "center" });
          catX += w + 3;
        });
        y += 10;
      }

      // About
      line(margin, y, pageW - margin, y);
      y += 5;
      txt("ABOUT THIS DESTINATION", margin, y, { size: 8, color: blue, bold: true });
      y += 5;
      const desc = destination?.description || "A beautiful destination worth visiting.";
      const descLines = doc.splitTextToSize(desc, pageW - margin * 2);
      doc.setFontSize(8);
      doc.setTextColor(...gray);
      doc.setFont("helvetica", "normal");
      descLines.slice(0, 4).forEach(l => { doc.text(l, margin, y); y += 5; });
      y += 3;

      // ══════════════════════════════════════════════════════
      // WEATHER SECTION
      // ══════════════════════════════════════════════════════
      if (weatherData) {
        checkPage(35);
        sectionHeader("CURRENT WEATHER & FORECAST", teal, "");

        drawRect(margin, y, pageW - margin * 2, 24, [240, 253, 250], 3);
        drawBorder(margin, y, pageW - margin * 2, 24, [153, 246, 228], 3);

        txt(`${weatherData.city || destination?.name}`, margin + 5, y + 8, { size: 11, color: dark, bold: true });
        txt(`${Math.round(weatherData.temp || 25)}°C  •  ${weatherData.description || "Pleasant"}`, margin + 5, y + 15, { size: 9, color: teal });
        txt(`Humidity: ${weatherData.humidity || 60}%  |  Wind: ${weatherData.windSpeed || 10} km/h`, margin + 5, y + 21, { size: 7.5, color: gray });

        // Forecast mini boxes
        if (weatherData.forecast?.length > 0) {
          const boxW = (pageW - margin * 2 - 5) / Math.min(weatherData.forecast.length, 5);
          weatherData.forecast.slice(0, 5).forEach((f, i) => {
            const bx = margin + i * (boxW + 1);
            const by = y + 27;
            drawRect(bx, by, boxW, 18, white, 2);
            drawBorder(bx, by, boxW, 18, [153, 246, 228], 2);
            txt(f.day || `Day ${i+1}`, bx + boxW/2, by + 6, { size: 6, color: gray, align: "center" });
            txt(`${Math.round(f.temp || 25)}°C`, bx + boxW/2, by + 12, { size: 8, color: dark, bold: true, align: "center" });
            txt(f.description?.slice(0,8) || "Clear", bx + boxW/2, by + 17, { size: 5.5, color: teal, align: "center" });
          });
          y += 50;
        } else {
          y += 30;
        }
      }

      // ══════════════════════════════════════════════════════
      // BUDGET SECTION
      // ══════════════════════════════════════════════════════
      if (budgetData) {
        checkPage(80);
        sectionHeader("TRIP BUDGET ESTIMATE", green, "");

        // Budget type + summary
        const typeColors = { budget: green, mid: orange, luxury: purple };
        const typeColor = typeColors[budgetData.budgetType] || orange;
        drawRect(margin, y, 40, 9, typeColor, 2);
        txt(`${(budgetData.budgetType || "MID-RANGE").toUpperCase()} PLAN`, margin + 20, y + 6, { size: 7.5, color: white, bold: true, align: "center" });
        txt(`${budgetData.days || 3} Days  •  ${budgetData.people || 2} People`, margin + 45, y + 6, { size: 8, color: gray });
        y += 13;

        // Budget table
        const items = [
          { label: "Hotel / Accommodation", sublabel: `${budgetData.days || 3} nights`, value: budgetData.hotelCost || 0, icon: "🏨", color: blue },
          { label: travelInfo ? `Travel (${travelInfo.mode || "Train"}) — Return` : "Transportation", sublabel: travelInfo ? `${travelInfo.distance || 0} km` : "Estimated", value: budgetData.travelCost || 0, icon: "✈", color: teal },
          { label: "Food & Dining", sublabel: `${budgetData.days || 3} days`, value: budgetData.foodCost || 0, icon: "🍽", color: orange },
          { label: "Activities & Sightseeing", sublabel: "Entry fees included", value: budgetData.activitiesCost || 0, icon: "🎯", color: purple },
          { label: "Local Transport", sublabel: "Auto/Cab/Bus", value: budgetData.transportCost || 0, icon: "🚗", color: green },
        ];

        // Table header
        drawRect(margin, y, pageW - margin * 2, 8, [241, 245, 249]);
        txt("Expense Item", margin + 4, y + 5.5, { size: 7.5, color: gray, bold: true });
        txt("Details", pageW / 2, y + 5.5, { size: 7.5, color: gray, bold: true });
        txt("Amount", pageW - margin - 4, y + 5.5, { size: 7.5, color: gray, bold: true, align: "right" });
        y += 10;

        items.forEach((item, i) => {
          if (i % 2 === 0) drawRect(margin, y - 1, pageW - margin * 2, 9, [248, 250, 252]);
          drawRect(margin + 1, y + 1, 3, 5, item.color, 1);
          txt(item.label, margin + 7, y + 5, { size: 8, color: dark, bold: true });
          txt(item.sublabel, pageW / 2, y + 5, { size: 7, color: gray });
          txt(fmt(item.value), pageW - margin - 4, y + 5, { size: 8.5, color: dark, bold: true, align: "right" });
          y += 9;
        });

        // Total
        drawRect(margin, y + 1, pageW - margin * 2, 12, green, 2);
        txt("TOTAL ESTIMATED COST", margin + 4, y + 9, { size: 9.5, color: white, bold: true });
        txt(fmt(budgetData.totalCost || 0), pageW - margin - 4, y + 9, { size: 12, color: white, bold: true, align: "right" });
        y += 17;

        // Per person
        drawRect(margin, y, pageW - margin * 2, 8, [240, 253, 244], 2);
        txt("Per Person:", margin + 4, y + 5.5, { size: 8, color: green });
        txt(fmt((budgetData.totalCost || 0) / (budgetData.people || 2)), margin + 30, y + 5.5, { size: 9, color: green, bold: true });
        txt("Per Day (Total):", pageW / 2, y + 5.5, { size: 8, color: green });
        txt(fmt((budgetData.totalCost || 0) / (budgetData.days || 3)), pageW / 2 + 35, y + 5.5, { size: 9, color: green, bold: true });
        y += 13;
      }

      // ══════════════════════════════════════════════════════
      // HOTEL RECOMMENDATIONS
      // ══════════════════════════════════════════════════════
      checkPage(50);
      sectionHeader("HOTEL RECOMMENDATIONS", blue, "");

      const budgetType = budgetData?.budgetType || "mid";
      const hotelOptions = {
        budget: [
          { name: "Budget Hostel / Guesthouse", price: "Rs.500 - Rs.1,200/night", features: "Basic amenities, shared facilities, great for backpackers" },
          { name: "Economy Hotel", price: "Rs.1,200 - Rs.2,000/night", features: "Private room, WiFi, AC, breakfast optional" },
        ],
        mid: [
          { name: "3-Star Business Hotel", price: "Rs.2,000 - Rs.4,000/night", features: "Restaurant, WiFi, AC, room service, parking" },
          { name: "Heritage / Boutique Hotel", price: "Rs.3,500 - Rs.6,000/night", features: "Local character, guided tours, cultural experience" },
        ],
        luxury: [
          { name: "5-Star Resort", price: "Rs.8,000 - Rs.20,000/night", features: "Pool, spa, fine dining, concierge, airport transfer" },
          { name: "Luxury Heritage Palace", price: "Rs.15,000 - Rs.40,000/night", features: "Royal experience, butler service, private dining" },
        ],
      };

      const hotels = hotelOptions[budgetType] || hotelOptions.mid;
      hotels.forEach((hotel, i) => {
        checkPage(20);
        drawRect(margin, y, pageW - margin * 2, 17, i === 0 ? [239, 246, 255] : [240, 253, 244], 3);
        drawBorder(margin, y, pageW - margin * 2, 17, i === 0 ? [191, 219, 254] : [167, 243, 208], 3);
        drawRect(margin, y, 3, 17, i === 0 ? blue : green, 1);
        txt(hotel.name, margin + 7, y + 7, { size: 9, color: dark, bold: true });
        txt(hotel.price, pageW - margin - 4, y + 7, { size: 8.5, color: green, bold: true, align: "right" });
        txt(hotel.features, margin + 7, y + 13, { size: 7, color: gray });
        y += 20;
      });
      y += 2;

      // ══════════════════════════════════════════════════════
      // TRAVEL OPTIONS
      // ══════════════════════════════════════════════════════
      checkPage(55);
      sectionHeader("HOW TO REACH", teal, "");

      const travelOptions = [
        { mode: "✈ By Flight", details: "Nearest airport + cab to destination. Fastest option.", cost: "Rs.3,000 - Rs.12,000 (return)", time: "2-5 hours total" },
        { mode: "🚆 By Train", details: "Comfortable overnight/day trains available.", cost: "Rs.500 - Rs.3,000 (return)", time: "4-18 hours depending on origin" },
        { mode: "🚌 By Bus", details: "State/private AC & non-AC buses available.", cost: "Rs.300 - Rs.1,500 (return)", time: "6-24 hours depending on origin" },
        { mode: "🚗 By Car", details: "Road trip — most flexible option.", cost: "Rs.5 - Rs.12 per km", time: "Depends on distance" },
      ];

      travelOptions.forEach((opt, i) => {
        checkPage(14);
        if (i % 2 === 0) {
          drawRect(margin, y, (pageW - margin * 2 - 4) / 2, 18, lightGray, 2);
          drawBorder(margin, y, (pageW - margin * 2 - 4) / 2, 18, [226, 232, 240], 2);
          txt(opt.mode, margin + 3, y + 7, { size: 8, color: dark, bold: true });
          txt(opt.cost, margin + 3, y + 13, { size: 7, color: green, bold: true });
          txt(opt.time, margin + 3, y + 17.5, { size: 6.5, color: gray });
        } else {
          const ox = margin + (pageW - margin * 2 - 4) / 2 + 4;
          const ow = (pageW - margin * 2 - 4) / 2;
          drawRect(ox, y, ow, 18, lightGray, 2);
          drawBorder(ox, y, ow, 18, [226, 232, 240], 2);
          txt(opt.mode, ox + 3, y + 7, { size: 8, color: dark, bold: true });
          txt(opt.cost, ox + 3, y + 13, { size: 7, color: green, bold: true });
          txt(opt.time, ox + 3, y + 17.5, { size: 6.5, color: gray });
          y += 21;
        }
      });
      y += 5;

      // ══════════════════════════════════════════════════════
      // ITINERARY
      // ══════════════════════════════════════════════════════
      checkPage(20);
      sectionHeader("SUGGESTED ITINERARY", purple, "");

      const days = budgetData?.days || 3;
      const activities = destination?.popularActivities || ["Explore local attractions", "Visit famous landmarks", "Try local cuisine", "Sightseeing", "Shopping"];

      for (let d = 1; d <= Math.min(days, 7); d++) {
        checkPage(28);
        let dayActs = [];
        if (d === 1) dayActs = ["Arrive & check in to hotel", activities[0] || "Explore the area", "Welcome dinner at local restaurant"];
        else if (d === days) dayActs = ["Morning breakfast at hotel", "Last-minute shopping & sightseeing", "Check-out & departure"];
        else dayActs = [
          activities[(d - 1) % activities.length] || "Sightseeing",
          "Lunch at famous local restaurant",
          activities[d % activities.length] || "Evening exploration",
        ];

        const colors = [[239,246,255],[240,253,244],[254,243,199],[253,242,255],[240,253,250],[255,247,237],[248,250,252]];
        const borderColors = [[191,219,254],[167,243,208],[253,224,71],[216,180,254],[153,246,228],[254,215,170],[226,232,240]];
        const textColors = [blue, green, [161,98,7], purple, teal, orange, gray];

        drawRect(margin, y, pageW - margin * 2, 22, colors[(d-1) % colors.length], 3);
        drawBorder(margin, y, pageW - margin * 2, 22, borderColors[(d-1) % borderColors.length], 3);
        drawRect(margin, y, 3, 22, textColors[(d-1) % textColors.length], 1);

        txt(`Day ${d}`, margin + 6, y + 7, { size: 9, color: textColors[(d-1) % textColors.length], bold: true });
        if (d === 1) txt("Arrival", margin + 19, y + 7, { size: 7, color: gray });
        else if (d === days) txt("Departure", margin + 19, y + 7, { size: 7, color: gray });

        // eslint-disable-next-line no-loop-func
        dayActs.forEach((act, ai) => {
          txt(`• ${act}`, margin + 6, y + 13 + ai * 5, { size: 7.5, color: dark });
        });
        y += 25;
      }

      // ══════════════════════════════════════════════════════
      // POPULAR ACTIVITIES
      // ══════════════════════════════════════════════════════
      if (destination?.popularActivities?.length > 0) {
        checkPage(30);
        sectionHeader("THINGS TO DO", orange, "");

        const acts = destination.popularActivities.slice(0, 8);
        acts.forEach((act, i) => {
          const col = i % 2 === 0 ? margin : pageW / 2 + 3;
          if (i % 2 === 0 && i > 0) y += 8;
          drawRect(col, y - 3, 3, 3, orange, 1);
          txt(act, col + 6, y, { size: 8, color: dark });
        });
        y += 12;
      }

      // ══════════════════════════════════════════════════════
      // PACKING LIST
      // ══════════════════════════════════════════════════════
      checkPage(35);
      sectionHeader("PACKING CHECKLIST", gray, "");

      const packingItems = [
        ["ID Proof & Tickets", "Cash & Cards", "Travel Insurance"],
        ["Comfortable Footwear", "Sunscreen & Sunglasses", "First Aid Kit"],
        ["Camera & Charger", "Power Bank", "Water Bottle"],
        ["Light Jackets/Woolens", "Rain Gear (if monsoon)", "Snacks for journey"],
      ];

      packingItems.forEach((row, ri) => {
        checkPage(8);
        row.forEach((item, ci) => {
          const cx = margin + ci * (pageW - margin * 2) / 3;
          drawRect(cx, y - 3, 3, 3, green, 1);
          txt(item, cx + 6, y, { size: 7.5, color: dark });
        });
        y += 8;
      });
      y += 5;

      // ══════════════════════════════════════════════════════
      // FOOTER ON ALL PAGES
      // ══════════════════════════════════════════════════════
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const fy = pageH - 12;
        line(margin, fy - 2, pageW - margin, fy - 2);
        txt("SmartTrip — AI Tourism Platform", margin, fy + 2, { size: 6.5, color: gray });
        txt(`Page ${i} of ${totalPages}`, pageW / 2, fy + 2, { size: 6.5, color: gray, align: "center" });
        txt("* Estimates only. Actual costs may vary.", pageW - margin, fy + 2, { size: 6.5, color: gray, align: "right" });
      }

      const fileName = `SmartTrip_${(destination?.name || "Trip").replace(/\s+/g, "_")}_Summary.pdf`;
      doc.save(fileName);

    } catch (err) {
      console.error("PDF error:", err);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button onClick={generatePDF} disabled={generating}
      className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm">
      {generating ? (
        <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Generating PDF...</>
      ) : <>📄 Download Trip Summary PDF</>}
    </button>
  );
};

export default TripSummaryPDF;
