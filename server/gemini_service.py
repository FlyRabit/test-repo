import os
import json
import traceback

import google.generativeai as genai

PROMPTS = {
    "beautify": """你是一位资深小红书博主，擅长将普通文案改写成小红书爆款风格。

要求：
- 标题：吸引眼球，可使用 emoji，控制在 20 字以内
- 正文：口语化、有感染力，适当使用 emoji，分段清晰
- 结尾加上 3-5 个相关话题标签（#话题#）
- 保留原文核心信息，不编造事实

请将以下内容改写为小红书风格：

{content}

请以 JSON 格式返回：{{"title": "标题", "content": "正文内容", "tags": ["话题1", "话题2"]}}""",

    "generate": """你是一位资深小红书内容创作者。请根据以下主题生成一篇小红书笔记。

主题：{topic}

要求：
- 标题：吸引眼球、有悬念或共鸣感，可使用 emoji，控制在 20 字以内
- 正文：200-500 字，口语化，有真实感，适当使用 emoji 增加亲和力
- 分段清晰，可以使用小标题或序号
- 结尾加上 3-5 个相关话题标签
- 风格要真实、有温度，像朋友聊天一样

请以 JSON 格式返回：{{"title": "标题", "content": "正文内容", "tags": ["话题1", "话题2"]}}""",

    "news_to_note": """你是一位小红书资讯博主，擅长将新闻资讯转化为轻松易读的小红书笔记。

以下是新闻内容：
{news}

要求：
- 标题：新闻核心 + 吸引力，可使用 emoji，控制在 20 字以内
- 正文：将新闻改写为小红书风格，口语化表达，加入个人观点/点评
- 200-400 字，分段清晰
- 结尾加话题标签
- 不传播谣言，注明"资讯整理"

请以 JSON 格式返回：{{"title": "标题", "content": "正文内容", "tags": ["话题1", "话题2"]}}""",

    "fetch_news": """请帮我搜索并整理关于"{topic}"的最新资讯或热点话题。

要求：
- 提供 3-5 条相关要点
- 每条包含：标题、简短摘要（50 字内）
- 标注这些信息是基于你的知识（截止训练日期）

请以 JSON 格式返回：{{"news": [{{"title": "标题", "summary": "摘要"}}, ...]}}""",
}


class GeminiService:
    def __init__(self):
        self._model = None
        self._api_key = ""

    def _get_model(self):
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            raise RuntimeError("未配置 GEMINI_API_KEY，请在环境变量或 .env 中设置")
        if api_key != self._api_key or self._model is None:
            genai.configure(api_key=api_key)
            self._model = genai.GenerativeModel("gemini-2.0-flash")
            self._api_key = api_key
        return self._model

    @property
    def is_configured(self) -> bool:
        return bool(os.getenv("GEMINI_API_KEY", ""))

    def _call(self, prompt: str) -> dict:
        model = self._get_model()
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.8,
            ),
        )
        text = response.text.strip()
        return json.loads(text)

    def beautify(self, content: str) -> dict:
        prompt = PROMPTS["beautify"].format(content=content)
        return self._call(prompt)

    def generate(self, topic: str) -> dict:
        prompt = PROMPTS["generate"].format(topic=topic)
        return self._call(prompt)

    def news_to_note(self, news: str) -> dict:
        prompt = PROMPTS["news_to_note"].format(news=news)
        return self._call(prompt)

    def fetch_news(self, topic: str) -> dict:
        prompt = PROMPTS["fetch_news"].format(topic=topic)
        return self._call(prompt)


gemini_service = GeminiService()
