// database.js - Cross-device database system
class CrossDeviceDB {
    constructor() {
        this.dbName = 'ffTournamentDB_cross';
        this.init();
    }
    
    init() {
        if (!localStorage.getItem(this.dbName)) {
            const initialDB = {
                depositRequests: [],
                withdrawalRequests: [],
                users: {},
                tournaments: [],
                lastSync: new Date().toISOString()
            };
            localStorage.setItem(this.dbName, JSON.stringify(initialDB));
        }
    }
    
    getDB() {
        return JSON.parse(localStorage.getItem(this.dbName)) || {};
    }
    
    saveDB(data) {
        data.lastSync = new Date().toISOString();
        localStorage.setItem(this.dbName, JSON.stringify(data));
    }
    
    // Merge data from another device
    mergeData(externalData) {
        const currentDB = this.getDB();
        
        // Merge deposit requests
        if (externalData.depositRequests) {
            externalData.depositRequests.forEach(newDeposit => {
                // Check if already exists
                const exists = currentDB.depositRequests.some(d => d.id === newDeposit.id);
                if (!exists) {
                    currentDB.depositRequests.push(newDeposit);
                }
            });
        }
        
        // Merge withdrawal requests
        if (externalData.withdrawalRequests) {
            externalData.withdrawalRequests.forEach(newWithdrawal => {
                const exists = currentDB.withdrawalRequests.some(w => w.id === newWithdrawal.id);
                if (!exists) {
                    currentDB.withdrawalRequests.push(newWithdrawal);
                }
            });
        }
        
        // Merge users
        if (externalData.users) {
            currentDB.users = { ...currentDB.users, ...externalData.users };
        }
        
        this.saveDB(currentDB);
        return currentDB;
    }
    
    // Export current data (for sharing between devices)
    exportData() {
        return this.getDB();
    }
    
    // Get all deposit requests
    getDeposits() {
        return this.getDB().depositRequests || [];
    }
    
    // Get all withdrawal requests
    getWithdrawals() {
        return this.getDB().withdrawalRequests || [];
    }
    
    // Add deposit request
    addDeposit(depositData) {
        const db = this.getDB();
        depositData.id = 'dep_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        depositData.date = new Date().toISOString();
        depositData.status = 'pending';
        
        db.depositRequests.push(depositData);
        this.saveDB(db);
        
        // Also save to old system for backward compatibility
        let oldDeposits = JSON.parse(localStorage.getItem('depositRequests')) || [];
        oldDeposits.push(depositData);
        localStorage.setItem('depositRequests', JSON.stringify(oldDeposits));
        
        return depositData.id;
    }
    
    // Add withdrawal request
    addWithdrawal(withdrawalData) {
        const db = this.getDB();
        withdrawalData.id = 'with_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        withdrawalData.date = new Date().toISOString();
        withdrawalData.status = 'pending';
        
        db.withdrawalRequests.push(withdrawalData);
        this.saveDB(db);
        
        // Also save to old system
        let oldWithdrawals = JSON.parse(localStorage.getItem('withdrawalRequests')) || [];
        oldWithdrawals.push(withdrawalData);
        localStorage.setItem('withdrawalRequests', JSON.stringify(oldWithdrawals));
        
        return withdrawalData.id;
    }
    
    // Update deposit status
    updateDepositStatus(depositId, status) {
        const db = this.getDB();
        const deposit = db.depositRequests.find(d => d.id === depositId);
        if (deposit) {
            deposit.status = status;
            deposit.processedAt = new Date().toISOString();
            this.saveDB(db);
            
            // Also update in old system
            let oldDeposits = JSON.parse(localStorage.getItem('depositRequests')) || [];
            const oldDeposit = oldDeposits.find(d => d.id === depositId);
            if (oldDeposit) oldDeposit.status = status;
            localStorage.setItem('depositRequests', JSON.stringify(oldDeposits));
            
            return true;
        }
        return false;
    }
    
    // Update withdrawal status
    updateWithdrawalStatus(withdrawalId, status) {
        const db = this.getDB();
        const withdrawal = db.withdrawalRequests.find(w => w.id === withdrawalId);
        if (withdrawal) {
            withdrawal.status = status;
            withdrawal.processedAt = new Date().toISOString();
            this.saveDB(db);
            
            // Also update in old system
            let oldWithdrawals = JSON.parse(localStorage.getItem('withdrawalRequests')) || [];
            const oldWithdrawal = oldWithdrawals.find(w => w.id === withdrawalId);
            if (oldWithdrawal) oldWithdrawal.status = status;
            localStorage.setItem('withdrawalRequests', JSON.stringify(oldWithdrawals));
            
            return true;
        }
        return false;
    }
}

// Create global instance
window.crossDeviceDB = new CrossDeviceDB();