// 云端数据管理类 - 基于免费JSON存储服务
class CloudDataManager {
    constructor() {
        // 使用 jsonbin.io 免费存储（每月1GB流量）
        this.apiKey = '$2a$10$h8vxevEkPmm6QekSX6y3uuIM5wOPUgT0mTx02sZzEEh8GlNhaptjG'; // 注册jsonbin.io获取
        this.binId = '6969b59a43b1c97be933c359'; // 创建一个bin获取ID
        this.baseURL = 'https://api.jsonbin.io/v3/b/6969b59a43b1c97be933c359';
    }

    // 初始化存储桶
    async initStorage() {
        try {
            // 创建初始数据
            const initialData = {
                records: [],
                created_at: new Date().toISOString(),
                last_updated: new Date().toISOString()
            };

            const response = await fetch(`${this.baseURL}/b`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.apiKey
                },
                body: JSON.stringify(initialData)
            });

            if (response.ok) {
                const data = await response.json();
                this.binId = data.metadata.id;
                console.log('存储初始化成功, Bin ID:', this.binId);
                return data.metadata.id;
            }
        } catch (error) {
            console.error('初始化存储失败:', error);
        }
    }

    // 读取抽奖记录
    async readRecords() {
        try {
            console.log('读取云端数据，Bin ID:', this.binId);
            const response = await fetch(`${this.baseURL}/b/${this.binId}/latest`, {
                headers: {
                    'X-Master-Key': this.apiKey
                }
            });
            
            console.log('读取响应状态:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('读取到的数据:', data);
                
                // JSONBin v3版本返回数据结构
                if (data.record && data.record.records) {
                    return data.record.records;
                } else if (data.records) {
                    return data.records;
                } else {
                    console.warn('数据结构异常，返回空数组');
                    return [];
                }
            } else {
                const errorText = await response.text();
                console.error('云端数据读取失败，错误信息:', errorText);
                console.warn('使用本地存储');
                return this.getLocalRecords();
            }
        } catch (error) {
            console.error('读取云端数据失败:', error);
            return this.getLocalRecords();
        }
    }

    // 保存抽奖记录
    async saveRecord(userName, prize, prizeId) {
        const record = {
            userName,
            prize,
            prizeId,
            timestamp: new Date().toISOString()
        };

        try {
            // 1. 读取现有记录
            const records = await this.readRecords();
            
            // 2. 检查是否已存在
            const exists = records.some(r => r.userName === userName);
            if (exists) {
                throw new Error('该用户已参与过抽奖');
            }
            
            // 3. 添加新记录
            records.push(record);
            
            // 4. 更新到云端
            await this.updateToCloud(records);
            
            return true;
        } catch (error) {
            console.error('保存云端数据失败:', error);
            return this.saveLocalRecord(record);
        }
    }

    // 更新数据到云端
    async updateToCloud(records) {
        const updateData = {
            records: records,
            last_updated: new Date().toISOString()
        };

        try {
            console.log('更新云端数据:', updateData);
            console.log('Bin ID:', this.binId);
            
            const response = await fetch(`${this.baseURL}/b/${this.binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.apiKey
                },
                body: JSON.stringify(updateData)
            });

            console.log('更新响应状态:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('更新云端数据失败，错误信息:', errorText);
                throw new Error(`更新云端数据失败: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('云端更新成功:', result);
            return result;
        } catch (error) {
            console.error('更新云端数据失败:', error);
            throw error;
        }
    }

    // 获取所有记录（用于显示抽奖进度）
    async getAllRecords() {
        return await this.readRecords();
    }

    // 获取剩余奖品
    async getRemainingPrizes() {
        try {
            const records = await this.readRecords();
            const prizeCount = {};
            
            // 统计已抽出的奖品
            records.forEach(record => {
                prizeCount[record.prize] = (prizeCount[record.prize] || 0) + 1;
            });

            // 计算剩余奖品
            const remaining = {};
            prizes.forEach(prize => {
                const drawn = prizeCount[prize.name] || 0;
                remaining[prize.name] = Math.max(0, prize.count - drawn);
            });

            return remaining;
        } catch (error) {
            console.error('获取剩余奖品失败:', error);
            return null;
        }
    }

    // 本地存储降级方案
    getLocalRecords() {
        try {
            const records = localStorage.getItem('lotteryRecords');
            return records ? JSON.parse(records) : [];
        } catch {
            return [];
        }
    }

    saveLocalRecord(record) {
        try {
            const records = this.getLocalRecords();
            records.push(record);
            localStorage.setItem('lotteryRecords', JSON.stringify(records));
            return true;
        } catch (error) {
            console.error('本地存储失败:', error);
            return false;
        }
    }
}