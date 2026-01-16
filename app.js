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

// 初始化奖品池
function initPrizePool() {
    window.prizePool = [];
    prizes.forEach((prize, index) => {
        for (let i = 0; i < prize.count; i++) {
            window.prizePool.push({
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
    
    // 检查是否已经抽奖（只检查云端）
    try {
        const cloudRecords = await cloudManager.readRecords();
        const existingRecord = cloudRecords.find(r => r.userName === userName);
        
        if (existingRecord) {
            showAlreadyDrawn(userName, existingRecord.prize);
            return;
        }
    } catch (error) {
        console.error('查询云端记录失败:', error);
        // 如果云端查询失败，不允许抽奖以保证数据一致性
        alert('无法验证抽奖记录，请检查网络连接后重试');
        return;
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
    
    // 初始化奖品池
    initPrizePool();
    const currentPool = shuffleArray(prizePool);
    
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
        // 保存抽奖记录到云端
        try {
            await cloudManager.saveRecord(
                currentUser, 
                selectedPrize.name, 
                selectedPrize.uniqueId
            );
            console.log('云端保存成功');
        } catch (error) {
            console.error('云端保存失败:', error);
            alert('抽奖记录保存失败，请检查网络连接');
            // 保存失败时不显示结果，允许重新尝试
            isSpinning = false;
            startBtn.textContent = '开始';
            startBtn.style.cursor = 'pointer';
            return;
        }
        
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
        // 初始化云数据管理器
        if (typeof initCloudManager === 'function') {
            cloudManager = initCloudManager();
        }
        
        // 验证云存储配置
        if (!cloudManager || !cloudManager.apiKey || !cloudManager.binId) {
            alert('云存储配置错误，请检查config.js文件');
            return;
        }
        
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
