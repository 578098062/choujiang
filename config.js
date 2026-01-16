// 配置文件 - 选择云端存储方案

// 选择存储方案: 'github', 'gitee', 'jsonbin', 'local'
const STORAGE_TYPE = 'jsonbin'; // 默认使用免费JSON存储

// GitHub配置
const GITHUB_CONFIG = {
    repoOwner: 'your-username',      // 替换为你的GitHub用户名
    repoName: 'lucky-wheel-data',    // 数据仓库名
    dataFile: 'lottery-records.json', // 数据文件名
    token: 'your-github-token'       // GitHub Personal Access Token
};

// Gitee配置
const GITEE_CONFIG = {
    repoOwner: 'your-username',      // 替换为你的Gitee用户名
    repoName: 'lucky-wheel-data',    // 数据仓库名
    dataFile: 'lottery-records.json', // 数据文件名
    token: 'your-gitee-token'        // Gitee Personal Access Token
};

// JSONBin配置（推荐，完全免费）
const JSONBIN_CONFIG = {
    apiKey: '$2a$10$h8vxevEkPmm6QekSX6y3uuIM5wOPUgT0mTx02sZzEEh8GlNhaptjG',   // 例如：60f1a2b3c4d5e6f7g8h9i0j1k2l3m4n5
    binId: '6969b59a43b1c97be933c359'                 // 例如：6969b59a43b1c97be933c359
};

// 初始化云数据管理器
function initCloudManager() {
    if (STORAGE_TYPE === 'github') {
        const manager = new CloudDataManager();
        Object.assign(manager, GITHUB_CONFIG);
        return manager;
    } else if (STORAGE_TYPE === 'gitee') {
        const manager = new CloudDataManager();
        Object.assign(manager, GITEE_CONFIG);
        return manager;
    } else if (STORAGE_TYPE === 'jsonbin') {
        const manager = new CloudDataManager();
        Object.assign(manager, JSONBIN_CONFIG);
        return manager;
    } else {
        // 使用本地存储
        return {
            readRecords: () => [],
            saveRecord: () => false
        };
    }
}

// 创建数据管理器
let cloudManager = null;

// 导出配置
window.STORAGE_CONFIG = {
    type: STORAGE_TYPE,
    github: GITHUB_CONFIG,
    gitee: GITEE_CONFIG,
    jsonbin: JSONBIN_CONFIG
};