// 奖品配置 (总计59份奖品给59人)
const prizes = [
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
const participants = [
    '车玉龙', '程康', '赵笙薇', '杨斌', '张国英', '张万宁', '梁法栋', '李天', '林野', '经纬',
    '马景灏', '卢秋霞', '张红雨', '李罗', '时保卓', '秦基伟', '吴林', '李鹏东', '胡洪鹏', '赵绵武',
    '刘冲', '李金娜', '王振杰', '王力丹', '魏来', '张鹏', '那兴俊', '乔禹', '刘赛', '吴悉恺',
    '沈立伟', '张毅', '谢建伟', '郝立军', '张晓辉', '陶娜', '姚国辉', '肖称华', '阮仕坤', '曹帅',
    '王卿', '徐婷', '吴鹏', '武金鹏', '祝新民', '梁亮', '张维沂', '黄欢', '孙玲', '宋浩',
    '李项喆', '王圆丽', '陈明威', '刘洋', '刘文霞', '梁鑫', '杨学伶', '刘鹏鹏', '魏文龙'
];

// 全局变量
let currentUser = null;
let isSpinning = false;
let prizePool = [];

// IndexedDB 初始化
class LotteryDB {
    constructor() {
        this.dbName = 'LotteryDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 创建抽奖记录表
                if (!db.objectStoreNames.contains('records')) {
                    const recordStore = db.createObjectStore('records', { keyPath: 'id' });
                    recordStore.createIndex('userName', 'userName', { unique: false });
                    recordStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // 创建奖品池表
                if (!db.objectStoreNames.contains('prizePool')) {
                    db.createObjectStore('prizePool', { keyPath: 'id' });
                }
            };
        });
    }

    async addRecord(record) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['records'], 'readwrite');
            const store = transaction.objectStore('records');
            const request = store.add({
                ...record,
                id: Date.now() + Math.random(),
                timestamp: new Date().toISOString()
            });
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getRecordByUserName(userName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['records'], 'readonly');
            const store = transaction.objectStore('records');
            const index = store.index('userName');
            const request = index.get(userName);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllRecords() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['records'], 'readonly');
            const store = transaction.objectStore('records');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updatePrizePool(pool) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['prizePool'], 'readwrite');
            const store = transaction.objectStore('prizePool');
            const request = store.put({
                id: 'current',
                pool: pool,
                timestamp: new Date().toISOString()
            });
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getPrizePool() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['prizePool'], 'readonly');
            const store = transaction.objectStore('prizePool');
            const request = store.get('current');
            
            request.onsuccess = () => resolve(request.result ? request.result.pool : null);
            request.onerror = () => reject(request.error);
        });
    }
}

const lotteryDB = new LotteryDB();
const cloudManager = new CloudDataManager();

// 初始化奖品池
function initPrizePool() {
    prizePool = [];
    prizes.forEach((prize, index) => {
        for (let i = 0; i < prize.count; i++) {
            prizePool.push({
                ...prize,
                uniqueId: `${prize.name}_${i}`,
                originalIndex: index
            });
        }
    });
}

