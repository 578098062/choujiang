// 修复版JSONBin数据管理类
class CloudDataManager {
    constructor() {
        this.apiKey = '';
        this.binId = '';
        this.baseURL = 'https://api.jsonbin.io/v3';
    }

    // 初始化配置
    init(apiKey, binId) {
        this.apiKey = apiKey;
        this.binId = binId;
        console.log('JSONBin初始化:', { apiKey: apiKey.substring(0, 8) + '...', binId });
    }

    // 读取抽奖记录
    async readRecords() {
        try {
            if (!this.apiKey || !this.binId) {
                throw new Error('JSONBin未配置');
            }

            console.log('读取JSONBin数据...');
            const response = await fetch(`${this.baseURL}/b/${this.binId}`, {
                headers: {
                    'X-Master-Key': this.apiKey
                }
            });
            
            console.log('读取响应:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('JSONBin数据:', data);
                
                // JSONBin返回结构可能是 {record: {records: [...]}} 或直接是 {records: [...]}
                let records = [];
                if (data.record && data.record.records) {
                    records = data.record.records;
                } else if (data.records) {
                    records = data.records;
                } else {
                    console.warn('JSONBin数据结构异常:', data);
                    records = [];
                }
                
                return records;
            } else {
                const errorText = await response.text();
                console.error('JSONBin读取失败:', response.status, errorText);
                throw new Error(`读取失败: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('JSONBin异常:', error);
            throw error;
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
            // 读取现有记录
            const records = await this.readRecords();
            
            // 检查是否已存在
            const exists = records.some(r => r.userName === userName);
            if (exists) {
                throw new Error('该用户已参与过抽奖');
            }
            
            // 添加新记录
            records.push(record);
            
            // 保存到JSONBin
            await this.saveToJSONBin(records);
            
            console.log('JSONBin保存成功:', record);
            return true;
        } catch (error) {
            console.error('JSONBin保存失败:', error);
            throw error; // 直接抛出错误，不允许降级
        }
    }

    // 保存到JSONBin
    async saveToJSONBin(records) {
        const data = {
            records: records,
            last_updated: new Date().toISOString()
        };

        const response = await fetch(`${this.baseURL}/b/${this.binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': this.apiKey
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`JSONBin更新失败: ${response.status} - ${errorText}`);
        }

        return await response.json();
    }


}