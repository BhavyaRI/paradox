import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const expenseCategories = ['Food', 'Transportation', 'Entertainment', 'Bills', 'Other'];
const investmentTypes = ['Stocks', 'Bonds', 'Real Estate', 'Crypto', 'Other'];

function App() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses');

  // Expense state
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Food');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Income state
  const [incomeSource, setIncomeSource] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split('T')[0]);

  // Investment state
  const [investmentName, setInvestmentName] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investmentType, setInvestmentType] = useState('Stocks');
  const [investmentDate, setInvestmentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [expensesRes, incomesRes, investmentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/expenses'),
        axios.get('http://localhost:5000/api/incomes'),
        axios.get('http://localhost:5000/api/investments')
      ]);
      setExpenses(expensesRes.data);
      setIncomes(incomesRes.data);
      setInvestments(investmentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/expenses', {
        description: expenseDesc,
        amount: parseFloat(expenseAmount),
        category: expenseCategory,
        date: new Date(expenseDate)
      });
      setExpenseDesc('');
      setExpenseAmount('');
      setExpenseCategory('Food');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      fetchAll();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/incomes', {
        source: incomeSource,
        amount: parseFloat(incomeAmount),
        date: new Date(incomeDate)
      });
      setIncomeSource('');
      setIncomeAmount('');
      setIncomeDate(new Date().toISOString().split('T')[0]);
      fetchAll();
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };

  const handleInvestmentSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/investments', {
        name: investmentName,
        amount: parseFloat(investmentAmount),
        type: investmentType,
        date: new Date(investmentDate)
      });
      setInvestmentName('');
      setInvestmentAmount('');
      setInvestmentType('Stocks');
      setInvestmentDate(new Date().toISOString().split('T')[0]);
      fetchAll();
    } catch (error) {
      console.error('Error adding investment:', error);
    }
  };

  const handleDelete = async (id, type) => {
    try {
      await axios.delete(`http://localhost:5000/api/${type}/${id}`);
      fetchAll();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalInvestments = investments.reduce((sum, investment) => sum + investment.amount, 0);
  const netWorth = totalIncome - totalExpenses;
  
  const chartData = {
    labels: Array.from(new Set([
      ...expenses.map(e => e.date),
      ...incomes.map(i => i.date),
      ...investments.map(inv => inv.date)
    ]))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => new Date(date).toLocaleDateString('en-GB')), 
    datasets: [
      {
        label: 'Expenses',
        data: expenses.reduce((acc, expense) => {
          const date = new Date(expense.date).toLocaleDateString('en-GB');
          const existingIndex = acc.findIndex(item => item.x === date);
          if (existingIndex >= 0) {
            acc[existingIndex].y -= expense.amount;
          } else {
            acc.push({ x: date, y: expense.amount });
          }
          return acc;
        }, []).sort((a, b) => new Date(a.x) - new Date(b.x)),
        borderColor: 'rgb(239, 68, 68)',
        tension: 0.1
      },
      {
        label: 'Income',
        data: incomes.reduce((acc, income) => {
          const date = new Date(income.date).toLocaleDateString('en-GB');
          const existingIndex = acc.findIndex(item => item.x === date);
          if (existingIndex >= 0) {
            acc[existingIndex].y += income.amount;
          } else {
            acc.push({ x: date, y: income.amount });
          }
          return acc;
        }, []).sort((a, b) => new Date(a.x) - new Date(b.x)),
        borderColor: 'rgb(34, 197, 94)',
        tension: 0.1
      },
      {
        label: 'Investments',
        data: investments.reduce((acc, investment) => {
          const date = new Date(investment.date).toLocaleDateString('en-GB');
          const existingIndex = acc.findIndex(item => item.x === date);
          if (existingIndex >= 0) {
            acc[existingIndex].y -= investment.amount;
          } else {
            acc.push({ x: date, y: investment.amount });
          }
          return acc;
        }, []).sort((a, b) => new Date(a.x) - new Date(b.x)),
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Financial Tracker</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Income</h2>
            <p className="text-3xl font-bold text-green-600">+₹{totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Expenses</h2>
            <p className="text-3xl font-bold text-red-600">-₹{totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Investments</h2>
            <p className="text-3xl font-bold text-blue-600">₹{totalInvestments.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Net Worth</h2>
            <p className={`text-3xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{netWorth.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Financial Overview</h2>
          <Line data={chartData} />
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-8">
          <button
            className={`px-4 py-2 ${activeTab === 'expenses' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('expenses')}
          >
            Expenses
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'income' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('income')}
          >
            Income
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'investments' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('investments')}
          >
            Investments
          </button>
        </div>

        {/* Forms */}
        {activeTab === 'expenses' && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Expense</h2>
            <form onSubmit={handleExpenseSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="text"
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                placeholder="Description"
                className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                required
              />
              <input
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="Amount"
                className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                required
              />
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
              >
                {expenseCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                required
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition-colors"
              >
                <PlusCircle size={20} />
                Add Expense
              </button>
            </form>
          </div>
        )}

        {activeTab === 'income' && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Income</h2>
            <form onSubmit={handleIncomeSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                value={incomeSource}
                onChange={(e) => setIncomeSource(e.target.value)}
                placeholder="Source"
                className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                required
              />
              <input
                type="number"
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(e.target.value)}
                placeholder="Amount"
                className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                required
              />
              <input
                type="date"
                value={incomeDate}
                onChange={(e) => setIncomeDate(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                required
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition-colors"
              >
                <DollarSign size={20} />
                Add Income
              </button>
            </form>
          </div>
        )}

        {activeTab === 'investments' && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Investment</h2>
            <form onSubmit={handleInvestmentSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="text"
                value={investmentName}
                onChange={(e) => setInvestmentName(e.target.value)}
                placeholder="Investment Name"
                className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                required
              />
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder="Amount"
                className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                required
              />
              <select
                value={investmentType}
                onChange={(e) => setInvestmentType(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
              >
                {investmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="date"
                value={investmentDate}
                onChange={(e) => setInvestmentDate(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                required
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition-colors"
              >
                <TrendingUp size={20} />
                Add Investment
              </button>
            </form>
          </div>
        )}

        {/* Lists */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-700 p-6 border-b">
            {activeTab === 'expenses' ? 'Recent Expenses' :
             activeTab === 'income' ? 'Recent Income' :
             'Recent Investments'}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'expenses' ? 'Description' :
                     activeTab === 'income' ? 'Source' :
                     'Name'}
                  </th>
                  {(activeTab === 'expenses' || activeTab === 'investments') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'expenses' ? 'Category' : 'Type'}
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeTab === 'expenses' && expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-₹{expense.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(expense._id, 'expenses')}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
                {activeTab === 'income' && incomes.map((income) => (
                  <tr key={income._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(income.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{income.source}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">+₹{income.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(income._id, 'incomes')}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
                {activeTab === 'investments' && investments.map((investment) => (
                  <tr key={investment._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(investment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{investment.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{investment.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{investment.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(investment._id, 'investments')}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
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

export default App;