// Fisher-Yates 洗牌算法
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 生成转盘
function generateWheel() {
    const wheel = document.getElementById('wheel');
    wheel.innerHTML = '';
    
    // 创建SVG转盘
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '320');
    svg.setAttribute('height', '320');
    svg.setAttribute('viewBox', '0 0 320 320');
    svg.style.width = '100%';
    svg.style.height = '100%';
    
    const centerX = 160;
    const centerY = 160;
    const radius = 150;
    const totalSections = prizes.length;
    const anglePerSection = 360 / totalSections;
    
    prizes.forEach((prize, index) => {
        const startAngle = index * anglePerSection - 90; // -90度让第一个扇形从顶部开始
        const endAngle = (index + 1) * anglePerSection - 90;
        
        // 计算扇形路径
        const startAngleRad = startAngle * Math.PI / 180;
        const endAngleRad = endAngle * Math.PI / 180;
        
        const x1 = centerX + radius * Math.cos(startAngleRad);
        const y1 = centerY + radius * Math.sin(startAngleRad);
        const x2 = centerX + radius * Math.cos(endAngleRad);
        const y2 = centerY + radius * Math.sin(endAngleRad);
        
        const largeArcFlag = anglePerSection > 180 ? 1 : 0;
        
        const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');
        
        // 创建扇形
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', prize.color);
        path.setAttribute('stroke', 'white');
        path.setAttribute('stroke-width', '2');
        svg.appendChild(path);
        
        // 添加文字
        const textAngle = startAngle + anglePerSection / 2;
        const textAngleRad = textAngle * Math.PI / 180;
        const textRadius = radius * 0.7;
        const textX = centerX + textRadius * Math.cos(textAngleRad);
        const textY = centerY + textRadius * Math.sin(textAngleRad);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', textX);
        text.setAttribute('y', textY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', 'white');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('transform', `rotate(${textAngle + 90}, ${textX}, ${textY})`);
        text.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
        
        // 长文字分行处理
        const words = prize.name.split('');
        if (words.length > 4) {
            const mid = Math.ceil(words.length / 2);
            const tspan1 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            tspan1.setAttribute('x', textX);
            tspan1.setAttribute('dy', '-0.5em');
            tspan1.textContent = words.slice(0, mid).join('');
            
            const tspan2 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            tspan2.setAttribute('x', textX);
            tspan2.setAttribute('dy', '1em');
            tspan2.textContent = words.slice(mid).join('');
            
            text.appendChild(tspan1);
            text.appendChild(tspan2);
        } else {
            text.textContent = prize.name;
        }
        
        svg.appendChild(text);
    });
    
    wheel.appendChild(svg);
}

// 验证姓名输入
function verifyUserName() {
    const nameInput = document.getElementById('nameInput');
    const nameError = document.getElementById('nameError');
    const submitBtn = document.getElementById('submitName');
    const userName = nameInput.value.trim();
    
    if (!userName) {
        nameError.textContent = '请输入姓名';
        nameError.classList.remove('hidden');
        return;
    }
    
    // 检查是否在参与者名单中
    if (!participants.includes(userName)) {
        nameError.textContent = '姓名不在名单中，请核对后重新输入';
        nameError.classList.remove('hidden');
        nameInput.focus();
        return;
    }
    
    // 验证通过
    nameError.classList.add('hidden');
    selectUser(userName);
}

// 监听回车键提交
function setupInputListeners() {
    const nameInput = document.getElementById('nameInput');
    const submitBtn = document.getElementById('submitName');
    
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            verifyUserName();
        }
    });
    
    submitBtn.addEventListener('click', verifyUserName);
    
    // 输入时清除错误提示
    nameInput.addEventListener('input', () => {
        const nameError = document.getElementById('nameError');
        nameError.classList.add('hidden');
    });
}

// 选择用户
async function selectUser(userName) {
    currentUser = userName;
    
    // 检查是否已经抽奖（云端优先）
    try {
        // 先检查云端记录
        const cloudRecords = await cloudManager.readRecords();
        const cloudExisting = cloudRecords.find(r => r.userName === userName);
        
        if (cloudExisting) {
            showAlreadyDrawn(userName, cloudExisting.prize);
            return;
        }
        
        // 再检查本地记录
        const existingRecord = await lotteryDB.getRecordByUserName(userName);
        if (existingRecord) {
            showAlreadyDrawn(userName, existingRecord.prize);
            return;
        }
    } catch (error) {
        console.error('查询记录失败:', error);
    }
    
    // 进入抽奖界面
    document.getElementById('verifyPage').classList.add('hidden');
    document.getElementById('wheelPage').classList.remove('hidden');
    document.getElementById('userName').textContent = userName;
}

// 显示已抽奖页面
function showAlreadyDrawn(userName, prize) {
    document.getElementById('verifyPage').classList.add('hidden');
    document.getElementById('alreadyDrawnPage').classList.remove('hidden');
    document.getElementById('drawnUserName').textContent = userName;
    document.getElementById('drawnPrize').textContent = prize;
}

