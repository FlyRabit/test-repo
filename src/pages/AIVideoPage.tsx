import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../store/authStore';
import { api } from '../services/api';
import { Video, Sparkles, Send, Loader2, CheckCircle, AlertCircle, RotateCcw, Monitor, Smartphone } from 'lucide-react';

type Status = 'idle' | 'generating' | 'done' | 'publishing' | 'published' | 'error';

export default function AIVideoPage() {
  const { isConnected } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [aspect, setAspect] = useState<'16:9' | '9:16'>('16:9');
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState('');
  const [, setTaskId] = useState('');
  const [videoPath, setVideoPath] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [publishResult, setPublishResult] = useState<{ id: string; score: number } | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const handleGenerate = async () => {
    if (!prompt.trim() || status === 'generating') return;
    setStatus('generating');
    setError('');
    setProgress('提交生成任务...');
    setVideoUrl('');
    setVideoPath('');
    setPublishResult(null);

    try {
      const res = await api.aiVideo.generate(prompt, aspect);
      setTaskId(res.task_id);
      setProgress('AI 正在生成视频，预计 1-3 分钟...');

      pollingRef.current = setInterval(async () => {
        try {
          const st = await api.aiVideo.status(res.task_id);
          const d = st.data;
          if (d.status === 'done' && d.path) {
            stopPolling();
            setVideoPath(d.path);
            setVideoUrl(api.aiVideo.downloadUrl(res.task_id));
            setStatus('done');
            setProgress('');
          } else if (d.status === 'error') {
            stopPolling();
            setError(d.error || '生成失败');
            setStatus('error');
          } else {
            setProgress(d.progress || 'AI 生成中...');
          }
        } catch {
          // keep polling
        }
      }, 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : '提交失败');
      setStatus('error');
    }
  };

  const handlePublish = async () => {
    if (!videoPath || !title.trim() || status === 'publishing') return;
    setStatus('publishing');
    setError('');
    try {
      const res = await api.aiVideo.publish({
        title: title.trim(),
        desc: desc.trim(),
        video_path: videoPath,
      }) as { data: { id: string; score: number } };
      setPublishResult({ id: res.data.id, score: res.data.score });
      setStatus('published');
    } catch (e) {
      setError(e instanceof Error ? e.message : '发布失败');
      setStatus('done');
    }
  };

  const reset = () => {
    stopPolling();
    setStatus('idle');
    setPrompt('');
    setTitle('');
    setDesc('');
    setVideoUrl('');
    setVideoPath('');
    setError('');
    setPublishResult(null);
    setTaskId('');
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <Video className="text-[#fe2c55]" size={28} />
        AI 视频生成
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-normal ml-2">Powered by Veo</span>
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Prompt */}
        <div className="space-y-4">
          <div className="bg-white/90 rounded-2xl shadow-lg border border-red-50 overflow-hidden">
            <div className="p-5 border-b border-red-50 bg-gradient-to-r from-red-50 to-pink-50">
              <h2 className="text-base font-semibold text-gray-800">视频描述</h2>
            </div>
            <div className="p-5 space-y-4">
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={"描述你想要的视频画面，越详细越好...\n\n例如：一只橘猫慵懒地躺在阳光下的窗台上，窗外是蒙蒙细雨，镜头缓慢推近，暖色调，电影质感"}
                rows={6}
                disabled={status === 'generating'}
                className="w-full px-4 py-3 rounded-xl border border-red-100 focus:border-[#fe2c55] focus:ring-2 focus:ring-red-100 outline-none resize-none disabled:bg-gray-50"
              />

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">画面比例</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAspect('16:9')}
                    disabled={status === 'generating'}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${aspect === '16:9' ? 'bg-[#fe2c55] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <Monitor size={16} /> 横屏 16:9
                  </button>
                  <button
                    onClick={() => setAspect('9:16')}
                    disabled={status === 'generating'}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${aspect === '9:16' ? 'bg-[#fe2c55] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <Smartphone size={16} /> 竖屏 9:16
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || status === 'generating'}
                className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-[#fe2c55] text-white hover:bg-[#e01a45] transition-all disabled:opacity-50 shadow-md"
              >
                {status === 'generating' ? (
                  <><Loader2 size={20} className="animate-spin" /> {progress}</>
                ) : (
                  <><Sparkles size={20} /> 生成视频</>
                )}
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p>{error}</p>
                    {status === 'error' && (
                      <button onClick={reset} className="text-xs underline mt-1">重试</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Preview + Publish */}
        <div className="space-y-4">
          <div className="bg-white/90 rounded-2xl shadow-lg border border-red-50 overflow-hidden">
            <div className="p-5 border-b border-red-50 bg-gradient-to-r from-red-50 to-pink-50">
              <h2 className="text-base font-semibold text-gray-800">预览 & 发布</h2>
            </div>
            <div className="p-5">
              {status === 'idle' && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Video size={48} strokeWidth={1} className="mb-3" />
                  <p className="text-sm">输入描述后点击"生成视频"</p>
                  <p className="text-xs mt-1">AI 将自动生成 8 秒高清视频</p>
                </div>
              )}

              {status === 'generating' && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <Loader2 size={48} className="animate-spin text-[#fe2c55]" />
                    <Sparkles size={16} className="absolute -top-1 -right-1 text-amber-400 animate-pulse" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mt-4">{progress}</p>
                  <p className="text-xs text-gray-400 mt-1">视频生成需要 1-3 分钟，请耐心等待</p>
                </div>
              )}

              {(status === 'done' || status === 'publishing' || status === 'published') && videoUrl && (
                <div className="space-y-4">
                  <video src={videoUrl} controls className="w-full rounded-xl bg-black" style={{ maxHeight: 300 }} />

                  {status !== 'published' ? (
                    <>
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="笔记标题（20字以内）"
                        maxLength={20}
                        className="w-full px-4 py-2.5 rounded-xl border border-red-100 focus:border-[#fe2c55] focus:ring-2 focus:ring-red-100 outline-none"
                      />
                      <textarea
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        placeholder="笔记描述..."
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl border border-red-100 focus:border-[#fe2c55] focus:ring-2 focus:ring-red-100 outline-none resize-none"
                      />

                      {!isConnected && (
                        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">请先在「账号管理」页连接小红书账号后发布</p>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={handlePublish}
                          disabled={!isConnected || !title.trim() || status === 'publishing'}
                          className="flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-[#fe2c55] text-white hover:bg-[#e01a45] disabled:opacity-50 shadow-md"
                        >
                          {status === 'publishing' ? (
                            <><Loader2 size={18} className="animate-spin" /> 发布中...</>
                          ) : (
                            <><Send size={18} /> 发布到小红书</>
                          )}
                        </button>
                        <button onClick={reset} className="px-4 py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200">
                          <RotateCcw size={18} />
                        </button>
                      </div>
                    </>
                  ) : publishResult && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                      <p className="font-medium text-green-700">视频笔记发布成功！</p>
                      <p className="text-xs text-green-600 mt-1">评分: {publishResult.score}</p>
                      <a href={`https://www.xiaohongshu.com/explore/${publishResult.id}`} target="_blank" rel="noreferrer" className="inline-block mt-2 text-sm text-[#fe2c55] underline">
                        在小红书中查看 →
                      </a>
                      <button onClick={reset} className="block mx-auto mt-3 text-xs text-gray-500 hover:text-gray-700">继续生成</button>
                    </div>
                  )}
                </div>
              )}

              {status === 'error' && !videoUrl && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <AlertCircle size={48} className="text-red-300 mb-3" />
                  <p className="text-sm">生成失败，请修改描述后重试</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
