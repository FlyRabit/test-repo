import { useState, useRef } from 'react';
import { useAuth } from '../store/authStore';
import { api } from '../services/api';
import { Video, Upload, X, Send, Loader2, CheckCircle, Image, AlertCircle } from 'lucide-react';

export default function VideoPublishPage() {
  const { isConnected } = useAuth();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ id: string; score: number } | null>(null);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setError('请选择视频文件');
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError('视频文件不能超过 500MB');
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setError('');
    setSuccess(null);
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('封面必须是图片文件');
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handlePublish = async () => {
    if (!videoFile || !title.trim() || publishing) return;
    setPublishing(true);
    setError('');
    setProgress('上传视频中...');

    try {
      const uploadResult = await api.upload.images([videoFile]);
      const videoPath = uploadResult.files[0].path;

      let coverPath: string | undefined;
      if (coverFile) {
        setProgress('上传封面中...');
        const coverResult = await api.upload.images([coverFile]);
        coverPath = coverResult.files[0].path;
      }

      setProgress('发布笔记中...');
      const result = await api.notes.createVideo({
        title: title.trim(),
        desc: desc.trim(),
        video_path: videoPath,
        cover_path: coverPath,
        is_private: isPrivate,
      }) as { data: { id: string; score: number } };

      setSuccess({ id: result.data.id, score: result.data.score });
      setProgress('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '发布失败');
      setProgress('');
    } finally {
      setPublishing(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDesc('');
    setVideoFile(null);
    setVideoPreview('');
    setCoverFile(null);
    setCoverPreview('');
    setSuccess(null);
    setError('');
    setIsPrivate(false);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <AlertCircle size={48} className="mb-4" />
        <p className="text-lg font-medium text-gray-600">请先连接小红书账号</p>
        <p className="text-sm mt-2">前往「账号管理」页面粘贴 Cookie 完成连接</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <Video className="text-[#fe2c55]" size={28} /> 视频发布
      </h1>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Left: Video + Cover */}
        <div className="md:col-span-2 space-y-4">
          {/* Video Upload */}
          <div className="bg-white/90 rounded-2xl shadow-lg border border-red-50 overflow-hidden">
            <div className="p-4 border-b border-red-50 bg-gradient-to-r from-red-50 to-pink-50">
              <h2 className="text-sm font-semibold text-gray-800">视频文件</h2>
            </div>
            <div className="p-4">
              {videoPreview ? (
                <div className="relative">
                  <video src={videoPreview} controls className="w-full rounded-xl bg-black" style={{ maxHeight: 280 }} />
                  <button
                    onClick={() => { setVideoFile(null); setVideoPreview(''); }}
                    className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80"
                  >
                    <X size={16} />
                  </button>
                  <p className="text-xs text-gray-400 mt-2">{videoFile?.name} ({(videoFile!.size / 1024 / 1024).toFixed(1)} MB)</p>
                </div>
              ) : (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-red-200 rounded-xl p-8 text-center cursor-pointer hover:bg-red-50/50 transition-colors"
                >
                  <Upload className="mx-auto text-[#fe2c55] mb-2" size={36} />
                  <p className="text-sm text-gray-600">点击上传视频</p>
                  <p className="text-xs text-gray-400 mt-1">MP4 格式，500MB 以内</p>
                </div>
              )}
              <input ref={videoInputRef} type="file" accept="video/mp4,video/*" onChange={handleVideoSelect} className="hidden" />
            </div>
          </div>

          {/* Cover Upload */}
          <div className="bg-white/90 rounded-2xl shadow-lg border border-red-50 overflow-hidden">
            <div className="p-4 border-b border-red-50">
              <h2 className="text-sm font-semibold text-gray-800">封面图 <span className="text-gray-400 font-normal">（可选）</span></h2>
            </div>
            <div className="p-4">
              {coverPreview ? (
                <div className="relative">
                  <img src={coverPreview} alt="" className="w-full rounded-xl object-cover" style={{ maxHeight: 180 }} />
                  <button
                    onClick={() => { setCoverFile(null); setCoverPreview(''); }}
                    className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="border-2 border-dashed border-red-100 rounded-xl p-4 text-center cursor-pointer hover:bg-red-50/50 transition-colors"
                >
                  <Image className="mx-auto text-gray-300 mb-1" size={24} />
                  <p className="text-xs text-gray-400">不上传则自动取视频第一帧</p>
                </div>
              )}
              <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="md:col-span-3">
          <div className="bg-white/90 rounded-2xl shadow-lg border border-red-50 overflow-hidden">
            <div className="p-5 border-b border-red-50 bg-gradient-to-r from-red-50 to-pink-50">
              <h2 className="text-base font-semibold text-gray-800">笔记信息</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">标题</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="给视频取一个吸引人的标题..."
                  maxLength={20}
                  className="w-full px-4 py-2.5 rounded-xl border border-red-100 focus:border-[#fe2c55] focus:ring-2 focus:ring-red-100 outline-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/20</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">正文描述</label>
                <textarea
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="描述视频内容，可加话题标签..."
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl border border-red-100 focus:border-[#fe2c55] focus:ring-2 focus:ring-red-100 outline-none resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="rounded border-red-200 text-[#fe2c55] focus:ring-red-200" />
                <span className="text-sm text-gray-600">私密发布（仅自己可见）</span>
              </label>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {success ? (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                    <p className="font-medium text-green-700">视频笔记发布成功！</p>
                    <p className="text-xs text-green-600 mt-1">ID: {success.id} · 评分: {success.score}</p>
                    <a
                      href={`https://www.xiaohongshu.com/explore/${success.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-2 text-sm text-[#fe2c55] underline"
                    >
                      在小红书中查看 →
                    </a>
                  </div>
                  <button onClick={resetForm} className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium">
                    继续发布
                  </button>
                </div>
              ) : (
                <button
                  onClick={handlePublish}
                  disabled={publishing || !videoFile || !title.trim()}
                  className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-[#fe2c55] text-white hover:bg-[#e01a45] transition-all disabled:opacity-50 shadow-md"
                >
                  {publishing ? (
                    <><Loader2 size={20} className="animate-spin" /> {progress || '处理中...'}</>
                  ) : (
                    <><Send size={20} /> 发布视频笔记</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
