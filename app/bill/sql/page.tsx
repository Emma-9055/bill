"use client";
import { useState } from "react";

export default function BillSqlPage() {
  const [sql, setSql] = useState('select * from bill limit 10');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/bill/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.result);
      } else {
        setError(data.error || '查询失败');
      }
    } catch (err: any) {
      setError(err.message || '网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2>SQL 账单查询</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <textarea
          value={sql}
          onChange={e => setSql(e.target.value)}
          rows={4}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: 16, marginBottom: 12 }}
        />
        <br />
        <button type="submit" disabled={loading}>执行查询</button>
      </form>
      {loading && <div>查询中...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {result && Array.isArray(result) && (
        <div style={{ overflowX: 'auto' }}>
          <table border={1} cellPadding={6} style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {Object.keys(result[0] || {}).map(key => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.map((row: any, idx: number) => (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i}>{String(val)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {result && Array.isArray(result) && result.length === 0 && <div>无数据</div>}
    </div>
  );
} 