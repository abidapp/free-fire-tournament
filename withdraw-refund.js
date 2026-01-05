// withdraw-refund.js - ADD-ON FEATURE ONLY
// Automatically refunds withdrawal amount when admin rejects
// DOES NOT CHANGE ANY EXISTING CODE - WORKS ALONGSIDE IT

(function() {
    console.log('Withdrawal refund add-on loaded');
    
    // Store original reject function (if it exists)
    let originalRejectWithdrawal = null;
    
    // Wait for page to load
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeRefundFeature, 1000);
    });
    
    function initializeRefundFeature() {
        console.log('Initializing withdrawal refund add-on...');
        
        // Check if rejectWithdrawal function exists
        if (typeof window.rejectWithdrawal === 'function') {
            originalRejectWithdrawal = window.rejectWithdrawal;
            
            // Create enhanced version
            window.rejectWithdrawal = function(withdrawalId) {
                console.log('ADD-ON: Processing withdrawal rejection for:', withdrawalId);
                
                // 1. First, run the original function
                if (originalRejectWithdrawal) {
                    originalRejectWithdrawal(withdrawalId);
                }
                
                // 2. Then auto-refund to wallet (ADD-ON FEATURE)
                setTimeout(() => {
                    refundToUserWallet(withdrawalId);
                }, 1500); // Wait 1.5 seconds for original function to complete
            };
            
            console.log('Withdrawal refund feature activated!');
            showNotification('Auto-refund feature: Active ✓', 'success');
        } else {
            console.log('rejectWithdrawal function not found, retrying...');
            setTimeout(initializeRefundFeature, 2000);
        }
    }
    
    // ADD-ON FUNCTION: Refund amount to user wallet
    function refundToUserWallet(withdrawalId) {
        console.log('ADD-ON: Starting refund process for withdrawal:', withdrawalId);
        
        try {
            // 1. Find the withdrawal request
            const withdrawals = JSON.parse(localStorage.getItem('withdrawalRequests')) || [];
            const withdrawal = withdrawals.find(w => w.id == withdrawalId);
            
            if (!withdrawal) {
                console.log('ADD-ON: Withdrawal not found:', withdrawalId);
                return;
            }
            
            const { username, amount } = withdrawal;
            console.log(`ADD-ON: Refunding PKR ${amount} to ${username}`);
            
            // 2. Get current users data
            let users = JSON.parse(localStorage.getItem('ffUsers')) || {};
            
            if (!users[username]) {
                console.log('ADD-ON: User not found in ffUsers:', username);
                showNotification(`User ${username} not found for refund`, 'error');
                return;
            }
            
            // 3. Add amount back to user's wallet
            const currentBalance = parseFloat(users[username].balance) || 0;
            const refundAmount = parseFloat(amount);
            const newBalance = currentBalance + refundAmount;
            
            users[username].balance = newBalance;
            
            // 4. Save updated users data
            localStorage.setItem('ffUsers', JSON.stringify(users));
            
            // 5. Update transaction history (if you have one)
            addToTransactionHistory(username, refundAmount, 'refund', withdrawalId);
            
            // 6. Show success message
            console.log(`ADD-ON: Successfully refunded PKR ${refundAmount} to ${username}`);
            console.log(`ADD-ON: New balance: PKR ${newBalance}`);
            
            showNotification(`✓ Refunded PKR ${refundAmount} to ${username}'s wallet`, 'success');
            
        } catch (error) {
            console.error('ADD-ON: Error during refund:', error);
            showNotification('Error processing refund', 'error');
        }
    }
    
    // Helper: Add to transaction history
    function addToTransactionHistory(username, amount, type, referenceId) {
        try {
            const transaction = {
                id: 'refund_' + Date.now(),
                username: username,
                amount: amount,
                type: type,
                reference: referenceId,
                date: new Date().toISOString(),
                description: `Withdrawal rejection refund`
            };
            
            // Add to transaction history if it exists
            let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
            transactions.push(transaction);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            
        } catch (error) {
            console.log('ADD-ON: Could not save to transaction history:', error);
        }
    }
    
    // Helper: Show notification
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#00ff88' : '#ff4655'};
            color: ${type === 'success' ? '#000' : '#fff'};
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="
                background: transparent;
                border: none;
                font-size: 20px;
                cursor: pointer;
                margin-left: 15px;
                color: inherit;
            ">×</button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    console.log('Withdrawal refund add-on fully loaded!');
})();