import React, { useState, useRef } from 'react';
import { Document, Chunk } from '../types';
import { ChunkCard } from '../components/ChunkCard';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { FileText, Upload, Trash2, Search, SlidersHorizontal, Database, Hash, Layers, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DocumentAnalyzerPageProps {
  documents: Document[];
  selectedDocument: Document | null;
  onSelectDoc: (id: string) => void;
  onUploadDocument: (title: string, category: string, content: string, chunkSize: number) => Promise<Document>;
  loading: boolean;
  error: string | null;
}

export const DocumentAnalyzerPage: React.FC<DocumentAnalyzerPageProps> = ({
  documents,
  selectedDocument,
  onSelectDoc,
  onUploadDocument,
  loading,
  error
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [chunkSize, setChunkSize] = useState<number>(120);
  const [docCategory, setDocCategory] = useState<string>('Academic Notes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'position' | 'tokenCost' | 'relevance'>('position');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (!file) return;
    if (!file.name.endsWith('.txt')) {
      alert('Please select a plain text (.txt) file.');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent(e.target?.result as string || '');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!fileContent && !selectedFile) {
      alert('Please upload a .txt file first or enter content.');
      return;
    }
    const title = selectedFile ? selectedFile.name.replace('.txt', '') : 'Uploaded Document';
    try {
      await onUploadDocument(title, docCategory, fileContent, chunkSize);
      setSelectedFile(null);
      setFileContent('');
    } catch (err) {
      // Handled by parent hook
    }
  };

  const handleLoadDBMS = async () => {
    const sampleText = 
      "Database Normalization is the process of structuring a relational database in accordance with a series of normal forms to reduce data redundancy and improve data integrity.\n\n" +
      "First Normal Form (1NF) requires that the domain of each attribute must contain only atomic values. It eliminates repeating groups of columns.\n\n" +
      "Second Normal Form (2NF) builds upon 1NF and requires that all non-key attributes are fully functionally dependent on the primary key, eliminating partial dependencies.\n\n" +
      "Third Normal Form (3NF) requires that the table is in 2NF and that all non-key attributes are non-transitively dependent on the primary key (no non-key attribute depending on another non-key attribute).\n\n" +
      "Boyce-Codd Normal Form (BCNF) is a stricter version of 3NF where for every non-trivial functional dependency X -> Y, X must be a superkey.\n\n" +
      "Fourth Normal Form (4NF) handles multi-valued dependencies. Fifth Normal Form (5NF) deals with join dependencies in complex database schemas.";
    
    setFileContent(sampleText);
    await onUploadDocument("DBMS Normalization & Normal Forms", "Database Systems", sampleText, 60);
  };

  const chunks = selectedDocument?.chunks || [];

  const filteredChunks = chunks
    .filter(c => searchQuery === '' || c.text.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'tokenCost') return b.tokenCost - a.tokenCost;
      if (sortBy === 'relevance') return b.relevanceScore - a.relevanceScore;
      return a.position - b.position;
    });

  const avgChunkSize = chunks.length > 0 ? (selectedDocument?.totalWords || 0) / chunks.length : 0;

  const chartData = chunks.map((c, idx) => ({
    name: `Chunk #${c.position || idx + 1}`,
    tokens: c.tokenCost,
    relevance: c.relevanceScore
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Document Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" /> Document Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Splits documents into structured context chunks, estimates word token weights, and prepares term frequency representations for optimization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLoadDBMS}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" /> Load Sample DBMS Document
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} />}

      {/* Upload Area & Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Drop Zone */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-3">Upload .TXT Document</h3>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-750 bg-slate-850/50 hover:border-slate-600 hover:bg-slate-850'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
              className="hidden"
            />
            <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-200">
              Drag & Drop your .TXT document here, or <span className="text-indigo-400 underline">browse</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Plain text (.txt) format supported</p>
          </div>

          {selectedFile && (
            <div className="mt-4 p-3 bg-slate-850 border border-slate-700 rounded-lg flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-200 font-bold">{selectedFile.name}</span>
                <span className="text-slate-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFileContent(''); }}
                className="text-slate-400 hover:text-rose-400 p-1"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Chunking Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-3">Chunking Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Target Chunk Size: <span className="text-indigo-400 font-mono">{chunkSize} words/tokens</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>50 words</span>
                  <span>150 (Default)</span>
                  <span>300 words</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category Tag</label>
                <input
                  type="text"
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-indigo-500 outline-none"
                  placeholder="e.g. Database Systems, DAA Theory"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleProcess}
            disabled={loading || (!selectedFile && !fileContent)}
            className="w-full mt-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            Process Document with C++ Engine
          </button>
        </div>
      </div>

      {/* Document Summary Stats */}
      {selectedDocument && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Document Summary: <span className="text-indigo-400 font-mono">{selectedDocument.title}</span>
            </h2>

            {documents.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Select Document:</span>
                <select
                  value={selectedDocument.id}
                  onChange={(e) => onSelectDoc(e.target.value)}
                  className="bg-slate-850 border border-slate-750 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono outline-none"
                >
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>{d.title} ({d.chunks.length} chunks)</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="File Name" value={selectedDocument.title.split(' ')[0]} subtext={selectedDocument.category} icon={FileText} badge={selectedDocument.id} badgeColor="indigo" />
            <StatCard title="Total Words" value={selectedDocument.totalWords} subtext="Raw word count" icon={Layers} badge="Word Tokens" badgeColor="cyan" />
            <StatCard title="Total Chunks" value={selectedDocument.chunks.length} subtext="Structured text units" icon={Hash} badge="Configured" badgeColor="emerald" />
            <StatCard title="Avg Chunk Size" value={`${avgChunkSize.toFixed(0)} words`} subtext="Words per chunk" icon={PieChart} badge="Uniform" badgeColor="amber" />
          </div>

          {/* Token Distribution Chart */}
          <ChartCard title="Chunk Token Cost Distribution" subtitle="Word token weight for each extracted document chunk">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit=" tok" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }} />
                <Bar dataKey="tokens" fill="#6366f1" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`c-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#38bdf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Chunk Explorer Section */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            Chunk Explorer ({filteredChunks.length} chunks)
          </h2>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search chunk text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-850 border border-slate-750 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 outline-none w-56 focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 bg-slate-850 border border-slate-750 rounded-lg px-2.5 py-1 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-200 outline-none font-mono"
              >
                <option value="position">Sort by Chunk #</option>
                <option value="tokenCost">Sort by Token Cost</option>
                <option value="relevance">Sort by Relevance</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Chunking document using C++ DocumentProcessor..." />
        ) : filteredChunks.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400 font-mono">
            No chunks match search filter "{searchQuery}".
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredChunks.map((chunk, idx) => (
              <ChunkCard key={chunk.id} chunk={chunk} index={idx + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
