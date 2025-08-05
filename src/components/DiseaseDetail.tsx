"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Clock, DollarSign, FileText, Beaker } from "lucide-react";

interface Disease {
  name: string;
  description: string;
  causes?: string[];
  symptoms?: string[];
  treatment?: string[];
  prevention?: string[];
  organic_treatment?: string[];
  urgency: string;
  estimated_loss: string;
}

interface TreatmentSchedule {
  immediate: string[];
  daily: string[];
  weekly: string[];
  monthly: string[];
}

interface CostEstimation {
  treatment_cost: number;
  prevention_cost: number;
  potential_loss: number;
  currency: string;
}

interface DiseaseDetailProps {
  diseaseId: string;
  onClose?: () => void;
}

const DiseaseDetail: React.FC<DiseaseDetailProps> = ({ diseaseId, onClose }) => {
  const [disease, setDisease] = useState<Disease | null>(null);
  const [treatmentSchedule, setTreatmentSchedule] = useState<TreatmentSchedule | null>(null);
  const [costEstimation, setCostEstimation] = useState<CostEstimation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "treatment" | "prevention" | "schedule" | "cost">("overview");

  useEffect(() => {
    const fetchDiseaseDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/diseases/${diseaseId}`);
        const data = await response.json();

        if (data.success) {
          setDisease(data.solution);
          setTreatmentSchedule(data.treatment_schedule);
          setCostEstimation(data.cost_estimation);
        }
      } catch (error) {
        console.error("Error fetching disease details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiseaseDetails();
  }, [diseaseId]);

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case "high":
        return {
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
          icon: <AlertTriangle className="h-5 w-5" />,
        };
      case "medium":
        return {
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          icon: <Clock className="h-5 w-5" />,
        };
      case "low":
        return {
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-200",
          icon: <CheckCircle className="h-5 w-5" />,
        };
      default:
        return {
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
          icon: <Clock className="h-5 w-5" />,
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!disease) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-600">Disease information not found.</p>
      </div>
    );
  }

  const urgencyConfig = getUrgencyConfig(disease.urgency);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">{disease.name}</h1>
            <p className="text-gray-600">{disease.description}</p>
          </div>
          <div className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${urgencyConfig.bg} ${urgencyConfig.border}`}>
            <span className={urgencyConfig.color}>{urgencyConfig.icon}</span>
            <span className={`font-medium ${urgencyConfig.color}`}>{disease.urgency} Priority</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-gray-600">
            <AlertTriangle className="h-4 w-4" />
            Estimated Loss: {disease.estimated_loss}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "Overview", icon: <FileText className="h-4 w-4" /> },
              { id: "treatment", label: "Treatment", icon: <Beaker className="h-4 w-4" /> },
              { id: "schedule", label: "Schedule", icon: <Clock className="h-4 w-4" /> },
              { id: "cost", label: "Cost Analysis", icon: <DollarSign className="h-4 w-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "overview" | "treatment" | "prevention" | "schedule" | "cost")}
                className={`py-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {disease.causes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Causes</h3>
                  <ul className="space-y-2">
                    {disease.causes.map((cause, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600">
                        <span className="text-red-400 mt-1">•</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {disease.symptoms && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Symptoms</h3>
                  <ul className="space-y-2">
                    {disease.symptoms.map((symptom, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600">
                        <span className="text-orange-400 mt-1">•</span>
                        <span>{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Treatment Tab */}
          {activeTab === "treatment" && (
            <div className="space-y-6">
              {disease.treatment && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Conventional Treatment</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {disease.treatment.map((treatment, index) => (
                        <li key={index} className="flex items-start gap-2 text-blue-700">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{treatment}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {disease.organic_treatment && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Organic Treatment</h3>
                  <div className="bg-green-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {disease.organic_treatment.map((treatment, index) => (
                        <li key={index} className="flex items-start gap-2 text-green-700">
                          <span className="text-green-400 mt-1">•</span>
                          <span>{treatment}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {disease.prevention && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Prevention</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {disease.prevention.map((prevention, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-gray-400 mt-1">•</span>
                          <span>{prevention}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === "schedule" && treatmentSchedule && (
            <div className="space-y-6">
              {Object.entries(treatmentSchedule).map(([period, tasks]) => (
                <div key={period}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">{period} Actions</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {tasks.map((task: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cost Tab */}
          {activeTab === "cost" && costEstimation && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Treatment Cost</h4>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(costEstimation.treatment_cost)}</p>
                  <p className="text-sm text-blue-600 mt-1">Per hectare</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Prevention Cost</h4>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(costEstimation.prevention_cost)}</p>
                  <p className="text-sm text-green-600 mt-1">Per hectare</p>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Potential Loss</h4>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(costEstimation.potential_loss)}</p>
                  <p className="text-sm text-red-600 mt-1">If untreated</p>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Cost-Benefit Analysis</h4>
                <div className="space-y-2 text-sm text-yellow-700">
                  <p>
                    <strong>ROI of Treatment:</strong> {(((costEstimation.potential_loss - costEstimation.treatment_cost) / costEstimation.treatment_cost) * 100).toFixed(1)}%
                  </p>
                  <p>
                    <strong>Break-even point:</strong> Treatment is profitable if it prevents more than {((costEstimation.treatment_cost / costEstimation.potential_loss) * 100).toFixed(1)}% of potential loss
                  </p>
                  <p>
                    <strong>Prevention vs Treatment:</strong> Prevention costs {((costEstimation.prevention_cost / costEstimation.treatment_cost) * 100).toFixed(0)}% of treatment cost
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Download Treatment Guide</button>
        <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors">Share Information</button>
        {onClose && (
          <button onClick={onClose} className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors">
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default DiseaseDetail;
