document.addEventListener("DOMContentLoaded", () => {
  function tryBindExportAll() {
    const exportBtn = document.getElementById("exportAllButton");
    if (!exportBtn) return setTimeout(tryBindExportAll, 100);

    exportBtn.addEventListener("click", async () => {
      const zip = new JSZip();

      const filters = {
        year: document.getElementById("yearFilter")?.value || "All",
        method: document.getElementById("methodFilter")?.value || "All",
        jurisdiction: document.getElementById("jurisdictionFilter")?.value || "All"
      };

      // Define charts to export
      const charts = [
        { id: "lineChartContainer", label: "LineChart", folder: "Line Chart" },
        { id: "barChartContainer", label: "BarChart", folder: "Bar Chart" },
        { id: "donutChartContainer", label: "DonutChart", folder: "Donut Chart" }
      ];

      // Fetch data once
      const csvText = await fetch("data/mobile_fines_by_detection_method_jurisdiction_year.csv").then(res => res.text());
      const [headerLine, ...lines] = csvText.trim().split("\n");
      const headers = headerLine.split(",");

      const data = lines.map(row => {
        const cells = row.split(",");
        const entry = {};
        headers.forEach((h, i) => entry[h.trim()] = cells[i]?.trim());
        return entry;
      });

      const filtered = data.filter(d =>
        (filters.year === "All" || d.YEAR === filters.year) &&
        (filters.method === "All" || d.DETECTION_METHOD === filters.method) &&
        (filters.jurisdiction === "All" || d.JURISDICTION === filters.jurisdiction)
      );

      // Create individual folders per chart
      for (const { id, label, folder } of charts) {
        const svgElement = document.getElementById(id)?.querySelector("svg");
        if (!svgElement) continue;

        // Convert SVG to PNG
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        await new Promise(resolve => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width * 2;
            canvas.height = img.height * 2;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(pngBlob => {
              zip.folder(folder).file(`${label}.png`, pngBlob);
              resolve();
            }, "image/png");

            URL.revokeObjectURL(url);
          };
          img.src = url;
        });

        // Save chart-specific filtered data
        const chartData = filtered; // same data, but you could refine per chart type
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(chartData);
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

        zip.folder(folder).file(`${label}_Data.xlsx`, wbout);
      }

      // Download zip
      const zipName = `Mobile_Fines_Export_All_Current.zip`;
      zip.generateAsync({ type: "blob" }).then(content => saveAs(content, zipName));
    });
  }

  tryBindExportAll();
});
