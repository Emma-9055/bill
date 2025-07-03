import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function toMarkdownTable(data: any[]): string {
  if (!Array.isArray(data) || data.length === 0) return '无数据';
  const keys = Object.keys(data[0]);
  const header = '| ' + keys.join(' | ') + ' |';
  const sep = '| ' + keys.map(() => '---').join(' | ') + ' |';
  const rows = data.map(row => '| ' + keys.map(k => String(row[k] ?? '')).join(' | ') + ' |');
  return [header, sep, ...rows].join('\n');
}

export async function POST(req: NextRequest) {
  const { sql } = await req.json();
  if (!sql || typeof sql !== 'string') {
    return NextResponse.json({ error: 'sql is required.' }, { status: 400 });
  }
  if (!/^\s*select\s+/i.test(sql)) {
    return NextResponse.json({ error: 'Only SELECT queries are allowed.' }, { status: 400 });
  }
  const resp = await fetch(`${supabaseUrl}/rest/v1/rpc/query_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ sql }),
  });
  const data = await resp.json();
  if (!resp.ok) {
    return NextResponse.json({ error: data.message || 'Query failed.' }, { status: 500 });
  }
  const markdown = toMarkdownTable(data);
  const desc = '查询结果已转为 markdown 表格，便于阅读和展示。';
  return NextResponse.json({ raw: data, markdown, type: 'markdown', desc });
} 