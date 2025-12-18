
import React, { useState, useCallback, useMemo } from 'react';
import { AppState, MagicMoment } from './types';
import { geminiService } from './services/geminiService';
import MagicPlayer from './components/MagicPlayer';
import { PYTHON_CODE_SNIPPET, JAVA_SPRING_CODE, SparkleIcon } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [magicMoments, setMagicMoments] = useState<MagicMoment[]>([]);
  const [selectedMomentIndex, setSelectedMomentIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setState(AppState.IDLE);
      setMagicMoments([]);
      setSelectedMomentIndex(0);
      setErrorMessage(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;

    setState(AppState.ANALYZING);
    try {
      const base64Video = await fileToBase64(videoFile);
      const results = await geminiService.analyzeVideo(base64Video, videoFile.type);
      setMagicMoments(results);
      setSelectedMomentIndex(0);
      setState(AppState.READY);
    } catch (err: any) {
      setErrorMessage(err.message || '分析过程中发生未知错误。');
      setState(AppState.ERROR);
    }
  };

  const downloadMoment = (moment: MagicMoment) => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `Magic_Moment_${moment.summary.replace(/\s+/g, '_').substring(0, 20)}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    magicMoments.forEach((moment, index) => {
      // Small timeout to prevent browser from blocking multiple downloads
      setTimeout(() => downloadMoment(moment), index * 300);
    });
  };

  const totalDuration = useMemo(() => {
    return magicMoments.reduce((acc, m) => acc + (m.end - m.start), 0);
  }, [magicMoments]);

  const currentMoment = magicMoments[selectedMomentIndex];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Dynamic Background Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/5 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <header className="border-b border-white/5 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl text-black shadow-lg shadow-yellow-500/20">
              <SparkleIcon />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">
                Magic <span className="text-yellow-500">Moment</span> Studio
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">AI Powered Video Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end mr-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Engine Status</span>
              <span className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                Gemini 3 Pro Online
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Panel */}
        <aside className="lg:col-span-3 space-y-6">
          <section className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 space-y-5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">上传素材</h2>
              {videoFile && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">已准备</span>}
            </div>
            
            <div className="relative group">
              <input type="file" accept="video/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className={`border-2 border-dashed rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center gap-3 ${
                videoFile ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-slate-800 hover:border-slate-600 bg-slate-950/40'
              }`}>
                <div className={`p-3 rounded-full ${videoFile ? 'bg-yellow-500 text-black' : 'bg-slate-900 text-slate-500'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200 truncate max-w-[150px]">{videoFile ? videoFile.name : '选择课堂录像'}</p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">{videoFile ? (videoFile.size / 1024 / 1024).toFixed(1) + ' MB' : '支持 MP4, MOV'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!videoFile || state === AppState.ANALYZING}
              className={`w-full py-4 font-black rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-xl ${
                state === AppState.ANALYZING 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-yellow-500 hover:bg-yellow-400 text-black active:scale-95'
              }`}
            >
              {state === AppState.ANALYZING ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>AI 分析中...</span>
                </>
              ) : (
                <>
                  <SparkleIcon />
                  <span>开始魔法提取</span>
                </>
              )}
            </button>
          </section>

          {magicMoments.length > 0 && (
            <section className="space-y-4 animate-in slide-in-from-bottom-5 duration-500">
              <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">高光资产库</h3>
                    <p className="text-xs font-bold text-white">找到 {magicMoments.length} 个精彩瞬间</p>
                  </div>
                  <div className="bg-yellow-500/10 text-yellow-500 text-[10px] font-mono px-2 py-1 rounded border border-yellow-500/20">
                    共 {totalDuration.toFixed(1)}s
                  </div>
                </div>

                <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  {magicMoments.map((moment, index) => (
                    <div 
                      key={moment.id || index}
                      className={`group relative rounded-2xl border transition-all ${
                        selectedMomentIndex === index 
                          ? 'bg-yellow-500/10 border-yellow-500/50 shadow-lg' 
                          : 'bg-slate-950/40 border-transparent hover:bg-slate-800/40'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedMomentIndex(index)}
                        className="w-full text-left p-4 pr-12"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            selectedMomentIndex === index ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-500'
                          }`}>片段 {index + 1}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{(moment.end - moment.start).toFixed(1)}s</span>
                        </div>
                        <p className={`text-xs font-bold leading-tight ${selectedMomentIndex === index ? 'text-white' : 'text-slate-400'}`}>
                          {moment.summary}
                        </p>
                      </button>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); downloadMoment(moment); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-yellow-500 hover:text-black transition-all"
                        title="立即下载"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleDownloadAll}
                  className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black rounded-xl border border-white/10 uppercase tracking-widest transition-all"
                >
                  批量下载全部片段
                </button>
              </div>
            </section>
          )}
        </aside>

        {/* Right Main Content */}
        <section className="lg:col-span-9 flex flex-col gap-6">
          <div className="flex gap-2 p-1 bg-slate-900/80 border border-white/5 rounded-2xl w-fit backdrop-blur-md">
            <button 
              onClick={() => setActiveTab('preview')} 
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'preview' ? 'bg-slate-700 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              实时预览 & 包装
            </button>
            <button 
              onClick={() => setActiveTab('code')} 
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'code' ? 'bg-slate-700 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              开发者逻辑 (Engine)
            </button>
          </div>

          <div className="flex-1 min-h-[600px] bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden backdrop-blur-xl shadow-inner">
            {activeTab === 'preview' ? (
              <div className="flex-1 flex flex-col items-center justify-center relative">
                {state === AppState.READY && currentMoment && videoUrl ? (
                  <div className="w-full space-y-10 animate-in fade-in zoom-in-95 duration-700">
                    <MagicPlayer videoUrl={videoUrl} moment={currentMoment} />
                    
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 uppercase font-black mb-1">开始时间</p>
                          <p className="text-xl font-mono font-bold text-white">{currentMoment.start.toFixed(2)}s</p>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 uppercase font-black mb-1">结束时间</p>
                          <p className="text-xl font-mono font-bold text-white">{currentMoment.end.toFixed(2)}s</p>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 uppercase font-black mb-1">情感评价</p>
                          <p className="text-xl font-bold text-yellow-500">🌟 卓越</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => downloadMoment(currentMoment)} 
                        className="group relative px-12 py-5 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black rounded-2xl hover:scale-105 transition-all shadow-2xl flex items-center gap-4 mt-4"
                      >
                        <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform rounded-2xl" />
                        <svg className="w-5 h-5 relative z-10 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="relative z-10 uppercase tracking-widest">导出高分片段</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-8 text-center opacity-40 max-w-md">
                    <div className="p-10 bg-slate-950 rounded-[3rem] border border-white/5 shadow-2xl">
                       <svg className="h-24 w-24 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                       </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-700 uppercase tracking-tighter mb-2 italic">
                        {state === AppState.ANALYZING ? 'AI 多维特征提取中...' : '准备好见证魔法了吗？'}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {state === AppState.ANALYZING 
                          ? '正在通过视频帧分析情感、语音能量和教学逻辑，为您精选最佳课堂瞬间。' 
                          : '请在左侧上传视频，Gemini 将自动为您剪辑学生表现最出色的精彩片段。'}
                      </p>
                    </div>
                    {state === AppState.ANALYZING && (
                      <div className="w-64 space-y-3">
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase">
                          <span>推理进度</span>
                          <span>{Math.floor(Math.random() * 20) + 70}%</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500/50 animate-progress"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-6 animate-in slide-in-from-right-10 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-blue-500 text-white rounded-lg font-bold text-xs">PYTHON</span>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Automated Processing Pipeline</h3>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[9px] px-2 py-0.5 bg-slate-800 text-slate-500 rounded border border-white/5 uppercase font-black">Backend Logic</span>
                  </div>
                </div>
                <div className="flex-1 relative rounded-3xl bg-slate-950 border border-white/10 overflow-hidden shadow-2xl">
                   <pre className="absolute inset-0 p-8 text-[13px] font-mono text-slate-300 overflow-auto leading-relaxed scrollbar-thin">
                     <code>{PYTHON_CODE_SNIPPET}</code>
                   </pre>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-slate-950/80 py-8 mt-auto backdrop-blur-md">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] text-slate-600 uppercase tracking-[0.4em] font-bold">
            © 2024 Magic Moment Studio • AI Classroom Intelligence
          </div>
          <div className="flex gap-8">
            <span className="text-[10px] text-slate-700 font-mono flex items-center gap-2">
              <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
              MODEL: GEMINI-3-PRO-PREVIEW
            </span>
            <span className="text-[10px] text-slate-700 font-mono flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
              PROCESSOR: MULTIMODAL V3
            </span>
          </div>
        </div>
      </footer>

      {state === AppState.ERROR && (
        <div className="fixed bottom-8 right-8 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl border border-red-400 flex items-center gap-4 animate-in slide-in-from-right-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div>
            <p className="text-xs font-black uppercase mb-1">系统错误</p>
            <p className="text-sm font-bold opacity-90">{errorMessage}</p>
          </div>
          <button onClick={() => setState(AppState.IDLE)} className="p-2 hover:bg-black/10 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
