import os
import uuid
import traceback

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from xhs_service import xhs_service
from gemini_service import gemini_service

app = FastAPI(title="小红书运营系统 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Models ----------

class CookieInput(BaseModel):
    cookie: str

class CreateNoteInput(BaseModel):
    title: str
    desc: str = ""
    image_paths: list[str] = []
    topics: list[dict] = []
    is_private: bool = False

class SearchInput(BaseModel):
    keyword: str
    page: int = 1
    sort: str = "general"

class CommentInput(BaseModel):
    content: str

class ProxyInput(BaseModel):
    proxy: str

class AIBeautifyInput(BaseModel):
    content: str

class AIGenerateInput(BaseModel):
    topic: str

class AINewsInput(BaseModel):
    news: str


# ---------- Health ----------

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "connected": xhs_service.is_connected,
        "sdk": "ReaJason/xhs 0.2.13",
        "auth_method": "cookie",
        "gemini_configured": gemini_service.is_configured,
        "proxy": xhs_service.proxy or None,
    }


# ---------- Proxy ----------

@app.post("/api/proxy")
def set_proxy(body: ProxyInput):
    xhs_service.set_proxy(body.proxy)
    return {"success": True, "proxy": xhs_service.proxy or None}

@app.delete("/api/proxy")
def clear_proxy():
    xhs_service.set_proxy("")
    return {"success": True}


# ---------- Auth ----------

@app.post("/api/auth/cookie")
def set_cookie(body: CookieInput):
    cookie = body.cookie.strip()
    if not cookie:
        raise HTTPException(400, "Cookie 不能为空")
    result = xhs_service.connect(cookie)
    if not result["success"]:
        raise HTTPException(400, result["error"])
    return result

@app.get("/api/auth/status")
def auth_status():
    if not xhs_service.is_connected:
        return {"authenticated": False, "user_info": None}
    return {
        "authenticated": True,
        "user_info": xhs_service.user_info,
    }

@app.post("/api/auth/logout")
def logout():
    xhs_service.disconnect()
    return {"success": True}


# ---------- User ----------

@app.get("/api/user/info")
def get_self_info():
    try:
        info = xhs_service.get_self_info()
        return {"success": True, "data": info}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))


# ---------- Notes ----------

@app.get("/api/notes/self")
def get_my_notes(cursor: str = ""):
    try:
        data = xhs_service.get_user_notes(cursor=cursor)
        return {"success": True, "data": data}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

@app.get("/api/notes/stats")
def get_notes_stats():
    try:
        data = xhs_service.get_notes_summary()
        return {"success": True, "data": data}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

@app.get("/api/dashboard")
def get_dashboard():
    try:
        data = xhs_service.get_dashboard_data()
        return {"success": True, "data": data}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

@app.get("/api/notes/{note_id}")
def get_note(note_id: str):
    try:
        data = xhs_service.get_note_by_id(note_id)
        return {"success": True, "data": data}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

@app.get("/api/notes/{note_id}/comments")
def get_note_comments(note_id: str, cursor: str = ""):
    try:
        data = xhs_service.get_note_comments(note_id, cursor=cursor)
        return {"success": True, "data": data}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

@app.post("/api/notes/search")
def search_notes(body: SearchInput):
    try:
        data = xhs_service.search_notes(body.keyword, page=body.page, sort=body.sort)
        return {"success": True, "data": data}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

@app.post("/api/notes")
def create_note(body: CreateNoteInput):
    if not body.title.strip():
        raise HTTPException(400, "标题不能为空")
    try:
        data = xhs_service.create_image_note(
            title=body.title,
            desc=body.desc,
            image_paths=body.image_paths,
            topics=body.topics,
            is_private=body.is_private,
        )
        return {"success": True, "data": data}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))


# ---------- Upload ----------

@app.post("/api/upload")
async def upload_images(files: list[UploadFile] = File(...)):
    saved = []
    for f in files:
        content = await f.read()
        ext = os.path.splitext(f.filename or "img.jpg")[1] or ".jpg"
        filename = f"{uuid.uuid4().hex}{ext}"
        path = xhs_service.save_upload_file(filename, content)
        saved.append({"filename": filename, "path": path, "size": len(content)})
    return {"success": True, "files": saved}


# ---------- Topics ----------

@app.get("/api/topics/suggest")
def suggest_topics(keyword: str = ""):
    if not keyword:
        return {"success": True, "data": []}
    try:
        data = xhs_service.get_suggest_topics(keyword)
        return {"success": True, "data": data}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))


# ---------- Interactions ----------

@app.post("/api/notes/{note_id}/like")
def like_note(note_id: str):
    try:
        data = xhs_service.like_note(note_id)
        return {"success": True, "data": data}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

@app.post("/api/notes/{note_id}/collect")
def collect_note(note_id: str):
    try:
        data = xhs_service.collect_note(note_id)
        return {"success": True, "data": data}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

@app.post("/api/notes/{note_id}/comment")
def comment_note(note_id: str, body: CommentInput):
    try:
        data = xhs_service.comment_note(note_id, body.content)
        return {"success": True, "data": data}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))


# ---------- AI / Gemini ----------

@app.post("/api/ai/beautify")
def ai_beautify(body: AIBeautifyInput):
    if not body.content.strip():
        raise HTTPException(400, "内容不能为空")
    try:
        result = gemini_service.beautify(body.content)
        return {"success": True, "data": result}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

@app.post("/api/ai/generate")
def ai_generate(body: AIGenerateInput):
    if not body.topic.strip():
        raise HTTPException(400, "主题不能为空")
    try:
        result = gemini_service.generate(body.topic)
        return {"success": True, "data": result}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

@app.post("/api/ai/news")
def ai_fetch_news(body: AIGenerateInput):
    if not body.topic.strip():
        raise HTTPException(400, "主题不能为空")
    try:
        result = gemini_service.fetch_news(body.topic)
        return {"success": True, "data": result}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

@app.post("/api/ai/news-to-note")
def ai_news_to_note(body: AINewsInput):
    if not body.news.strip():
        raise HTTPException(400, "新闻内容不能为空")
    try:
        result = gemini_service.news_to_note(body.news)
        return {"success": True, "data": result}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVER_PORT", "3001"))
    print(f"\n  小红书运营系统 API 服务器 (xhs SDK)")
    print(f"  ➜  运行于: http://localhost:{port}")
    print(f"  ➜  API 文档: http://localhost:{port}/docs")
    print(f"  ➜  认证方式: Cookie（从浏览器复制）\n")
    uvicorn.run(app, host="0.0.0.0", port=port)
