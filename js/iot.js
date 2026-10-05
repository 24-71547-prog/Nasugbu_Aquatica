// Simulated IoT sensors. Replace this source with MQTT/WebSocket/REST API
// feeds from ESP32/Arduino devices when backend integration is ready.
const iotSensors = {
  ph: { label: "Water pH", value: 7.2, unit: "", min: 6.8, max: 7.8, drift: 0.08 },
  waterTemp: { label: "Water Temperature", value: 27.5, unit: "°C", min: 26.0, max: 29.0, drift: 0.2 },
  oxygen: { label: "Dissolved Oxygen", value: 6.8, unit: "mg/L", min: 6.0, max: 8.5, drift: 0.2 },
  turbidity: { label: "Water Turbidity", value: 3.2, unit: "NTU", min: 2.0, max: 5.0, drift: 0.2 },
  waterLevel: { label: "Water Level", value: 82, unit: "%", min: 70, max: 95, drift: 1.6 },
  ambientTemp: { label: "Ambient Temperature", value: 29, unit: "°C", min: 25, max: 32, drift: 0.2 },
  humidity: { label: "Humidity", value: 74, unit: "%", min: 60, max: 85, drift: 1.3 }
};

// Evaluates a sensor reading and returns its health status.
function sensorStatus(sensor) {
  const warnLow = sensor.min + (sensor.max - sensor.min) * 0.15;
  const warnHigh = sensor.max - (sensor.max - sensor.min) * 0.15;
  if (sensor.value < sensor.min || sensor.value > sensor.max) return "Critical";
  if (sensor.value < warnLow || sensor.value > warnHigh) return "Warning";
  return "Normal";
}

// Maps a sensor status string to its badge CSS class.
function statusClass(status) {
  if (status === "Critical") return "status-critical";
  if (status === "Warning") return "status-warning";
  return "status-normal";
}

// Updates a single sensor card with latest value, status, and progress.
function updateSensorCard(id, sensor) {
  const status = sensorStatus(sensor);
  const root = document.querySelector(`[data-sensor='${id}']`);
  if (!root) return;

  const valueEl = root.querySelector(".sensor-reading");
  const statusEl = root.querySelector(".sensor-status");
  const bar = root.querySelector(".progress-bar");
  const last = root.querySelector(".sensor-updated");

  if (valueEl) valueEl.textContent = `${sensor.value.toFixed(sensor.unit === "%" ? 0 : 1)} ${sensor.unit}`.trim();
  if (statusEl) statusEl.innerHTML = `<span class='badge badge-soft ${statusClass(status)}'>${status}</span>`;
  if (bar) {
    const pct = ((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100;
    bar.style.width = `${Math.max(5, Math.min(100, pct))}%`;
    bar.classList.remove("bg-success", "bg-warning", "bg-danger");
    bar.classList.add(status === "Normal" ? "bg-success" : status === "Warning" ? "bg-warning" : "bg-danger");
  }
  if (last) last.textContent = "Just now";
}

// Applies a small randomized drift to simulate real-time sensor movement.
function randomStep(sensor) {
  const delta = (Math.random() * 2 - 1) * sensor.drift;
  sensor.value = Number((sensor.value + delta).toFixed(2));
}

// Builds the IoT alert table from current simulated sensor conditions.
function generateIotAlerts() {
  const list = document.getElementById("iotAlertList");
  if (!list) return;

  const now = new Date().toLocaleTimeString();
  const alerts = Object.entries(iotSensors)
    .map(([key, sensor]) => ({ key, sensor, status: sensorStatus(sensor) }))
    .filter((x) => x.status !== "Normal")
    .slice(0, 4);

  if (alerts.length === 0) {
    list.innerHTML = `<tr><td>${now}</td><td>Water pH</td><td>7.2</td><td><span class='badge status-normal'>Normal</span></td><td>pH level returned to normal.</td></tr>`;
    return;
  }

  list.innerHTML = alerts
    .map((a) => {
      const msg = a.status === "Critical"
        ? `${a.sensor.label} is outside safe level.`
        : `${a.sensor.label} is near preferred range limit.`;
      return `<tr>
        <td>${now}</td>
        <td>${a.sensor.label}</td>
        <td>${a.sensor.value.toFixed(1)} ${a.sensor.unit}</td>
        <td><span class="badge badge-soft ${statusClass(a.status)}">${a.status}</span></td>
        <td>${msg}</td>
      </tr>`;
    })
    .join("");
}

// Updates "last updated" labels shown on the IoT dashboard.
function updateIotMeta() {
  const updated = new Date().toLocaleTimeString();
  document.querySelectorAll(".iot-last-updated").forEach((el) => (el.textContent = `Last updated: ${updated}`));
}

// Runs one simulation cycle and refreshes all related UI sections.
function tickIotData() {
  Object.values(iotSensors).forEach((sensor) => randomStep(sensor));
  Object.entries(iotSensors).forEach(([id, sensor]) => updateSensorCard(id, sensor));
  generateIotAlerts();
  updateIotMeta();
}

// Initializes historical IoT trend charts when Chart.js is available.
function initIotHistoryCharts() {
  if (typeof Chart === "undefined") return;
  const ctx = document.getElementById("iotHistoryChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["08:00", "08:05", "08:10", "08:15", "08:20", "08:25", "08:30"],
      datasets: [
        { label: "pH", data: [7.1, 7.2, 7.3, 7.2, 7.2, 7.3, 7.2], borderColor: "#0891b2", tension: 0.3 },
        { label: "Water Temp °C", data: [27.4, 27.6, 27.5, 27.7, 27.6, 27.5, 27.6], borderColor: "#f97316", tension: 0.3 },
        { label: "Dissolved Oxygen", data: [6.8, 6.7, 6.9, 6.8, 6.7, 6.8, 6.8], borderColor: "#16a34a", tension: 0.3 },
        { label: "Water Level %", data: [83, 82, 82, 81, 82, 82, 81], borderColor: "#a855f7", tension: 0.3 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// Starts IoT simulation and chart rendering once the DOM is ready.
document.addEventListener("DOMContentLoaded", () => {
  if (!document.querySelector("[data-sensor]")) return;
  tickIotData();
  // Simulated sensor updates every 3 seconds to mimic real-time feed.
  setInterval(tickIotData, 3000);
  initIotHistoryCharts();
});
