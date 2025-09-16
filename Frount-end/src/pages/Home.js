import React from "react";
import Chart from "react-apexcharts";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function Home() {
  // Apex Bar Chart (Monthly Sales Example)
  const barChart = {
    options: {
      chart: {
        id: "monthly-sales",
        toolbar: { show: false },
      },
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      },
    },
    series: [
      {
        name: "Sales",
        data: [10, 20, 40, 50, 60, 20, 10, 35, 45, 70, 25, 70],
      },
    ],
  };

  // Doughnut Chart (Product Categories Example)
  const doughnutData = {
    labels: ["Electronics", "Clothing", "Groceries", "Furniture", "Books"],
    datasets: [
      {
        data: [12, 19, 7, 15, 10],
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 99, 132, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">📊 Inventory Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-gray-500 text-sm">Total Sales</h2>
          <p className="text-2xl font-semibold text-gray-900">$12,450</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-gray-500 text-sm">Total Purchases</h2>
          <p className="text-2xl font-semibold text-gray-900">$9,320</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-gray-500 text-sm">Total Products</h2>
          <p className="text-2xl font-semibold text-gray-900">245</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-gray-500 text-sm">Total Stores</h2>
          <p className="text-2xl font-semibold text-gray-900">18</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Sales</h2>
          <Chart options={barChart.options} series={barChart.series} type="bar" height={300} />
        </div>
        <div className="bg-white shadow rounded-xl p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Product Categories</h2>
          <Doughnut data={doughnutData} />
        </div>
      </div>
    </div>
  );
}

export default Home;