// 开始抽奖
async function startLottery() {
    if (isSpinning) return;
    
    isSpinning = true;
    const startBtn = document.getElementById('startBtn');
    startBtn.textContent = '抽奖中...';
    startBtn.style.cursor = 'not-allowed';
    
    // 获取或初始化奖品池
    let currentPool = await lotteryDB.getPrizePool();
    if (!currentPool || currentPool.length === 0) {
        initPrizePool();
        currentPool = shuffleArray(prizePool);
        await lotteryDB.updatePrizePool(currentPool);
    }
    
    // 确保有奖品可抽
    if (currentPool.length === 0) {
        alert('抱歉，奖品已抽完！');
        isSpinning = false;
        startBtn.textContent = '开始';
        startBtn.style.cursor = 'pointer';
        return;
    }
    
    // 随机选择一个奖品
    const prizeIndex = Math.floor(Math.random() * currentPool.length);
    const selectedPrize = currentPool[prizeIndex];
    
    // 计算转盘角度
    const targetAngle = 360 * 5 + (selectedPrize.originalIndex * (360 / prizes.length) + 360 / prizes.length / 2);
    
    // 旋转转盘
    const wheel = document.getElementById('wheel');
    wheel.style.transform = `rotate(${targetAngle}deg)`;
    
    // 等待动画完成
    setTimeout(async () => {
        // 更新奖品池
        currentPool.splice(prizeIndex, 1);
        await lotteryDB.updatePrizePool(currentPool);
        
        // 保存抽奖记录（云端优先）
        try {
            const cloudSaveResult = await cloudManager.saveRecord(
                currentUser, 
                selectedPrize.name, 
                selectedPrize.uniqueId
            );
            
            if (cloudSaveResult) {
                console.log('云端保存成功');
            }
        } catch (error) {
            console.warn('云端保存失败，使用本地存储:', error);
        }
        
        // 本地备份保存
        await lotteryDB.addRecord({
            userName: currentUser,
            prize: selectedPrize.name,
            prizeId: selectedPrize.uniqueId
        });
        
        // 显示结果
        showResult(selectedPrize.name);
        
        // 重置状态
        isSpinning = false;
        startBtn.textContent = '开始';
        startBtn.style.cursor = 'pointer';
    }, 4000);
}

// 显示抽奖结果
function showResult(prizeName) {
    document.getElementById('wheelPage').classList.add('hidden');
    document.getElementById('resultPage').classList.remove('hidden');
    document.getElementById('prizeDisplay').textContent = prizeName;
    
    // 创建彩带效果
    createConfetti();
}

// 创建彩带效果
function createConfetti() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }, i * 30);
    }
}

// 分享结果
function shareResult() {
    const prize = document.getElementById('prizeDisplay').textContent;
    const text = `我在幸运大转盘活动中获得了【${prize}】！🎉`;
    
    if (navigator.share) {
        navigator.share({
            title: '幸运大转盘',
            text: text
        }).catch(err => console.log('分享失败:', err));
    } else {
        // 复制到剪贴板
        navigator.clipboard.writeText(text).then(() => {
            alert('分享内容已复制到剪贴板！');
        }).catch(() => {
            alert('分享内容：' + text);
        });
    }
}

// 显示规则
function showRules() {
    document.getElementById('rulesModal').classList.remove('hidden');
}

// 隐藏规则
function hideRules() {
    document.getElementById('rulesModal').classList.add('hidden');
}

// 退出登录
function logout() {
    currentUser = null;
    
    // 隐藏所有页面
    document.getElementById('wheelPage').classList.add('hidden');
    document.getElementById('resultPage').classList.add('hidden');
    document.getElementById('alreadyDrawnPage').classList.add('hidden');
    
    // 显示验证页面
    document.getElementById('verifyPage').classList.remove('hidden');
    
    // 重置转盘
    document.getElementById('wheel').style.transform = 'rotate(0deg)';
}

// 初始化应用
async function initApp() {
    try {
        await lotteryDB.init();
        generateWheel();
        setupInputListeners();
        
        // 绑定开始按钮事件
        document.getElementById('startBtn').addEventListener('click', startLottery);
        
        console.log('抽奖应用初始化成功');
    } catch (error) {
        console.error('应用初始化失败:', error);
        alert('应用初始化失败，请刷新页面重试');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);
