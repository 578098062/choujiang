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
let availablePrizes = []; // 存储剩余可用的奖品

// 加载剩余奖品池并缓存到内存
async function loadRemainingPrizes() {
    try {
        const remaining = await getRemainingPrizePool();
        if (remaining) {
            availablePrizes = remaining;
            console.log('✅ 奖品池已更新，剩余总数:', availablePrizes.length);
        }
    } catch (error) {
        console.error('更新奖品池失败:', error);
    }
}

// 获取剩余奖品池
async function getRemainingPrizePool() {
    try {
        // 获取已抽奖记录
        const drawnRecords = await cloudManager.readRecords();
        const drawnPrizeIds = new Set(drawnRecords.map(r => r.prizeId));
        
        // 过滤掉已抽的奖品
        const remainingPrizes = [];
        prizes.forEach((prize, index) => {
            for (let i = 0; i < prize.count; i++) {
                const uniqueId = `${prize.name}_${i}`;
                if (!drawnPrizeIds.has(uniqueId)) {
                    remainingPrizes.push({
                        ...prize,
                        uniqueId: uniqueId,
                        originalIndex: index
                    });
                }
            }
        });
        
        return remainingPrizes;
    } catch (error) {
        console.error('获取剩余奖品池失败:', error);
        return null;
    }
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
async function verifyUserName() {
    const nameInput = document.getElementById('nameInput');
    const nameError = document.getElementById('nameError');
    const submitBtn = document.getElementById('submitName');
    const userName = nameInput.value.trim();
    
    if (!userName) {
        nameError.textContent = '请输入姓名';
        nameError.classList.remove('hidden');
        nameInput.focus();
        return;
    }
    
    // 显示loading状态
    submitBtn.textContent = '验证中...';
    submitBtn.disabled = true;
    nameError.classList.add('hidden');
    
    // 检查是否在参与者名单中
    if (!participants.includes(userName)) {
        nameError.textContent = '姓名不在名单中，请核对后重新输入';
        nameError.classList.remove('hidden');
        submitBtn.textContent = '验证身份';
        submitBtn.disabled = false;
        nameInput.focus();
        return;
    }
    
    // 验证通过
    try {
        await selectUser(userName);
    } catch (error) {
        console.error('用户验证失败:', error);
        nameError.textContent = '验证失败，请重试';
    } finally {
        submitBtn.textContent = '验证身份';
        submitBtn.disabled = false;
    }
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

// 开始抽奖 - 极致平滑性能优化
async function startLottery() {
    if (isSpinning) return;
    
    // 0. 预检查：直接使用内存中的缓存，确保零延迟响应
    if (!availablePrizes || availablePrizes.length === 0) {
        alert('所有奖品已抽完或正在加载，请刷新页面重试');
        return;
    }

    isSpinning = true;
    const startBtn = document.getElementById('startBtn');
    const wheel = document.getElementById('wheel');
    
    try {
        // 1. 瞬间确定中奖结果 (同步计算，无网络延迟)
        const availableIndices = [];
        prizes.forEach((prize, index) => {
            if (availablePrizes.some(rp => rp.name === prize.name)) {
                availableIndices.push(index);
            }
        });
        
        const selectedIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        const selectedPrizeType = prizes[selectedIndex];
        const specificPrizes = availablePrizes.filter(rp => rp.name === selectedPrizeType.name);
        let selectedPrize = specificPrizes[0];

        // 2. 立即计算并触发动画
        const duration = 8; // 总时长 8 秒 (3s 加速 + 5s 减速)
        const sectionAngle = 360 / prizes.length;
        // 增加基础圈数至 12 圈，视觉效果更震撼
        const finalTargetRotation = -(360 * 12 + (selectedIndex * sectionAngle + sectionAngle / 2));
        
        console.log('🚀 物理仿真启动 [加速 3s -> 减速 5s]，目标:', selectedPrizeType.name);
        
        // 使用定制的贝塞尔曲线实现非对称加减速
        // 0.3, 0 控制起步，使峰值出现在约 3s 处
        // 0.2, 1 提供长达 5s 的平滑减速
        wheel.style.transition = `transform ${duration}s cubic-bezier(0.3, 0, 0.2, 1)`;
        wheel.style.transform = `rotate(${finalTargetRotation}deg)`;

        // 3. 异步同步数据库 (在转盘旋转时，偷偷在后台保存，不影响动画)
        const syncTask = cloudManager.saveRecord(currentUser, selectedPrize.name, selectedPrize.uniqueId)
            .then(() => console.log('💾 后台数据同步完成'))
            .catch(err => console.error('💾 后台同步失败:', err));

        // 4. 动画结束后，额外停留 1 秒再弹出结果，增强仪式感
        setTimeout(() => {
            showResult(currentUser, selectedPrize.name);
            startBtn.textContent = '已抽奖';
            startBtn.disabled = true;
            isSpinning = false;
            
            // 抽奖结束后更新本地缓存，为下一个人准备
            loadRemainingPrizes();
        }, (duration + 1) * 1000); // duration (8s) + 停留时长 (1s)

    } catch (error) {
        console.error('抽奖异常:', error);
        isSpinning = false;
    }
}

// 显示抽奖结果
function showResult(userName, prizeName) {
    document.getElementById('wheelPage').classList.add('hidden');
    document.getElementById('resultPage').classList.remove('hidden');
    
    // 显示对应的中奖信息
    document.getElementById('prizeDisplay').textContent = prizeName;
    
    console.log('显示抽奖结果:', { userName, prizeName });
    
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
    const userName = currentUser || '某用户';
    const text = `${userName}在幸运大转盘活动中获得了【${prize}】！🎉`;
    
    console.log('分享内容:', { userName, prize, text });
    
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
    
    // 清空输入框
    const nameInput = document.getElementById('nameInput');
    nameInput.value = '';
    
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
        
        // 预加载奖品池
        loadRemainingPrizes();
        
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