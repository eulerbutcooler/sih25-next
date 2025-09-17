"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Report {
  id: number;
  title: string;
  author: string;
  location: string;
  timestamp: string;
  description: string;
  image: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "verified" | "flagged" | "fake";
  votes: number;
  reportType: string;
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      title: "Red Tide Alert at Calangute Beach",
      author: "Riya Sharma",
      location: "Calangute Beach, Goa",
      timestamp: "2 hours ago",
      description:
        "Unusual water coloration spotted. Multiple fish deaths observed.",
      image: "https://placehold.co/600x400/8B0000/FFFFFF?text=Red+Tide",
      severity: "critical",
      status: "pending",
      votes: 23,
      reportType: "Harmful Algae",
    },
    {
      id: 2,
      title: "High Waves at Puri Beach",
      author: "Suresh Patel",
      location: "Puri Beach, Odisha",
      timestamp: "4 hours ago",
      description: "Waves reaching 3-4 meters height. Swimmers in danger.",
      image: "https://placehold.co/600x400/1e3a8a/FFFFFF?text=High+Waves",
      severity: "high",
      status: "pending",
      votes: 8,
      reportType: "Wave Conditions",
    },
    {
      id: 3,
      title: "Oil Spill Near Mumbai Port",
      author: "Captain Malhotra",
      location: "Mumbai Port, Maharashtra",
      timestamp: "6 hours ago",
      description:
        "Small oil spill detected from cargo vessel. Immediate cleanup required.",
      image: "https://placehold.co/600x400/000000/FFFFFF?text=Oil+Spill",
      severity: "medium",
      status: "verified",
      votes: 45,
      reportType: "Pollution",
    },
  ]);

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const updateReportStatus = (
    reportId: number,
    newStatus: "verified" | "flagged" | "fake"
  ) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, status: newStatus } : report
      )
    );
    setSelectedReport(null);
  };

  const filteredReports = reports.filter(
    (report) => filterStatus === "all" || report.status === filterStatus
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400 bg-red-900/30";
      case "high":
        return "text-orange-400 bg-orange-900/30";
      case "medium":
        return "text-yellow-400 bg-yellow-900/30";
      case "low":
        return "text-blue-400 bg-blue-900/30";
      default:
        return "text-gray-400 bg-gray-900/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-400 bg-green-900/30";
      case "pending":
        return "text-yellow-400 bg-yellow-900/30";
      case "flagged":
        return "text-orange-400 bg-orange-900/30";
      case "fake":
        return "text-red-400 bg-red-900/30";
      default:
        return "text-gray-400 bg-gray-900/30";
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-screen bg-black overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 bg-black/70 backdrop-blur-lg z-10 p-4 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Government Dashboard
            </h1>
            <p className="text-gray-400">Report Verification & Management</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold">Officer Rajesh Kumar</p>
              <p className="text-xs text-gray-400">Marine Safety Dept.</p>
            </div>
            <Image
              src="https://placehold.co/48x48/059669/ffffff?text=RK"
              className="w-12 h-12 rounded-full border-2 border-green-600"
              alt="Officer"
            />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Reports List */}
        <div className="flex-1 p-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {reports.filter((r) => r.status === "pending").length}
                </p>
                <p className="text-xs text-gray-400">Pending Review</p>
              </div>
            </div>
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {reports.filter((r) => r.status === "verified").length}
                </p>
                <p className="text-xs text-gray-400">Verified</p>
              </div>
            </div>
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">
                  {reports.filter((r) => r.status === "flagged").length}
                </p>
                <p className="text-xs text-gray-400">Flagged</p>
              </div>
            </div>
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">
                  {reports.filter((r) => r.status === "fake").length}
                </p>
                <p className="text-xs text-gray-400">Marked Fake</p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 mb-4">
            {["all", "pending", "verified", "flagged", "fake"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filterStatus === status
                    ? "bg-amber-300 text-black"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex items-start space-x-4">
                  <Image
                    src={report.image}
                    className="w-20 h-20 rounded-lg object-cover"
                    alt="Report"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">
                        {report.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          report.status
                        )}`}
                      >
                        {report.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      {report.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>By {report.author}</span>
                        <span>{report.location}</span>
                        <span>{report.timestamp}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(
                            report.severity
                          )}`}
                        >
                          {report.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          <i className="fas fa-thumbs-up mr-1"></i>
                          {report.votes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Detail Panel */}
        {selectedReport && (
          <div className="w-1/3 bg-gray-900 border-l border-gray-800 p-4">
            <div className="sticky top-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Report Details</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="space-y-4">
                <Image
                  src={selectedReport.image}
                  className="w-full rounded-lg"
                  alt="Report"
                />

                <div>
                  <h3 className="font-semibold text-white mb-2">
                    {selectedReport.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {selectedReport.description}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reporter:</span>
                    <span className="text-white">{selectedReport.author}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-white">
                      {selectedReport.location}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">
                      {selectedReport.reportType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Severity:</span>
                    <span
                      className={`font-semibold ${
                        getSeverityColor(selectedReport.severity).split(" ")[0]
                      }`}
                    >
                      {selectedReport.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Community Votes:</span>
                    <span className="text-white">{selectedReport.votes}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4">
                  <button
                    onClick={() =>
                      updateReportStatus(selectedReport.id, "verified")
                    }
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    <i className="fas fa-check mr-2"></i>
                    Verify Report
                  </button>
                  <button
                    onClick={() =>
                      updateReportStatus(selectedReport.id, "flagged")
                    }
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    <i className="fas fa-flag mr-2"></i>
                    Flag for Review
                  </button>
                  <button
                    onClick={() =>
                      updateReportStatus(selectedReport.id, "fake")
                    }
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Mark as Fake
                  </button>
                </div>

                {/* Additional Actions */}
                <div className="pt-4 border-t border-gray-800 space-y-2">
                  <button className="w-full secondary-btn text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center">
                    <i className="fas fa-comments mr-2"></i>
                    Contact Reporter
                  </button>
                  <button className="w-full secondary-btn text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center">
                    <i className="fas fa-broadcast-tower mr-2"></i>
                    Send Alert
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Bar */}
      <div className="fixed bottom-4 right-4 flex space-x-2">
        <Link href="/home">
          <button className="bg-amber-300 text-black p-3 rounded-full shadow-lg hover:bg-amber-400 transition-colors">
            <i className="fas fa-home"></i>
          </button>
        </Link>
        <button className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors">
          <i className="fas fa-bell"></i>
        </button>
      </div>
    </div>
  );
}
