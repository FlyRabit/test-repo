import os
import tempfile
import traceback
from xhs import XhsClient
from xhs.help import sign as _xhs_sign


def xhs_sign(url, data=None, a1="", **kwargs):
    return _xhs_sign(url, data, a1=a1)


class XhsService:
    def __init__(self):
        self._client: XhsClient | None = None
        self._cookie: str = ""
        self._user_info: dict | None = None
        self._temp_dir = tempfile.mkdtemp(prefix="xhs_uploads_")

    @property
    def is_connected(self) -> bool:
        return self._client is not None

    @property
    def cookie(self) -> str:
        return self._cookie

    @property
    def user_info(self) -> dict | None:
        return self._user_info

    def connect(self, cookie: str) -> dict:
        try:
            client = XhsClient(cookie=cookie, sign=xhs_sign)
            self._client = client
            self._cookie = cookie

            info = None
            for method_name in ("get_self_info2", "get_self_info"):
                try:
                    info = getattr(client, method_name)()
                    break
                except Exception as inner_e:
                    print(f"{method_name} failed: {inner_e}")

            self._user_info = info
            return {"success": True, "user_info": info}
        except Exception as e:
            traceback.print_exc()
            return {"success": False, "error": f"连接失败: {str(e)}"}

    def disconnect(self):
        self._client = None
        self._cookie = ""
        self._user_info = None

    def _require_client(self) -> XhsClient:
        if not self._client:
            raise RuntimeError("未连接小红书账号，请先设置 Cookie")
        return self._client

    def get_self_info(self) -> dict:
        client = self._require_client()
        info = client.get_self_info()
        self._user_info = info
        return info

    def get_user_notes(self, user_id: str = "", cursor: str = "") -> dict:
        client = self._require_client()
        if not user_id and self._user_info:
            basic_info = self._user_info.get("basic_info", {})
            user_id = basic_info.get("red_id", "") or self._user_info.get("user_id", "")
        return client.get_user_notes(user_id, cursor=cursor)

    def get_note_by_id(self, note_id: str) -> dict:
        client = self._require_client()
        return client.get_note_by_id(note_id)

    def get_notes_statistics(self) -> dict:
        client = self._require_client()
        return client.get_notes_summary()

    def get_note_comments(self, note_id: str, cursor: str = "") -> dict:
        client = self._require_client()
        return client.get_note_comments(note_id, cursor=cursor)

    def search_notes(self, keyword: str, page: int = 1, sort: str = "general") -> dict:
        client = self._require_client()
        return client.get_note_by_keyword(keyword, page=page, sort=sort)

    def get_suggest_topics(self, keyword: str) -> dict:
        client = self._require_client()
        return client.get_suggest_topic(keyword)

    def create_image_note(
        self,
        title: str,
        desc: str,
        image_paths: list[str],
        topics: list[dict] | None = None,
        is_private: bool = False,
    ) -> dict:
        client = self._require_client()
        return client.create_image_note(
            title=title,
            desc=desc,
            files=image_paths,
            topics=topics or [],
            is_private=is_private,
        )

    def like_note(self, note_id: str) -> dict:
        client = self._require_client()
        return client.like_note(note_id)

    def collect_note(self, note_id: str) -> dict:
        client = self._require_client()
        return client.collect_note(note_id)

    def comment_note(self, note_id: str, content: str) -> dict:
        client = self._require_client()
        return client.comment_note(note_id, content)

    def save_upload_file(self, filename: str, content: bytes) -> str:
        filepath = os.path.join(self._temp_dir, filename)
        with open(filepath, "wb") as f:
            f.write(content)
        return filepath

    def cleanup_temp_files(self):
        import shutil
        if os.path.exists(self._temp_dir):
            shutil.rmtree(self._temp_dir, ignore_errors=True)
        self._temp_dir = tempfile.mkdtemp(prefix="xhs_uploads_")


xhs_service = XhsService()
