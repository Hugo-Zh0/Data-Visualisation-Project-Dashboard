// Export All: Downloads all charts + their data into one ZIP with folders
document.getElementById("exportAllButton")?.addEventListener("click", () => {
  const JSZip = window.JSZip;
  const XLSX = window.XLSX;
  const zip = new JSZip();

  const chartMappings = [
    { id: "lineChartContainer", name: "LineChart", type: "line" },
    { id: "barChartContainer", name: "BarChart", type: "bar" },
    { id: "donutChartContainer", name: "DonutChart", type: "donut" }
  ];

  const filters = {
    year: document.getElementById("yearFilter")?.value || "All",
    method: document.getElementById("methodFilter")?.value || "All",
    jurisdiction: document.getElementById("jurisdictionFilter")?.value || "All"
  };

  Promise.all(chartMappings.map(({ id, name, type }) => {
    const container = document.getElementById(id);
    if (!container) return Promise.resolve(null);

    const svg = container.querySelector("svg");
    if (!svg) return Promise.resolve(null);

    const svgData = new XMLSerializer().serializeToString(svg);

    // Create PNG from SVG
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const img = new Image();

    return new Promise((resolve) => {
      img.onload = function () {
        const viewBox = svg.getAttribute("viewBox")?.split(" ").map(Number) || [0, 0, 800, 300];
        const [minX, minY, vbWidth, vbHeight] = viewBox;
        const scale = 3;

        const canvas = document.createElement("canvas");
        canvas.width = vbWidth * scale;
        canvas.height = vbHeight * scale;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(svgUrl);

        canvas.toBlob(pngBlob => {
          // Create dummy Excel data (real data binding can be added later)
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.aoa_to_sheet([
            ["Placeholder Data for", name],
            ["Year", filters.year],
            ["Method", filters.method],
            ["Jurisdiction", filters.jurisdiction]
          ]);
          XLSX.utils.book_append_sheet(wb, ws, "Chart Data");

          const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
          const excelBlob = new Blob([wbout], { type: "application/octet-stream" });

          const folder = zip.folder(name);
          folder.file(`MobileFines_${name}.png`, pngBlob);
          folder.file(`MobileFines_${name}.xlsx`, excelBlob);

          resolve();
        }, "image/png");
      };

      img.src = svgUrl;
    });
  })).then(() => {
    zip.generateAsync({ type: "blob" }).then(zipFile => {
      const zipName = `MobileFines_ExportAll_${Date.now()}.zip`;
      saveAs(zipFile, zipName);
    });
  });
});