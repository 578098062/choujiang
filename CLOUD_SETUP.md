# 云端数据同步配置指南

## 快速开始（推荐）

### 方案一：JSONBin.io（免费，最简单）

1. **注册账号**
   - 访问 [jsonbin.io](https://jsonbin.io)
   - 使用GitHub账号快速注册

2. **创建存储桶**
   - 注册后自动获得API Key
   - 点击"Create New Bin"
   - 输入初始数据：`{"records": [], "created_at": ""}`
   - 创建后获得Bin ID

3. **配置应用**
   - 打开 `config.js` 文件
   - 修改 `JSONBIN_CONFIG`：
   ```javascript
   const JSONBIN_CONFIG = {
       apiKey: 'your-api-key-here',    // 替换为你的API Key
       binId: 'your-bin-id-here'       // 替换为你的Bin ID
   };
   ```

4. **设置存储类型**
   ```javascript
   const STORAGE_TYPE = 'jsonbin'; // 确保是这个值
   ```

---

### 方案二：GitHub存储

1. **创建数据仓库**
   - 在GitHub创建新仓库 `lucky-wheel-data`
   - 仓库必须为公开

2. **获取Personal Access Token**
   - GitHub → Settings → Developer settings → Personal access tokens
   - 创建新token，勾选 `public_repo` 权限

3. **配置应用**
   ```javascript
   const GITHUB_CONFIG = {
       repoOwner: 'your-github-username',  // 你的GitHub用户名
       repoName: 'lucky-wheel-data',        // 数据仓库名
       token: 'your-github-token'           // Personal Access Token
   };
   ```

4. **设置存储类型**
   ```javascript
   const STORAGE_TYPE = 'github';
   ```

---

### 方案三：Gitee存储

1. **创建数据仓库**
   - 在Gitee创建新仓库 `lucky-wheel-data`
   - 仓库必须为公开

2. **获取Personal Access Token**
   - Gitee → 设置 → 私人令牌
   - 创建新token，勾选 `projects` 权限

3. **配置应用**
   ```javascript
   const GITEE_CONFIG = {
       repoOwner: 'your-gitee-username',   // 你的Gitee用户名
       repoName: 'lucky-wheel-data',        // 数据仓库名
       token: 'your-gitee-token'            // Personal Access Token
   };
   ```

4. **设置存储类型**
   ```javascript
   const STORAGE_TYPE = 'gitee';
   ```

---

## 使用说明

### 配置完成后
1. 将修改后的 `config.js` 上传到服务器
2. 重新部署应用
3. 所有人访问同一页面，数据自动同步

### 数据安全
- 建议使用专门的存储账号
- 不要在代码中暴露敏感信息
- 可以考虑使用环境变量存储token

### 降级机制
- 云端存储失败时自动降级到本地存储
- 确保抽奖功能始终可用
- 本地数据在网络恢复后不会同步到云端

## 测试步骤

1. 配置完成后，用两个不同手机访问
2. 手机A抽完奖
3. 手机B刷新页面，应该能看到A的抽奖记录
4. 手机B尝试抽同样奖品，应该被拒绝

## 故障排除

### 访问GitHub/Gitee API失败
- 检查token是否正确
- 检查仓库是否公开
- 检查网络连接

### JSONBin读取失败
- 检查API Key和Bin ID
- 检查流量是否超限（免费版每月1GB）

### 数据不同步
- 检查存储类型配置
- 查看浏览器控制台错误信息
- 确认配置文件已上传