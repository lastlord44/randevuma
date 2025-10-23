"use client";
import { useEffect, useState } from "react";

type RiskLog = {
  id: string;
  type: string;
  ip?: string;
  phone?: string;
  deviceId?: string;
  createdAt: string;
};

export default function RiskPage() {
  const [logs, setLogs] = useState<RiskLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/risk?businessId=demo") // hardcoded for demo
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs || []);
        setStats(data.stats);
        setLoading(false);
      });
  }, []);

  const handleBan = async (type: "ip" | "phone" | "device", value: string) => {
    if (!confirm(`Ban ${type}: ${value}?`)) return;

    await fetch("/api/admin/ban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId: "demo",
        type,
        value,
        reason: "Manual ban from risk dashboard",
        durationMinutes: 1440, // 24 hours
      }),
    });

    alert(`✅ ${type} banned: ${value}`);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">🛡️ Risk Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-500">Total Events (24h)</div>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-500">Top Phones</div>
            <div className="text-2xl font-bold">{stats?.topPhones?.length || 0}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-500">Top IPs</div>
            <div className="text-2xl font-bold">{stats?.topIPs?.length || 0}</div>
          </div>
        </div>

        {/* Top Offenders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Phones */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">📱 Top Phones</h2>
            <div className="space-y-2">
              {stats?.topPhones?.map(([phone, count]: [string, number]) => (
                <div key={phone} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div>
                    <div className="font-mono text-sm">{phone}</div>
                    <div className="text-xs text-gray-500">{count} events</div>
                  </div>
                  <button
                    onClick={() => handleBan("phone", phone)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Ban
                  </button>
                </div>
              ))}
              {stats?.topPhones?.length === 0 && (
                <div className="text-sm text-gray-500">No suspicious phones</div>
              )}
            </div>
          </div>

          {/* Top IPs */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">🌐 Top IPs</h2>
            <div className="space-y-2">
              {stats?.topIPs?.map(([ip, count]: [string, number]) => (
                <div key={ip} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div>
                    <div className="font-mono text-sm">{ip}</div>
                    <div className="text-xs text-gray-500">{count} events</div>
                  </div>
                  <button
                    onClick={() => handleBan("ip", ip)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Ban
                  </button>
                </div>
              ))}
              {stats?.topIPs?.length === 0 && (
                <div className="text-sm text-gray-500">No suspicious IPs</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">📋 Recent Events</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-2">Time</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Phone</th>
                  <th className="p-2">IP</th>
                  <th className="p-2">Device</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 50).map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-xs">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="p-2">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{log.type}</span>
                    </td>
                    <td className="p-2 font-mono text-xs">{log.phone || "-"}</td>
                    <td className="p-2 font-mono text-xs">{log.ip || "-"}</td>
                    <td className="p-2 font-mono text-xs">{log.deviceId?.slice(0, 8) || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

