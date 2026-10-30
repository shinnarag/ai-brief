"""Regression tests for Top 5's exact-story destination, including its index."""
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "site"))
from build import redistribute_top5


class Top5DestinationTests(unittest.TestCase):
    def test_similar_gemini_titles_choose_exact_card_and_index(self):
        carbon = "Gemini 4 Carbon, 장기 코딩·보안 작업용 모델을 제한 공개해요 (10/28 · 누락 보완)"
        app = "Gemini 앱, 문서·표·슬라이드를 대화 안에서 만들고 직접 고쳐요 (10/29)"
        for titles in ([carbon, app], [app, carbon]):
            with self.subTest(order=titles):
                cards = [{"title": title, "bullets": []} for title in titles]
                sections = [
                    ("top-5", "🔥 Top 5", [{"title": app}, {"title": carbon}]),
                    ("models", "📦 모델 · 플랫폼", cards),
                ]
                result = redistribute_top5(sections)
                for teaser in result[0][2]:
                    destination = result[1][2][teaser["dest_card_n"] - 1]
                    self.assertEqual(teaser["title"], destination["title"])
                self.assertEqual(len(result[1][2]), 2)


if __name__ == "__main__":
    unittest.main()
