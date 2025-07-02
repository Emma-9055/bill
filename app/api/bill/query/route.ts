import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

console.log('Vercel env NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Vercel env NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 支持 POST 查询
export async function POST(req: NextRequest) {
  const { month, transactionType, transactionDate } = await req.json();

  if (!month || !transactionType || !transactionDate) {
    return NextResponse.json({ error: 'month, transactionType, transactionDate are required.' }, { status: 400 });
  }

  // 只查 SAR
  const currency = 'SAR';

  // 计算月份范围
  const year = new Date(transactionDate).getFullYear();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0); // 月底
  const endDateStr = endDate.toISOString().slice(0, 10);

  // 查询 supabase
  const { data, error } = await supabase
    .from('bill')
    .select('*')
    .gte('Transaction Date', startDate)
    .lte('Transaction Date', endDateStr)
    .eq('Transaction Type', transactionType)
    .eq('Currency', currency);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
} 