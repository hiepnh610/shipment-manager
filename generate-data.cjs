const fs = require("fs");

const statusList = ["OPEN", "IN_TRANSIT", "DELIVERED"];
const clients = ["Sony", "Samsung", "DHL", "CargoTrans", "ShipCo", "Logix", "Oceanic"];
const warehouses = ["EWR", "LAX", "JFK", "SFO", "SEA"];
const baseDate = new Date();
const minLat = 32.55;
const maxLat = 33.05;
const minLng = -97.4;
const maxLng = -96.5;

const assignments = [];
for (let i = 1; i <= 10; i++) {
  assignments.push({
    id: `as_${String(i).padStart(3, "0")}`,
    label: `TX-${String(i).padStart(3, "0")}`,
    status: statusList[i % statusList.length],
    clients: [],
    shipment_count: 0,
  });
}

const shipments = [];
for (let i = 1; i <= 100; i++) {
  const arrival = new Date(baseDate);
  arrival.setDate(arrival.getDate() - Math.floor(Math.random() * 10));
  const eta = new Date(arrival);
  eta.setHours(eta.getHours() + Math.floor(Math.random() * 48));

  const status = statusList[i % statusList.length];
  const clientName = clients[i % clients.length];

  const shipment = {
    id: `shp_${String(i).padStart(3, "0")}`,
    client_name: clientName,
    label: `${warehouses[i % warehouses.length]}-581-2505${20 + (i % 10)}-${i}`,
    status,
    arrival_date: arrival.toISOString(),
    delivery_by_date: new Date(arrival.getTime() + 2 * 86400000).toISOString(),
    eta: eta.toISOString(),
    warehouse_id: "581",
    lat: Math.random() * (maxLat - minLat) + minLat,
    lng: Math.random() * (maxLng - minLng) + minLng,
  };

  if (status !== "OPEN") {
    const assignmentIndex = i % assignments.length;
    shipment.assignment_id = assignments[assignmentIndex].id;
    assignments[assignmentIndex].shipment_count++;
    if (!assignments[assignmentIndex].clients.includes(clientName)) {
      assignments[assignmentIndex].clients.push(clientName);
    }
  }

  shipments.push(shipment);
}

const statuses = statusList.map((s) => ({ id: s }));

fs.writeFileSync(
  "db.json",
  JSON.stringify({ statuses, shipments, assignments }, null, 2)
);
console.log(
  `Generated ${shipments.length} shipments, ${assignments.length} assignments`
);
