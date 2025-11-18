"use client";
import { useState } from 'react';
import { Zap, Home, Layers, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function CalculatorPage() {
    const [units, setUnits] = useState(1000);
    const [result, setResult] = useState(null);

    const handleCalculate = (e) => {
        e.preventDefault();
        const monthlyConsumption = Number(units);
        if (isNaN(monthlyConsumption) || monthlyConsumption <= 0) {
            setResult({ error: "Please enter a valid number of units." });
            return;
        }

        const dailyConsumption = monthlyConsumption / 30;
        const peakSunHours = 5.5; // Average for a sunny location like Karachi
        const systemEfficiency = 0.80; // 80% efficiency

        const requiredSize = dailyConsumption / (peakSunHours * systemEfficiency);
        const roofSpace = requiredSize * 100; // Approx. 100 sq ft per kW

        setResult({
            dailyConsumption: dailyConsumption.toFixed(2),
            requiredSize: requiredSize.toFixed(2),
            roofSpace: roofSpace.toFixed(0),
            inverterSize: Math.ceil(requiredSize)
        });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-slate-800">Solar System Estimator</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calculator Form */}
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4 text-slate-700">Calculate Your Needs</h3>
                    <form onSubmit={handleCalculate} className="space-y-4">
                        <div>
                            <label htmlFor="units" className="block text-sm font-medium text-gray-700">
                                Your Monthly Electricity Consumption (in Units/kWh)
                            </label>
                            <input 
                                type="number" 
                                id="units"
                                value={units}
                                onChange={(e) => setUnits(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="e.g., 1000"
                            />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 font-semibold">
                            Estimate System Size
                        </button>
                    </form>
                </div>

                {/* Results Display */}
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4 text-slate-700">Estimated Results</h3>
                    {result ? (
                        result.error ? <p className="text-red-500">{result.error}</p> : (
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <Zap className="h-6 w-6 text-amber-500 mr-4 mt-1"/>
                                    <div>
                                        <p className="font-bold text-2xl text-indigo-600">{result.requiredSize} kW</p>
                                        <p className="text-sm text-slate-500">Required Solar System Size</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Home className="h-6 w-6 text-amber-500 mr-4 mt-1"/>
                                    <div>
                                        <p className="font-bold text-lg text-slate-700">~{result.roofSpace} sq. ft.</p>
                                        <p className="text-sm text-slate-500">Approx. Roof Space Needed</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Layers className="h-6 w-6 text-amber-500 mr-4 mt-1"/>
                                    <div>
                                        <p className="font-bold text-lg text-slate-700">{result.inverterSize} kW</p>
                                        <p className="text-sm text-slate-500">Recommended Inverter Size</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 pt-4 border-t mt-4">
                                    *This is an estimate based on average conditions (5.5 sun hours, 80% efficiency). For an accurate quote, please consult with our experts.
                                </p>

                                {/* --- UPDATED STAKEHOLDER LINKS SECTION --- */}
                                <div className="pt-4 border-t mt-4">
                                    <h4 className="font-semibold text-slate-700 mb-2">Our Trusted Partners</h4>
                                    <div className="space-y-2">
                                        <Link href="https://kitsolaire-discount.com/gb/3-solar-panel" target="_blank" className="flex items-center text-indigo-600 hover:underline">
                                            Visit Kit Solaire Discount <ExternalLink className="ml-2 h-4 w-4" />
                                        </Link>
                                        <Link href="https://solar.osakalighting.com/lahore-landing-page" target="_blank" className="flex items-center text-indigo-600 hover:underline">
                                            Search on solar.osakalighting <ExternalLink className="ml-2 h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>

                            </div>
                        )
                    ) : (
                        <p className="text-slate-500">Enter your monthly units and click calculate to see your estimate.</p>
                    )}
                </div>
            </div>
        </div>
    );
}