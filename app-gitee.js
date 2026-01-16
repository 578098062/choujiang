// 云端数据管理类 - 基于Gitee
class CloudDataManager {
    constructor() {
        this.repoOwner = 'your-username'; // 替换为你的Gitee用户名
        this.repoName = 'lucky-wheel-data'; // 数据仓库
        this.dataFile = 'lottery-records.json';
        this.token = 'your-gitee-token'; // Gitee Personal Access Token
    }

    // 读取抽奖记录
    async readRecords() {
        try {
            const response = await fetch(`https://gitee.com/api/v5/repos/${this.repoOwner}/${this.repoName}/contents/${this.dataFile}`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const content = this.decodeBase64(data.content);
                return JSON.parse(content);
            } else {
                return [];
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
            
            // 4. 获取文件的SHA（更新时需要）
            const sha = await this.getFileSHA();
            
            // 5. 上传到Gitee
            await this.uploadToGitee(records, sha);
            
            return true;
        } catch (error) {
            console.error('保存云端数据失败:', error);
            return this.saveLocalRecord(record);
        }
    }

    // 获取文件SHA
    async getFileSHA() {
        try {
            const response = await fetch(`https://gitee.com/api/v5/repos/${this.repoOwner}/${this.repoName}/contents/${this.dataFile}`, {
                headers: {
                    'Authorization': `token ${this.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.sha;
            }
            return null;
        } catch {
            return null;
        }
    }

    // 上传数据到Gitee
    async uploadToGitee(records, sha) {
        const content = this.encodeBase64(JSON.stringify(records, null, 2));
        
        const body = {
            access_token: this.token,
            content: content,
            message: `Update lottery records - ${new Date().toISOString()}`
        };

        if (sha) {
            body.sha = sha;
        }

        try {
            const response = await fetch(`https://gitee.com/api/v5/repos/${this.repoOwner}/${this.repoName}/contents/${this.dataFile}`, {
                method: sha ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error('上传失败');
            }

            return await response.json();
        } catch (error) {
            console.error('上传到Gitee失败:', error);
            throw error;
        }
    }

    // Base64编码
    encodeBase64(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }

    // Base64解码
    decodeBase64(str) {
        return decodeURIComponent(escape(atob(str)));
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