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

// JSONBin配置（使用Master Key访问私有Bin）
const JSONBIN_CONFIG = {
    apiKey: '$2a$10$6DvGREHxbTCwbXxvZCl.OelVu2PuxCldw3Lhugi7w7Gogrqpa94i6',   // X-Master-Key
    binId: '6969b59a43b1c97be933c359'                                           // 您的私有Bin ID
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
        manager.init(JSONBIN_CONFIG.apiKey, JSONBIN_CONFIG.binId);
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