       
       
       
       
       // Initialize account balance and user settings on first load
        window.addEventListener('load', function() {
            initializeAccount();
            initializeUserProfile();
            displayBalance();
            displayTransactions();
            updateWelcomeText();
            applyThemeFromSettings();
            console.log('Dashboard loaded successfully');
        });

        // Initialize account if first time
        function initializeAccount() {
            const existingBalance = localStorage.getItem('accountBalance');
            if (!existingBalance) {
                localStorage.setItem('accountBalance', '0');
                localStorage.setItem('transactions', JSON.stringify([]));
            }
        }

        // Initialize profile settings if they do not exist
        function initializeUserProfile() {
            const existingProfile = JSON.parse(localStorage.getItem('userProfile') || 'null');
            if (!existingProfile) {
                const profileDefaults = {
                    displayName: 'Credlink User',
                    email: '',
                    bio: '',
                    theme: 'light',
                    notifications: true,
                    language: 'en'
                };
                localStorage.setItem('userProfile', JSON.stringify(profileDefaults));
            }
        }

        function updateWelcomeText() {
            const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
            const displayName = profile.displayName || 'Credlink User';
            const welcomeHeading = document.querySelector('.welcome-card h2');
            if (welcomeHeading) {
                welcomeHeading.textContent = `Welcome back, ${displayName}! 🎉`;
            }
        }

        function applyThemeFromSettings() {
            const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
            if (profile.theme === 'dark') {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }

        function openProfileModal() {
            loadUserProfileForm();
            document.getElementById('profileModal').style.display = 'block';
            switchProfileTab('profileTab');
        }

        function closeProfileModal() {
            document.getElementById('profileModal').style.display = 'none';
        }

        function switchProfileTab(tabId) {
            const tabs = document.querySelectorAll('.profile-tab');
            const panels = document.querySelectorAll('.tab-panel');

            tabs.forEach(tab => {
                tab.classList.toggle('active', tab.getAttribute('onclick').includes(tabId));
            });

            panels.forEach(panel => {
                panel.classList.toggle('active', panel.id === tabId);
            });
        }

        function loadUserProfileForm() {
            const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
            const displayNameInput = document.getElementById('displayName');
            const emailInput = document.getElementById('profileEmail');
            const bioInput = document.getElementById('profileBio');
            const themeSelect = document.getElementById('themePreference');
            const notificationsToggle = document.getElementById('notificationPreference');
            const languageSelect = document.getElementById('languagePreference');

            if (displayNameInput) displayNameInput.value = profile.displayName || '';
            if (emailInput) emailInput.value = profile.email || '';
            if (bioInput) bioInput.value = profile.bio || '';
            if (themeSelect) themeSelect.value = profile.theme || 'light';
            if (notificationsToggle) notificationsToggle.checked = profile.notifications !== false;
            if (languageSelect) languageSelect.value = profile.language || 'en';
        }

        function handleProfileSave(event) {
            event.preventDefault();

            const displayName = document.getElementById('displayName').value.trim();
            const email = document.getElementById('profileEmail').value.trim();
            const bio = document.getElementById('profileBio').value.trim();
            const theme = document.getElementById('themePreference').value;
            const notifications = document.getElementById('notificationPreference').checked;
            const language = document.getElementById('languagePreference').value;

            const updatedProfile = {
                displayName: displayName || 'Credlink User',
                email,
                bio,
                theme,
                notifications,
                language
            };

            localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
            updateWelcomeText();
            applyThemeFromSettings();
            alert('✅ Profile and settings saved successfully.');
            closeProfileModal();
        }

        // Display the current balance
        function displayBalance() {
            const balance = parseFloat(localStorage.getItem('accountBalance') || '0');
            const formattedBalance = '₦' + balance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            
            const balanceElement = document.getElementById('accountBalance');
            if (balanceElement) {
                balanceElement.textContent = formattedBalance;
            }

            const modalBalance = document.getElementById('modalBalance');
            if (modalBalance) {
                modalBalance.textContent = formattedBalance;
            }

            const availableBalance = document.getElementById('availableBalance');
            if (availableBalance) {
                availableBalance.textContent = 'Available: ' + formattedBalance;
            }
        }

        // Display transaction history
        function displayTransactions() {
            const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            const transactionList = document.getElementById('transactionList');
            
            if (!transactionList) return;

            if (transactions.length === 0) {
                transactionList.innerHTML = '<p class="no-transactions">No transactions yet</p>';
                return;
            }

            transactionList.innerHTML = transactions.slice().reverse().map(t => `
                <div class="transaction-item ${t.type}">
                    <div class="transaction-info">
                        <span class="transaction-type">${t.type === 'deposit' ? '📥 Deposit' : '📤 Withdrawal'}</span>
                        <span class="transaction-date">${t.date}</span>
                    </div>
                    <div class="transaction-amount ${t.type}">
                        ${t.type === 'deposit' ? '+' : '-'}₦${parseFloat(t.amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
            `).join('');
        }

        // Modal functions for Account
        function openAccountModal() {
            document.getElementById('accountModal').style.display = 'block';
            displayBalance();
        }

        function closeAccountModal() {
            document.getElementById('accountModal').style.display = 'none';
        }

        // Modal functions for Deposit
        function openDepositModal() {
            document.getElementById('depositModal').style.display = 'block';
            document.getElementById('depositForm').reset();
        }

        function closeDepositModal() {
            document.getElementById('depositModal').style.display = 'none';
            document.getElementById('depositForm').reset();
        }

        // Modal functions for Withdraw
        function openWithdrawModal() {
            document.getElementById('withdrawModal').style.display = 'block';
            document.getElementById('withdrawForm').reset();
            displayBalance();
        }

        function closeWithdrawModal() {
            document.getElementById('withdrawModal').style.display = 'none';
            document.getElementById('withdrawForm').reset();
        }

        // Handle deposit
        function handleDeposit(event) {
            event.preventDefault();
            
            const amount = parseFloat(document.getElementById('depositAmount').value);
            const bankName = document.getElementById('bankName').value;
            const accountNumber = document.getElementById('accountNumber').value;

            if (amount <= 0) {
                alert('Please enter a valid amount');
                return;
            }

            // Add amount to balance
            const currentBalance = parseFloat(localStorage.getItem('accountBalance') || '0');
            const newBalance = currentBalance + amount;
            localStorage.setItem('accountBalance', newBalance.toString());

            // Record transaction
            recordTransaction('deposit', amount, bankName, accountNumber);

            alert(`✅ Deposit successful! ₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} has been added to your account.`);
            
            displayBalance();
            displayTransactions();
            closeDepositModal();
        }

        // Handle withdraw
        function handleWithdraw(event) {
            event.preventDefault();
            
            const amount = parseFloat(document.getElementById('withdrawAmount').value);
            const bankName = document.getElementById('withdrawBank').value;
            const accountNumber = document.getElementById('withdrawAccount').value;
            const currentBalance = parseFloat(localStorage.getItem('accountBalance') || '0');

            if (amount <= 0) {
                alert('Please enter a valid amount');
                return;
            }

            if (amount > currentBalance) {
                alert(`❌ Insufficient balance! Your current balance is ₦${currentBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
                return;
            }

            // Deduct amount from balance
            const newBalance = currentBalance - amount;
            localStorage.setItem('accountBalance', newBalance.toString());

            // Record transaction
            recordTransaction('withdraw', amount, bankName, accountNumber);

            alert(`✅ Withdrawal successful! ₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} has been withdrawn from your account.`);
            
            displayBalance();
            displayTransactions();
            closeWithdrawModal();
        }

        // Record transaction in history
        function recordTransaction(type, amount, bank, accountNumber) {
            const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            const now = new Date();
            const dateString = now.toLocaleDateString('en-NG') + ' ' + now.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

            transactions.push({
                type: type,
                amount: amount,
                bank: bank,
                accountNumber: accountNumber,
                date: dateString
            });

            localStorage.setItem('transactions', JSON.stringify(transactions));
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const accountModal = document.getElementById('accountModal');
            const depositModal = document.getElementById('depositModal');
            const withdrawModal = document.getElementById('withdrawModal');
            const profileModal = document.getElementById('profileModal');

            if (event.target === accountModal) {
                closeAccountModal();
            }
            if (event.target === depositModal) {
                closeDepositModal();
            }
            if (event.target === withdrawModal) {
                closeWithdrawModal();
            }
            if (event.target === profileModal) {
                closeProfileModal();
            }
        }

        function logout() {
            if (confirm('Are you sure you want to logout?')) {
                // Clear session/token
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('userEmail');
                // Redirect to login
                window.location.href = 'index.html';
            }
        }
   