import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rrkhfxtiigeiwxfdqivt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJya2hmeHRpaWdlaXd4ZmRxaXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MzMyNDgsImV4cCI6MjA2NjMwOTI0OH0.iN1yP6sI63Ee_Er9ho1vQ0xtgP5RkYJM79unsptuT28';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  const { sql } = await req.json();
  if (!sql || typeof sql !== 'string') {
    return NextResponse.json({ error: 'sql is required.' }, { status: 400 });
  }
  // 只允许 select 查询
  if (!/^\s*select\s+/i.test(sql)) {
    return NextResponse.json({ error: 'Only SELECT queries are allowed.' }, { status: 400 });
  }
  // Supabase 不直接支持任意 SQL，需用 rpc 或 http 请求 PostgREST SQL endpoint
  // 这里用官方 SQL API
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
  return NextResponse.json({ result: data });
} 