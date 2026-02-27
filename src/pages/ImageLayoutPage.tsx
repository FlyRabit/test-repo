import { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import ArticleSelector from '../components/ArticleSelector';

const ASPECT_RATIO = 3 / 4; // 小红书推荐 3:4 竖版

export default function ImageLayoutPage() {
  const { articles, currentArticle, setCurrentArticle, createArticle, addImage, removeImage, updateImageCaption } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !currentArticle) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      addImage(currentArticle.id, url, currentArticle.images.length);
    });
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files?.length || !currentArticle) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      addImage(currentArticle.id, url, currentArticle.images.length);
    });
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  if (!currentArticle) {
    return (
      <div className="text-gray-500 text-center py-20">请先选择或创建一篇笔记</div>
    );
  }

  const images = [...currentArticle.images].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-5xl">
        <ArticleSelector
          articles={articles}
          currentArticle={currentArticle}
          onSelect={setCurrentArticle}
          onCreate={createArticle}
        />
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 overflow-hidden">
          <div className="p-6 border-b border-red-50">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">图片排版</h2>
            <p className="text-sm text-gray-500 mb-4">
              小红书推荐 3:4 竖版图片，推荐尺寸 1080×1440px。拖拽可调整顺序。
            </p>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-red-200 rounded-xl p-8 text-center cursor-pointer hover:bg-red-50/50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="mx-auto text-[#fe2c55] mb-2" size={40} />
              <p className="text-gray-600">点击或拖拽图片到此处上传</p>
              <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG、WebP，单张 5MB 内</p>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-3">已上传图片 ({images.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="group relative bg-gray-100 rounded-xl overflow-hidden border-2 border-red-100"
                  style={{ aspectRatio: `${1 / ASPECT_RATIO}` }}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => removeImage(currentArticle.id, img.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <X size={18} />
                    </button>
                    <span className="px-2 py-1 bg-white/90 rounded text-sm font-medium">
                      #{idx + 1}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                    <input
                      type="text"
                      placeholder="图片说明..."
                      value={img.caption || ''}
                      onChange={(e) => updateImageCaption(currentArticle.id, img.id, e.target.value)}
                      className="w-full text-xs text-white bg-white/20 rounded px-2 py-1 placeholder-white/70 border-0 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}
