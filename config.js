// bin 数据结构
// {
//   "records": [],
//   "last_updated": ""
// }
// 配置文件 - 使用 JSONBin.io 存储
const JSONBIN_CONFIG = {
    apiKey: '$2a$10$6DvGREHxbTCwbXxvZCl.OelVu2PuxCldw3Lhugi7w7Gogrqpa94i6',   // X-Master-Key
    binId: '696a040c43b1c97be93443f3'                                           // 您的私有Bin ID
};

// 奖品配置 (系统会自动根据 count 计算权重占比，并确保最小扇形区域为 20 度)
const PRIZES_CONFIG = [
    { name: '重组与突破', count: 20, color: '#FF6B6B' },
    { name: '人类简史', count: 15, color: '#4ECDC4' },
    { name: '时间简史', count: 16, color: '#45B7D1' },
    { name: '颈椎按摩仪', count: 1, color: '#FFA07A' },
    { name: 'WPS大会员', count: 1, color: '#98D8C8' },
    { name: '筋膜枪', count: 1, color: '#FFD93D' },
    { name: '马克杯套装', count: 2, color: '#6C5CE7' },
    { name: '脖枕', count: 2, color: '#A8E6CF' },
    { name: '马克杯红', count: 1, color: '#FFB6C1' }
];

// 人员名单
const PARTICIPANTS_CONFIG = [
    '车玉龙', '程康', '赵笙薇', '杨斌', '张国英', '张万宁', '梁法栋', '李天', '林野', '经纬',
    '马景灏', '卢秋霞', '张红雨', '李罗', '时保卓', '秦基伟', '吴林', '李鹏东', '胡洪鹏', '赵绵武',
    '刘冲', '李金娜', '王振杰', '王力丹', '魏来', '张鹏', '那兴俊', '乔禹', '刘赛', '吴悉恺',
    '沈立伟', '张毅', '谢建伟', '郝立军', '张晓辉', '陶娜', '姚国辉', '肖称华', '阮仕坤', '曹帅',
    '王卿', '徐婷', '吴鹏', '武金鹏', '祝新民', '梁亮', '张维沂', '黄欢', '孙玲', '宋浩',
    '李项喆', '王圆丽', '陈明威', '刘洋', '刘文霞', '梁鑫', '杨学伶', '刘鹏鹏', '魏文龙'
];

// 初始化云数据管理器
function initCloudManager() {
    const manager = new CloudDataManager();
    manager.init(JSONBIN_CONFIG.apiKey, JSONBIN_CONFIG.binId);
    return manager;
}

// 创建数据管理器
let cloudManager = null;

// 导出配置
window.APP_CONFIG = {
    prizes: PRIZES_CONFIG,
    participants: PARTICIPANTS_CONFIG
};

window.STORAGE_CONFIG = {
    type: 'jsonbin',
    jsonbin: JSONBIN_CONFIG
};
