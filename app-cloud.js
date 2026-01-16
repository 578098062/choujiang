// 云端数据管理类 - 基于GitHub
class CloudDataManager {
    constructor() {
        this.repoOwner = 'your-username'; // 替换为你的GitHub用户名
        this.repoName = 'lucky-wheel-data'; // 数据仓库
        this.dataFile = 'lottery-records.json';
        this.token = 'your-github-token'; // GitHub Personal Access Token
    }

    // 读取抽奖记录
    async readRecords() {
        try {
            const response = await fetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${this.dataFile}`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const content = JSON.parse(atob(data.content));
                return content;
            } else {
                // 文件不存在，返回空数组
                return [];
            }
        } catch (error) {
            console.error('读取云端数据失败:', error);
            // 降级到本地存储
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
            
            // 4. 上传到GitHub
            await this.uploadToGitHub(records);
            
            return true;
        } catch (error) {
            console.error('保存云端数据失败:', error);
            // 降级到本地存储
            return this.saveLocalRecord(record);
        }
    }

    // 上传数据到GitHub
    async uploadToGitHub(records) {
        const content = btoa(JSON.stringify(records, null, 2));
        
        try {
            const response = await fetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${this.dataFile}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Update lottery records - ${new Date().toISOString()}`,
                    content: content
                })
            });

            if (!response.ok) {
                throw new Error('上传失败');
            }

            return await response.json();
        } catch (error) {
            console.error('上传到GitHub失败:', error);
            throw error;
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