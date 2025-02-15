import React from 'react';
import { X, AlertTriangle, Server as ServerIcon, Loader2 } from 'lucide-react';
import { RdpApiClient } from '../api/client';
import { useAccountsStore } from '../store/accounts';
import type { Region, Plan, Distribution, StockInfo } from '../api/types';

interface ServerPurchaseModalProps {
  onClose: () => void;
}

export function ServerPurchaseModal({ onClose }: ServerPurchaseModalProps) {
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { activeAccount } = useAccountsStore();

  const [regions, setRegions] = React.useState<Region[]>([]);
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [distributions, setDistributions] = React.useState<Distribution[]>([]);
  const [stock, setStock] = React.useState<StockInfo[]>([]);

  const [selectedRegion, setSelectedRegion] = React.useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = React.useState<number | null>(null);
  const [selectedDistro, setSelectedDistro] = React.useState<number | null>(null);

  // Fetch initial data
  React.useEffect(() => {
    const fetchData = async () => {
      if (!activeAccount?.apiKey) return;

      setIsLoading(true);
      setError(null);

      try {
        const client = new RdpApiClient(activeAccount.apiKey);
        const [regionsData, plansData, distrosData, stockData] = await Promise.all([
          client.getRegions(),
          client.getPlans(),
          client.getDistros(),
          client.getStock(),
        ]);

        setRegions(regionsData);
        setPlans(plansData);
        setDistributions(distrosData);
        setStock(stockData);
      } catch (err) {
        console.error('Error fetching server data:', err);
        setError('Failed to load server configuration options');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeAccount]);

  const handlePurchase = async () => {
    if (!activeAccount?.apiKey || !selectedRegion || !selectedPlan || !selectedDistro) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = new RdpApiClient(activeAccount.apiKey);
      const response = await client.purchaseServer({
        region_id: selectedRegion,
        plan_id: selectedPlan,
        distro_id: selectedDistro,
      });

      if (response.success) {
        onClose();
        // You might want to refresh the server list or show a success message
      } else {
        setError('Failed to purchase server');
      }
    } catch (err) {
      console.error('Error purchasing server:', err);
      setError('Failed to purchase server');
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return selectedRegion !== null;
      case 2:
        return selectedPlan !== null;
      case 3:
        return selectedDistro !== null;
      default:
        return false;
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Select Region</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {regions.map((region) => {
                const stockInfo = stock.find(
                  (s) => s.region.id === region.id
                );
                const isAvailable = stockInfo?.stock.available;

                return (
                  <button
                    key={region.id}
                    onClick={() => setSelectedRegion(region.id)}
                    disabled={!isAvailable}
                    className={`p-4 rounded-lg border ${
                      selectedRegion === region.id
                        ? 'border-indigo-500 ring-2 ring-indigo-200'
                        : 'border-gray-200'
                    } ${
                      isAvailable
                        ? 'hover:border-indigo-500'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <h4 className="font-medium text-gray-900">
                      {region.location}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {region.region}
                    </p>
                    {!isAvailable && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                        Out of Stock
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Select Plan</h3>
            <div className="grid grid-cols-1 gap-4">
              {plans.map((plan) => {
                const stockInfo = stock.find(
                  (s) =>
                    s.region.id === selectedRegion &&
                    s.stock.plan.id === plan.id
                );
                const isAvailable = stockInfo?.stock.available;

                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    disabled={!isAvailable}
                    className={`p-4 rounded-lg border ${
                      selectedPlan === plan.id
                        ? 'border-indigo-500 ring-2 ring-indigo-200'
                        : 'border-gray-200'
                    } ${
                      isAvailable
                        ? 'hover:border-indigo-500'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {plan.title}
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm text-gray-500">
                          <li>• {plan.cores} CPU Cores</li>
                          <li>• {plan.memory} GB RAM</li>
                          <li>• {plan.storage} GB Storage</li>
                        </ul>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="text-gray-500">/mo</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Select Operating System
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {distributions.map((distro) => (
                <button
                  key={distro.id}
                  onClick={() => setSelectedDistro(distro.id)}
                  className={`p-4 rounded-lg border ${
                    selectedDistro === distro.id
                      ? 'border-indigo-500 ring-2 ring-indigo-200'
                      : 'border-gray-200'
                  } hover:border-indigo-500`}
                >
                  <h4 className="font-medium text-gray-900">
                    {distro.description}
                  </h4>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        const selectedRegionData = regions.find(
          (r) => r.id === selectedRegion
        );
        const selectedPlanData = plans.find((p) => p.id === selectedPlan);
        const selectedDistroData = distributions.find(
          (d) => d.id === selectedDistro
        );

        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Review Configuration
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Region</h4>
                <p className="mt-1">
                  {selectedRegionData?.location} ({selectedRegionData?.region})
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Plan</h4>
                <p className="mt-1">{selectedPlanData?.title}</p>
                <ul className="mt-2 space-y-1 text-sm text-gray-500">
                  <li>• {selectedPlanData?.cores} CPU Cores</li>
                  <li>• {selectedPlanData?.memory} GB RAM</li>
                  <li>• {selectedPlanData?.storage} GB Storage</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Operating System
                </h4>
                <p className="mt-1">{selectedDistroData?.description}</p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Monthly Cost
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${selectedPlanData?.price}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[800px] max-w-[90vw] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              New Server
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {/* Progress Steps */}
          <div className="mt-4 flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step === stepNumber
                      ? 'bg-indigo-600 text-white'
                      : step > stepNumber
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      step > stepNumber ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="mt-2 text-sm text-gray-500">Loading...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <p className="mt-2 text-sm text-red-500">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Close
              </button>
            </div>
          ) : (
            getStepContent()
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1 || isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={() => {
              if (step === 4) {
                handlePurchase();
              } else {
                setStep((s) => s + 1);
              }
            }}
            disabled={!isStepValid() || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 4 ? 'Purchase Server' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}