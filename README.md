# Ruby 互動煉金術 — SITCON 2026 攤位

**Ruby Taiwan × SITCON 2026** 攤位互動挑戰遊戲。

🌐 **https://sitcon2026-booth.ruby.tw**

---

## 這是什麼？

一個跑在手機瀏覽器上的 Ruby 互動答題遊戲，讓 SITCON 參加者能在攤位體驗真實執行 Ruby 程式碼的樂趣。

玩家連續回答 10 道 Ruby 題目，每題最多 3 次機會，全部完成後可至攤位領取小禮物。

### 遊戲流程

```
Phase 1：答題
  10 題連續挑戰（3 Easy → 5 Medium → 2 Hard）
  答對自動進入下一題；答錯最多 3 次，超過後顯示正確答案
        ↓
Phase 2：成績單
  1080×1080 成績卡圖片，可分享至 Instagram
        ↓
Phase 3：填寫資料
  暱稱、Email、手機、學校
  可選訂閱 Ruby Taiwan 電子報
        ↓
Phase 4：完成證明
  通關代碼 + QR Code + 動態背景
  出示給攤位工作人員即完成大地遊戲
```

---

## 技術棧

| 項目 | 說明 |
|------|------|
| [Jekyll 4.4](https://jekyllrb.com/) | 靜態網站產生器 |
| [Tailwind CSS v4](https://tailwindcss.com/) | 樣式（via `tailwindcss-ruby` gem）|
| [Ruby WASM](https://github.com/ruby/ruby.wasm) | 在瀏覽器中執行真實 Ruby 4.0 |
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) | QR Code 產生 |
| [listmonk](https://listmonk.app/) | 電子報訂閱後台 |
| HTML Canvas API | 成績單圖片繪製 |
| Web Share API | 手機原生分享至 Instagram |

---

## 本地開發

### 前置需求

- Ruby（建議用 [rbenv](https://github.com/rbenv/rbenv) 管理）
- Bundler

### 安裝與啟動

```bash
git clone https://github.com/rubytaiwan/sitcon-2026-booth
cd sitcon-2026-booth
bundle install
bundle exec jekyll serve
```

瀏覽器開啟 http://127.0.0.1:4000

> `_config.yml` 的修改需要重啟 server 才會生效。

### 環境設定

複製本地設定範本（已在 `.gitignore`，不會被 commit）：

```bash
cp _config.local.yml.example _config.local.yml  # 如有需要再調整
```

---

## 題庫

題目定義在 `_data/tasks.yml`，分為三個難度：

- **Easy**（5 題）：`.next`、`.upcase`、`.reverse`、`.sum`、`.capitalize`
- **Medium**（7 題）：`.class`、`.to_i`、`.strip`、`.length`、`.max`、`.first`、`* 2`
- **Hard**（3 題）：`.odd?`、`.swapcase`、`.frozen?`

每次遊戲從中隨機抽出 3 Easy + 5 Medium + 2 Hard，共 10 題。

新增題目只需在 `_data/tasks.yml` 加入對應格式的 YAML，並在 `index.html` 的 `EXPECTED_MAP` 補上 JS 計算函數即可。

---

## 部署

本專案部署於 **https://sitcon2026-booth.ruby.tw**。

訂閱 API 串接 [Ruby Taiwan listmonk](https://edm.ruby.tw)，跨 origin 設定已在 listmonk 後台的 **Settings → Security → CORS Allowed origins** 完成。

---

## 授權

MIT License © Ruby Taiwan
