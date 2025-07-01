"use client";
import { useState } from "react";

const analysisOptions = [
  { value: "account", label: "Account Information & Balance" },
  { value: "transaction", label: "Transaction Analysis" },
  { value: "income_expense", label: "Income & Expense Analysis" },
  { value: "trend", label: "Financial Trend Analysis" },
  { value: "anomaly", label: "Anomaly Transaction Detection" },
  { value: "merchant", label: "Merchant Spending Analysis" },
  { value: "credit", label: "Credit Card Information" },
  { value: "advice", label: "Financial Planning Advice" },
];

export default function BillQueryPage() {
  const [analysisType, setAnalysisType] = useState<string>("");
  const [question, setQuestion] = useState("");
  // Transaction Analysis fields
  const [transactionDate, setTransactionDate] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<any>(null);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFields, setShowFields] = useState(false);

  // 简单规则：根据主题和问题自动设置必填项（可扩展为更智能的NLP）
  const handleQuestionAnalyze = () => {
    if (!analysisType) {
      setError("请先选择分析主题");
      return;
    }
    setError("");
    setShowFields(false);
    // 这里只实现 Transaction Analysis 的简单规则
    if (analysisType === "transaction") {
      // 例：9月我在咖啡上花了多少钱
      // 例：10月我的信用卡付了多少利息
      // 例：7月我存了多少钱
      // 解析月份
      const monthMatch = question.match(/([7-9]|1[0-2])月/);
      if (monthMatch) {
        const month = monthMatch[1];
        // 构造一个日期（如2023-08-01）
        setTransactionDate(`2023-${String(month).padStart(2, '0')}-01`);
      }
      // 解析类型
      if (question.includes("利息")) setTransactionType("利息");
      else if (question.includes("咖啡")) setTransactionType("cafe");
      else if (question.includes("消费")) setTransactionType("消费");
      else setTransactionType("");
      setShowFields(true);
    } else {
      setError("暂未实现该主题的自动提取，请手动填写");
      setShowFields(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setExplanation("");
    try {
      if (analysisType === "transaction") {
        // Transaction Analysis: 查询该类型当天的总金额和次数
        const res = await fetch("/api/bill/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            month: new Date(transactionDate).getMonth() + 1,
            transactionType,
            transactionDate,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setResult(data.data);
          // 计算总金额和次数
          const total = data.data.reduce((sum: number, row: any) => sum + Number(row["Amount"]), 0);
          setExplanation(`在${transactionDate}，类型为"${transactionType}"的交易共${data.data.length}笔，总金额为${total} SAR。`);
        } else {
          setError(data.error || "查询失败");
        }
      } else {
        setError("暂未实现该分析类型");
      }
    } catch (err: any) {
      setError(err.message || "网络错误");
    } finally {
      setLoading(false);
    }
  };

  // 动态渲染必填字段
  const renderFields = () => {
    if (analysisType === "transaction") {
      return (
        <>
          <div style={{ marginBottom: 12 }}>
            <label>Transaction Date：</label>
            <input type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} required style={{ marginLeft: 8 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Transaction Type：</label>
            <input type="text" value={transactionType} onChange={e => setTransactionType(e.target.value)} required style={{ marginLeft: 8 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Amount（可选）：</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ marginLeft: 8 }} />
          </div>
        </>
      );
    }
    // 其他类型可扩展
    return null;
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #eee" }}>
      <h2>账单智能分析</h2>
      <div style={{ marginBottom: 24 }}>
        <label>请选择分析主题：</label>
        <select value={analysisType} onChange={e => setAnalysisType(e.target.value)} style={{ marginLeft: 8 }}>
          <option value="">-- 请选择 --</option>
          {analysisOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {analysisType && (
        <div style={{ marginBottom: 24 }}>
          <label>请输入你的问题：</label>
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="如：9月我在咖啡上花了多少钱"
            style={{ marginLeft: 8, width: 320 }}
          />
          <button onClick={handleQuestionAnalyze} style={{ marginLeft: 8 }}>分析问题</button>
        </div>
      )}
      {showFields && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          {renderFields()}
          <button type="submit" disabled={loading}>分析</button>
        </form>
      )}
      {loading && <div>分析中...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {result && (
        <div>
          <h3>分析结果：</h3>
          {result.length === 0 ? <div>无数据</div> : (
            <table border={1} cellPadding={6} style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Transaction Date</th>
                  <th>Post Date</th>
                  <th>Transaction Type</th>
                  <th>Merchant Name</th>
                  <th>Merchant Location</th>
                  <th>Currency</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {result.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td>{row["Transaction Date"]}</td>
                    <td>{row["Post Date"]}</td>
                    <td>{row["Transaction Type"]}</td>
                    <td>{row["Merchant Name"]}</td>
                    <td>{row["Merchant Location"]}</td>
                    <td>{row["Currency"]}</td>
                    <td>{row["Amount"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {explanation && <div style={{ marginTop: 16, color: '#333' }}>{explanation}</div>}
        </div>
      )}
    </div>
  );
} 