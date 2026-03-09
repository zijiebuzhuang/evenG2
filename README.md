# 🌙 MoonWalker

简洁的 AR 漫步导航应用 - 为 Even Realities G2 智能眼镜设计

## 特点

- **极简导航**: 眼镜中只显示方向箭头和距离，无复杂路线图
- **漫步体验**: 跟随方向自由探索，享受漫步的乐趣
- **高德地图**: 集成高德地图 API，搜索全国地点
- **实时更新**: 每 2 秒更新一次方向和距离

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置高德地图 API Key

编辑 `src/main.js`，替换 `AMAP_KEY`:

```javascript
const AMAP_KEY = 'YOUR_AMAP_KEY_HERE';
```

获取 API Key: https://lbs.amap.com/

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 在模拟器中测试

```bash
npm run simulator
```

### 5. 生成 QR 码在真机测试

```bash
npm run qr
```

用 Even App 扫描 QR 码加载应用。

## 使用方法

1. **手机端**: 搜索目的地，点击结果，点击"开始导航"
2. **眼镜端**: 显示方向箭头（↑ ↗ → ↘ ↓ ↙ ← ↖）和距离
3. **交互**: 双击眼镜可切换导航开关
4. **到达**: 距离目的地 50 米内自动提示"已到达"

## 技术栈

- Even Hub SDK 0.0.7
- 高德地图 Web API
- Vite
- 原生 JavaScript

## 项目结构

```
MoonWalker/
├── src/
│   └── main.js          # 主逻辑
├── index.html           # 手机端界面
├── app.json             # EvenHub 应用配置
├── package.json
└── vite.config.js
```

## 开发说明

- 眼镜显示分辨率: 576×288 像素
- 导航更新频率: 2 秒
- 到达判定距离: 50 米
- 方向精度: 8 个方向（45° 间隔）

## License

MIT
