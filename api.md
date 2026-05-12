# Gameszone Web API 文档 v1.0

---

## 一、前言

### 1.1 系统边界

- **内容服务端点**：`{origin}/glib/*`，其中 `{origin}` 为当前部署域名（`window.location.origin`），动态获取

---

## 二、内容 API（glib）

游戏内容相关接口，baseUrl 为 `window.location.origin`（如 `https://example.com`）。

### 2.1 获取首页数据

获取首页分类及每个分类下的游戏列表。

**请求地址**

```
GET {baseUrl}/glib/home
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 | 备注 |
|------|------|------|------|------|
| psize | int | 否 | 分类数量 | 默认 12 |

**响应示例**

```json
{
  "dlist": [
    {
      "mid": "90",
      "mname": "Hot Games",
      "dlist": [
        {
          "gid": "1001",
          "name": "Game Title",
          "icon": "https://example.com/icon.png",
          "bannber": "https://example.com/banner.png",
          "cid": "90"
        }
      ]
    }
  ]
}
```

**响应字段说明**

| 参数 | 描述 |
|------|------|
| dlist[] | 分类列表 |
| dlist[].mid | 分类 ID |
| dlist[].mname | 分类名称 |
| dlist[].dlist[] | 该分类下的游戏列表 |
| dlist[].dlist[].gid | 游戏 ID |
| dlist[].dlist[].name | 游戏名称 |
| dlist[].dlist[].icon | 游戏图标 URL |
| dlist[].dlist[].bannber | 游戏横幅 URL |
| dlist[].dlist[].cid | 游戏所属分类 ID |

---

### 2.2 获取分类列表

获取指定分类下的游戏列表（支持分页）。

**请求地址**

```
GET {baseUrl}/glib/types
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 | 备注 |
|------|------|------|------|------|
| tid | string | 是 | 分类 ID | 如 `"2"`、`"90"`、`"235"` |
| size | int | 否 | 每页数量 | 默认 24 |
| pg | int | 否 | 页码 | 从 1 开始 |

**响应示例**

```json
{
  "data": [
    {
      "gid": "1001",
      "name": "Game Title",
      "icon": "https://example.com/icon.png",
      "bannber": "https://example.com/banner.png",
      "tid": "90"
    }
  ],
  "catename": "Hot Games"
}
```

**响应字段说明**

| 参数 | 描述 |
|------|------|
| data[] | 游戏列表 |
| data[].gid | 游戏 ID |
| data[].name | 游戏名称 |
| data[].icon | 游戏图标 URL |
| data[].bannber | 游戏横幅 URL |
| data[].tid | 分类 ID |
| catename | 分类名称 |

---

### 2.3 获取游戏详情

获取单个游戏的详细信息及推荐游戏列表。

**请求地址**

```
GET {baseUrl}/glib/info
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 | 备注 |
|------|------|------|------|------|
| tid | string | 是 | 分类 ID | 默认 `"90"` |
| gid | string | 是 | 游戏 ID | 默认 `"2176"` |
| _ | int | 否 | 时间戳 | 防止缓存 |

**响应示例**

```json
{
  "data": {
    "gid": "1001",
    "name": "Game Title",
    "icon": "https://example.com/icon.png",
    "bannber": "https://example.com/banner.png",
    "cid": "90",
    "catename": "Hot Games",
    "tagline": "Fun game for everyone!",
    "desc": "This is a detailed description of the game...",
    "playurl": "https://example.com/play/game1001"
  },
  "dlist": [
    {
      "gid": "1002",
      "name": "Recommended Game",
      "icon": "https://example.com/icon2.png"
    }
  ]
}
```

**响应字段说明**

| 参数 | 描述 |
|------|------|
| data | 游戏详情对象 |
| data.gid | 游戏 ID |
| data.name | 游戏名称 |
| data.icon | 游戏图标 URL |
| data.bannber | 游戏横幅 URL |
| data.cid | 分类 ID |
| data.catename | 分类名称 |
| data.tagline | 游戏标语 |
| data.desc | 游戏描述（HTML） |
| data.playurl | 游戏播放/跳转 URL |
| dlist[] | 推荐游戏列表 |

---

### 2.4 分类 ID 对照表

| 分类名称 | 分类 ID |
|----------|---------|
| Hot Games | 90 |
| Puzzle | 2 |
| Casual Games | 235 |
| Arcade Games | 94 |
| Girl Games | 46 |
| Adventure Games | 14 |
| Action Games | 91 |
| Sports Games | 32 |
| Racing Games | 41 |

---

## 三、前端页面路由

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `index.html` | 展示全部分类及游戏 |
| 分类页 | `types.html?utm_medium={tid}` | 按分类浏览游戏 |
| 详情页 | `games.html?utm_medium={tid}&utm_source={gid}` | 游戏详情及推荐 |
| 等待页 | `play.html` | 游戏启动等待（从详情页跳转） |

### URL 参数约定

| 参数 | 说明 |
|------|------|
| utm_medium | 分类 ID（兼容旧参数 tid） |
| utm_source | 游戏 ID（兼容旧参数 gid） |

---
