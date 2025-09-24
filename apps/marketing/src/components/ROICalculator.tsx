import { useState } from 'react';
import { Card } from './ui/card';

interface CalculationResults {
  annualVisits: number;
  travelCostLow: number;
  travelCostHigh: number;
  travelSavingsLow: number;
  travelSavingsHigh: number;
  softwareCost: number;
  netSavingsLow: number;
  netSavingsHigh: number;
}

export default function ROICalculator() {
  const [stores, setStores] = useState(100);
  const [visitsPerYear, setVisitsPerYear] = useState(4);
  const [costPerVisitMin, setCostPerVisitMin] = useState(500);
  const [costPerVisitMax, setCostPerVisitMax] = useState(1000);
  const [travelReductionPct, setTravelReductionPct] = useState(60);
  const [pricePerStore, setPricePerStore] = useState(65);

  const calculateROI = (): CalculationResults => {
    const annualVisits = stores * visitsPerYear;
    const travelCostLow = annualVisits * costPerVisitMin;
    const travelCostHigh = annualVisits * costPerVisitMax;
    const travelSavingsLow = travelCostLow * (travelReductionPct / 100);
    const travelSavingsHigh = travelCostHigh * (travelReductionPct / 100);
    const softwareCost = stores * pricePerStore * 12;
    const netSavingsLow = travelSavingsLow - softwareCost;
    const netSavingsHigh = travelSavingsHigh - softwareCost;

    return {
      annualVisits,
      travelCostLow,
      travelCostHigh,
      travelSavingsLow,
      travelSavingsHigh,
      softwareCost,
      netSavingsLow,
      netSavingsHigh,
    };
  };

  const results = calculateROI();
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">ROI Calculator</h2>
        <p className="text-lg text-gray-600">
          Calculate your potential savings with AI video inspections
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Your Business</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Stores
              </label>
              <input
                type="number"
                value={stores}
                onChange={(e) => setStores(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="10000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Visits per Store per Year
              </label>
              <input
                type="number"
                value={visitsPerYear}
                onChange={(e) => setVisitsPerYear(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="52"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost per Site Visit (Low Estimate)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  value={costPerVisitMin}
                  onChange={(e) => setCostPerVisitMin(parseInt(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="5000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost per Site Visit (High Estimate)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  value={costPerVisitMax}
                  onChange={(e) => setCostPerVisitMax(parseInt(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="5000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Travel Reduction: {travelReductionPct}%
              </label>
              <input
                type="range"
                value={travelReductionPct}
                onChange={(e) => setTravelReductionPct(parseInt(e.target.value))}
                className="w-full"
                min="30"
                max="80"
                step="5"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>30%</span>
                <span>80%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VerityInspect Price per Store per Month
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  value={pricePerStore}
                  onChange={(e) => setPricePerStore(parseInt(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="200"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Results */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Annual Savings Projection</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Annual site visits</span>
              <span className="font-medium">{results.annualVisits.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Current travel costs</span>
              <span className="font-medium">
                {formatCurrency(results.travelCostLow)} - {formatCurrency(results.travelCostHigh)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Travel savings ({travelReductionPct}% reduction)</span>
              <span className="font-medium text-green-600">
                {formatCurrency(results.travelSavingsLow)} - {formatCurrency(results.travelSavingsHigh)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">VerityInspect annual cost</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(results.softwareCost)}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-t-2 bg-gray-50 px-4 rounded">
              <span className="text-lg font-semibold">Net Annual Savings</span>
              <span className={`text-xl font-bold ${results.netSavingsLow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(results.netSavingsLow)} - {formatCurrency(results.netSavingsHigh)}
              </span>
            </div>

            {results.netSavingsLow > 0 && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Additional Benefits</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 3-5× increase in inspection coverage</li>
                  <li>• Consistent, objective evaluation criteria</li>
                  <li>• Faster issue identification and resolution</li>
                  <li>• Improved compliance and guest satisfaction</li>
                  <li>• Reduced inspector travel time and fatigue</li>
                </ul>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-4">
          * Calculations are estimates based on industry averages. Actual results may vary.
        </p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Get Started with VerityInspect
        </button>
      </div>
    </div>
  );
}