"use client";
import { useEffect, useState } from "react";

type Ban = {
  id: string;
  type: string;
  value: string;
  reason?: string;
  expiresAt?: string;
  createdAt: string;
};

export default function BansPage() {
  const [bans, setBans] = useState<Ban[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBans = () => {
    fetch("/api/admin/ban?businessId=demo") // hardcoded for demo
      .then((r) => r.json())
      .then((data) => {
        setBans(data.bans || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadBans();
  }, []);

  const handleUnban = async (banId: string) => {
    if (!confirm("Remove this ban?")) return;

    await fetch("/api/admin/ban", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ banId }),
    });

    alert("✅ Ban removed");
    loadBans();
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const activeBans = bans.filter((b) => !isExpired(b.expiresAt));
  const expiredBans = bans.filter((b) => isExpired(b.expiresAt));

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">🚫 Active Bans</h1>
          <div className="text-sm text-gray-500">
            {activeBans.length} active • {expiredBans.length} expired
          </div>
        </div>

        {/* Active Bans */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Active Bans</h2>
          {activeBans.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-8">No active bans</div>
          )}
          <div className="space-y-2">
            {activeBans.map((ban) => (
              <div
                key={ban.id}
                className="flex items-center justify-between p-4 border rounded hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                      {ban.type}
                    </span>
                    <span className="font-mono text-sm font-semibold">{ban.value}</span>
                  </div>
                  {ban.reason && (
                    <div className="text-sm text-gray-600 mb-1">{ban.reason}</div>
                  )}
                  <div className="text-xs text-gray-500">
                    Created: {new Date(ban.createdAt).toLocaleString()}
                    {ban.expiresAt && (
                      <span className="ml-4">
                        Expires: {new Date(ban.expiresAt).toLocaleString()}
                      </span>
                    )}
                    {!ban.expiresAt && <span className="ml-4 text-red-600">Permanent</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleUnban(ban.id)}
                  className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  Unban
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Expired Bans */}
        {expiredBans.length > 0 && (
          <div className="bg-white rounded-lg border p-4 opacity-60">
            <h2 className="text-lg font-semibold mb-4">Expired Bans</h2>
            <div className="space-y-2">
              {expiredBans.map((ban) => (
                <div
                  key={ban.id}
                  className="flex items-center justify-between p-4 border rounded"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                        {ban.type}
                      </span>
                      <span className="font-mono text-sm">{ban.value}</span>
                      <span className="text-xs text-gray-500">(expired)</span>
                    </div>
                    {ban.reason && (
                      <div className="text-sm text-gray-600">{ban.reason}</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleUnban(ban.id)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

