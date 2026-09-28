import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { useOptimization } from './hooks/useOptimization';

import { OverviewPage } from './pages/OverviewPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { DocumentAnalyzerPage } from './pages/DocumentAnalyzerPage';
import { OptimizationPage } from './pages/OptimizationPage';
import { AlgorithmComparisonPage } from './pages/AlgorithmComparisonPage';
import { BenchmarkPage } from './pages/BenchmarkPage';
import { SelectedContextPage } from './pages/SelectedContextPage';
import { AlgorithmGuidePage } from './pages/AlgorithmGuidePage';
import { AboutPage } from './pages/AboutPage';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const {
    backendOnline,
    documents,
    setSelectedDocId,
    selectedDocument,
    allChunks,
    question,
    setQuestion,
    tokenBudget,
    setTokenBudget,
    activeAlgorithm,
    setActiveAlgorithm,
    loading,
    error,
    lastResult,
    comparisonData,
    comparisonResults,
    benchmarkSuite,
    handleOptimize,
    handleCompareAll,
    handleRunBenchmark,
    handleUploadDocument,
    refreshData
  } = useOptimization();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewPage
            onNavigate={(page) => setActiveTab(page)}
            documentCount={documents.length}
            totalChunks={allChunks.length}
            tokenBudget={tokenBudget}
          />
        );
      case 'workspace':
        return (
          <WorkspacePage
            documents={documents}
            selectedDocument={selectedDocument}
            onSelectDoc={setSelectedDocId}
            onUploadDocument={handleUploadDocument}
            question={question}
            setQuestion={setQuestion}
            tokenBudget={tokenBudget}
            setTokenBudget={setTokenBudget}
            activeAlgorithm={activeAlgorithm}
            setActiveAlgorithm={setActiveAlgorithm}
            allChunks={allChunks}
            lastResult={lastResult}
            onOptimize={handleOptimize}
            loading={loading}
            error={error}
          />
        );
      case 'analyzer':
        return (
          <DocumentAnalyzerPage
            documents={documents}
            selectedDocument={selectedDocument}
            onSelectDoc={setSelectedDocId}
            onUploadDocument={handleUploadDocument}
            loading={loading}
            error={error}
          />
        );
      case 'optimization':
        return (
          <OptimizationPage
            question={question}
            setQuestion={setQuestion}
            tokenBudget={tokenBudget}
            setTokenBudget={setTokenBudget}
            activeAlgorithm={activeAlgorithm}
            setActiveAlgorithm={setActiveAlgorithm}
            allChunks={allChunks}
            lastResult={lastResult}
            comparisonResults={comparisonResults}
            onOptimize={handleOptimize}
            loading={loading}
            error={error}
          />
        );
      case 'comparison':
        return (
          <AlgorithmComparisonPage
            question={question}
            tokenBudget={tokenBudget}
            comparisonData={comparisonData}
            comparisonResults={comparisonResults}
            allChunks={allChunks}
            onCompareAll={handleCompareAll}
            loading={loading}
            error={error}
          />
        );
      case 'benchmark':
        return (
          <BenchmarkPage
            question={question}
            tokenBudget={tokenBudget}
            loading={loading}
            error={error}
          />
        );
      case 'context':
        return (
          <SelectedContextPage
            lastResult={lastResult}
            allChunks={allChunks}
            tokenBudget={tokenBudget}
          />
        );
      case 'guide':
        return <AlgorithmGuidePage />;
      case 'about':
        return <AboutPage />;
      default:
        return (
          <OverviewPage
            onNavigate={(page) => setActiveTab(page)}
            documentCount={documents.length}
            totalChunks={allChunks.length}
            tokenBudget={tokenBudget}
          />
        );
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Overview';
      case 'workspace': return 'Optimization Workspace';
      case 'analyzer': return 'Document Analysis';
      case 'optimization': return 'Context Optimization';
      case 'comparison': return 'Optimization Analysis';
      case 'benchmark': return 'Performance Lab';
      case 'context': return 'Selected Context Inspector';
      case 'guide': return 'Documentation & Reference';
      case 'about': return 'Platform Architecture';
      default: return 'ContextOpt';
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Permanent Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendOnline={backendOnline}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Topbar
          title={getPageTitle()}
          subtitle="C++20 Context Optimization Engine"
          tokenBudget={tokenBudget}
          onRefresh={refreshData}
          loading={loading}
        />

        <main className="flex-1 pb-12">{renderActivePage()}</main>
      </div>
    </div>
  );
}

export default App;
