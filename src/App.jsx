import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, DollarSign, TrendingUp, LogIn, UserPlus, Calendar } from 'lucide-react';
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
const timeFilters = ['All Time', 'This Week', 'This Month', '6 Months', 'This Year', 'Custom Range'];

function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [authError, setAuthError] = useState('');
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses');
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

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

  // Filter data based on selected time period
  const filterDataByTime = (data) => {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfSixMonths = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return data.filter(item => {
      const itemDate = new Date(item.date);
      switch (timeFilter) {
        case 'This Week':
          return itemDate >= startOfWeek;
        case 'This Month':
          return itemDate >= startOfMonth;
        case '6 Months':
          return itemDate >= startOfSixMonths;
        case 'This Year':
          return itemDate >= startOfYear;
        case 'Custom Range':
          const start = customStartDate ? new Date(customStartDate) : new Date(0);
          const end = customEndDate ? new Date(customEndDate) : new Date();
          return itemDate >= start && itemDate <= end;
        default:
          return true;
      }
    });
  };

  // Get filtered data
  const filteredExpenses = filterDataByTime(expenses);
  const filteredIncomes = filterDataByTime(incomes);
  const filteredInvestments = filterDataByTime(investments);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchAll();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password
      });
      
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      setAuthError('');
      fetchAll();
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        username,
        email,
        password
      });
      
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      setAuthError('');
      fetchAll();
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setExpenses([]);
    setIncomes([]);
    setInvestments([]);
  };

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchAll = async () => {
    try {
      const [expensesRes, incomesRes, investmentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/expenses', getAuthHeaders()),
        axios.get('http://localhost:5000/api/incomes', getAuthHeaders()),
        axios.get('http://localhost:5000/api/investments', getAuthHeaders())
      ]);
      setExpenses(expensesRes.data);
      setIncomes(incomesRes.data);
      setInvestments(investmentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/expenses', {
        description: expenseDesc,
        amount: parseFloat(expenseAmount),
        category: expenseCategory,
        date: expenseDate
      }, getAuthHeaders());
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
        date: incomeDate
      }, getAuthHeaders());
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
        date: investmentDate
      }, getAuthHeaders());
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
      await axios.delete(`http://localhost:5000/api/${type}/${id}`, getAuthHeaders());
      fetchAll();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLoginView ? 'Sign in to your account' : 'Create a new account'}
            </h2>
            <p className="text-sm text-gray-600">
              {isLoginView ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLoginView(!isLoginView);
                  setAuthError('');
                }}
                className="text-emerald-600 hover:text-emerald-500 font-medium"
              >
                {isLoginView ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{authError}</span>
            </div>
          )}

          <form onSubmit={isLoginView ? handleLogin : handleRegister} className="space-y-6">
            {!isLoginView && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                  required
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              {isLoginView ? (
                <>
                  <LogIn size={20} />
                  Sign in
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Sign up
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
  const totalInvestments = filteredInvestments.reduce((sum, investment) => sum + investment.amount, 0);
  const netWorth = totalIncome - totalExpenses - totalInvestments;

  // Updated chart data logic to handle dates properly
  const chartData = {
    labels: [...filteredExpenses, ...filteredIncomes, ...filteredInvestments]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Expenses',
        data: filteredExpenses.map(expense => ({
          x: new Date(expense.date).toLocaleDateString(),
          y: -expense.amount
        })),
        borderColor: 'rgb(239, 68, 68)',
        tension: 0.1
      },
      {
        label: 'Income',
        data: filteredIncomes.map(income => ({
          x: new Date(income.date).toLocaleDateString(),
          y: income.amount
        })),
        borderColor: 'rgb(34, 197, 94)',
        tension: 0.1
      },
      {
        label: 'Investments',
        data: filteredInvestments.map(investment => ({
          x: new Date(investment.date).toLocaleDateString(),
          y: -investment.amount
        })),
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Financial Tracker</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.username}!</span>
            <button
              onClick={handleLogout}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Time Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Calendar size={20} className="text-gray-500" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
              >
                {timeFilters.map(filter => (
                  <option key={filter} value={filter}>{filter}</option>
                ))}
              </select>
            </div>
            
            {timeFilter === 'Custom Range' && (
              <div className="flex items-center gap-4 pl-8">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">From:</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">To:</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
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
                {activeTab === 'expenses' && filteredExpenses.map((expense) => (
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
                {activeTab === 'income' && filteredIncomes.map((income) => (
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
                {activeTab === 'investments' && filteredInvestments.map((investment) => (
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
