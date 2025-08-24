// Cyberpunk Authentication Terminal
const API_BASE = window.location.origin + '/api/v1/users';
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// Debug logging
console.log('API_BASE:', API_BASE);
console.log('Current origin:', window.location.origin);

// Initialize terminal
document.addEventListener('DOMContentLoaded', function() {
    updateConnectionStatus();
    checkAuthStatus();
    setupEventListeners();
    displayWelcomeMessage();
});

function setupEventListeners() {
    // Form submissions
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Update auth status periodically
    setInterval(updateConnectionStatus, 5000);
}

function displayWelcomeMessage() {
    addOutput('🔐 CYBER AUTH TERMINAL INITIALIZED', 'success');
    addOutput('⚡ SYSTEM STATUS: ONLINE', 'info');
    addOutput('🎯 MISSION: DISCOVER THE SECRET KEY', 'warning');
    addOutput('💡 TIP: Register or login to begin your journey...', 'info');
    
    // Test API connectivity
    testAPIConnection();
}

async function testAPIConnection() {
    try {
        const response = await fetch('/api/v1/test');
        if (response.ok) {
            const data = await response.json();
            addOutput('✅ API CONNECTION: ESTABLISHED', 'success');
        } else {
            addOutput('⚠️ API CONNECTION: ISSUES DETECTED', 'warning');
        }
    } catch (error) {
        addOutput('❌ API CONNECTION: FAILED - ' + error.message, 'error');
    }
}

// Tab Management
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    addOutput('🔄 AUTHENTICATING USER: ' + username, 'info');
    addOutput('🔗 API ENDPOINT: ' + `${API_BASE}/login`, 'info');
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        
        addOutput('📡 RESPONSE STATUS: ' + response.status, 'info');
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            addOutput('❌ INVALID RESPONSE FORMAT (Expected JSON, got HTML/Text)', 'error');
            addOutput('📄 RESPONSE: ' + text.substring(0, 200) + '...', 'error');
            return;
        }
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.data.accessToken;
            currentUser = data.data.user;
            localStorage.setItem('authToken', authToken);
            
            addOutput('✅ AUTHENTICATION SUCCESSFUL', 'success');
            addOutput(`👤 WELCOME BACK, ${currentUser.username.toUpperCase()}`, 'success');
            addOutput('🔓 ACCESS GRANTED TO DISCOVERY SYSTEM', 'success');
            
            updateAuthStatus();
            document.getElementById('login-form').reset();
            
            // Auto-switch to discovery tab
            setTimeout(() => {
                showTab('discovery');
                document.querySelector('[onclick="showTab(\'discovery\')"]').classList.add('active');
            }, 1000);
            
        } else {
            addOutput('❌ AUTHENTICATION FAILED: ' + data.message, 'error');
        }
    } catch (error) {
        addOutput('🚨 CONNECTION ERROR: ' + error.message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const fullName = document.getElementById('reg-fullname').value;
    const password = document.getElementById('reg-password').value;
    
    addOutput('🔄 CREATING NEW USER ACCOUNT...', 'info');
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, fullName, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            addOutput('✅ ACCOUNT CREATED SUCCESSFULLY', 'success');
            addOutput(`👤 USER REGISTERED: ${username.toUpperCase()}`, 'success');
            addOutput('💡 NOW LOGIN TO ACCESS THE DISCOVERY SYSTEM', 'info');
            
            document.getElementById('register-form').reset();
            
            // Auto-switch to login tab
            setTimeout(() => {
                showTab('login');
                document.querySelector('[onclick="showTab(\'login\')"]').classList.add('active');
            }, 1000);
            
        } else {
            addOutput('❌ REGISTRATION FAILED: ' + data.message, 'error');
        }
    } catch (error) {
        addOutput('🚨 CONNECTION ERROR: ' + error.message, 'error');
    }
}

// Discovery Functions
async function accessAdminPanel() {
    if (!authToken) {
        addOutput('🔒 ACCESS DENIED: AUTHENTICATION REQUIRED', 'error');
        return;
    }
    
    addOutput('🔄 ACCESSING ADMIN PANEL...', 'info');
    
    try {
        const response = await fetch(`${API_BASE}/admin-panel`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            addOutput('✅ ADMIN PANEL ACCESS GRANTED', 'success');
            addOutput('📊 ' + data.message, 'info');
            
            if (data.data) {
                Object.entries(data.data).forEach(([key, value]) => {
                    if (typeof value === 'object') {
                        addOutput(`🔍 ${key.toUpperCase()}:`, 'info');
                        Object.entries(value).forEach(([subKey, subValue]) => {
                            addOutput(`   └─ ${subKey}: ${subValue}`, 'info');
                            
                            // Store maintenance code for next step
                            if (subKey === 'maintenanceCode') {
                                localStorage.setItem('maintenanceCode', subValue);
                                addOutput(`🔑 MAINTENANCE CODE STORED: ${subValue}`, 'success');
                                addOutput('💡 You can now access System Diagnostics!', 'info');
                            }
                        });
                    } else {
                        addOutput(`🔍 ${key.toUpperCase()}: ${value}`, 'info');
                    }
                });
            }
        } else {
            addOutput('❌ ACCESS DENIED: ' + data.message, 'error');
        }
    } catch (error) {
        addOutput('🚨 CONNECTION ERROR: ' + error.message, 'error');
    }
}

async function systemDiagnostics() {
    if (!authToken) {
        addOutput('🔒 ACCESS DENIED: AUTHENTICATION REQUIRED', 'error');
        return;
    }
    
    addOutput('🔄 RUNNING SYSTEM DIAGNOSTICS...', 'info');
    
    // Check if we have maintenance code from admin panel
    const maintenanceCode = localStorage.getItem('maintenanceCode');
    if (!maintenanceCode) {
        addOutput('⚠️ MAINTENANCE CODE REQUIRED', 'warning');
        addOutput('💡 HINT: Access the Admin Panel first to get the maintenance code', 'info');
        return;
    }
    
    addOutput('🔑 Using maintenance code: ' + maintenanceCode, 'info');
    
    try {
        const response = await fetch(`${API_BASE}/system/diagnostics?maintenanceCode=${maintenanceCode}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            addOutput('✅ DIAGNOSTICS COMPLETE', 'success');
            addOutput('🔧 ' + data.message, 'info');
            
            if (data.data) {
                Object.entries(data.data).forEach(([key, value]) => {
                    if (typeof value === 'object') {
                        addOutput(`⚙️ ${key.toUpperCase()}:`, 'warning');
                        Object.entries(value).forEach(([subKey, subValue]) => {
                            addOutput(`   └─ ${subKey}: ${subValue}`, 'info');
                            
                            // Store access code for secret key
                            if (subKey === 'accessCode' || subKey === 'dynamicCode') {
                                localStorage.setItem('accessCode', subValue);
                                addOutput(`🎯 ACCESS CODE DISCOVERED: ${subValue}`, 'success');
                                addOutput('🔓 You can now access the Secret Key!', 'info');
                            }
                        });
                    } else {
                        addOutput(`⚙️ ${key.toUpperCase()}: ${value}`, 'warning');
                    }
                });
            }
        } else {
            addOutput('❌ DIAGNOSTICS FAILED: ' + data.message, 'error');
        }
    } catch (error) {
        addOutput('🚨 CONNECTION ERROR: ' + error.message, 'error');
    }
}

async function getSecretKey() {
    if (!authToken) {
        addOutput('🔒 ACCESS DENIED: AUTHENTICATION REQUIRED', 'error');
        return;
    }
    
    addOutput('🔄 ATTEMPTING TO ACCESS SECRET KEY...', 'info');
    
    // Check if we have access code from diagnostics
    const accessCode = localStorage.getItem('accessCode');
    if (!accessCode) {
        addOutput('⚠️ ACCESS CODE REQUIRED', 'warning');
        addOutput('💡 HINT: Complete System Diagnostics first to get the access code', 'info');
        addOutput('📋 DISCOVERY PATH: Admin Panel → Diagnostics → Secret Key', 'info');
        return;
    }
    
    addOutput('🎯 Using access code: ' + accessCode, 'info');
    
    try {
        const response = await fetch(`${API_BASE}/secret-key?accessCode=${accessCode}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            addOutput('🎉 SECRET KEY DISCOVERED!', 'success');
            addOutput('🔑 ' + data.message, 'success');
            
            if (data.data && data.data.secretKey) {
                addOutput('', 'success');
                addOutput('═══════════════════════════════════════', 'success');
                addOutput('💎 SECRET KEY: ' + data.data.secretKey, 'success');
                addOutput('═══════════════════════════════════════', 'success');
                addOutput('', 'success');
                addOutput('🏆 MISSION ACCOMPLISHED!', 'success');
                addOutput('🎯 CYBERPUNK HACKER LEVEL: EXPERT', 'success');
                
                if (data.data.discoveryPath) {
                    addOutput('🛤️ DISCOVERY PATH: ' + data.data.discoveryPath, 'info');
                }
                if (data.data.achievement) {
                    addOutput('🏅 ' + data.data.achievement, 'success');
                }
                
                // Celebration effect
                setTimeout(() => {
                    addOutput('🔥 CONGRATULATIONS! You have successfully infiltrated the system!', 'success');
                }, 1000);
            }
        } else {
            addOutput('❌ ACCESS DENIED: ' + data.message, 'error');
            if (data.hint) {
                addOutput('💡 HINT: ' + data.hint, 'warning');
            }
        }
    } catch (error) {
        addOutput('🚨 CONNECTION ERROR: ' + error.message, 'error');
    }
}

async function vaultAccess() {
    if (!authToken) {
        addOutput('🔒 ACCESS DENIED: AUTHENTICATION REQUIRED', 'error');
        return;
    }
    
    addOutput('🔄 ACCESSING SECURE VAULT...', 'info');
    
    try {
        const response = await fetch(`${API_BASE}/vault-access`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            addOutput('✅ VAULT ACCESS GRANTED', 'success');
            addOutput('🏦 ' + data.message, 'info');
            
            if (data.data) {
                Object.entries(data.data).forEach(([key, value]) => {
                    if (typeof value === 'object') {
                        addOutput(`🔐 ${key.toUpperCase()}:`, 'success');
                        Object.entries(value).forEach(([subKey, subValue]) => {
                            addOutput(`   └─ ${subKey}: ${subValue}`, 'info');
                        });
                    } else {
                        addOutput(`🔐 ${key.toUpperCase()}: ${value}`, 'success');
                    }
                });
            }
        } else {
            addOutput('❌ VAULT ACCESS DENIED: ' + data.message, 'error');
        }
    } catch (error) {
        addOutput('🚨 CONNECTION ERROR: ' + error.message, 'error');
    }
}

// Utility Functions
function addOutput(message, type = 'info') {
    const output = document.getElementById('output');
    const line = document.createElement('div');
    line.className = `output-line output-${type}`;
    
    const timestamp = new Date().toLocaleTimeString();
    line.innerHTML = `[${timestamp}] ${message}`;
    
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function clearOutput() {
    document.getElementById('output').innerHTML = '';
    addOutput('🔄 TERMINAL CLEARED', 'info');
}

function updateConnectionStatus() {
    const statusElement = document.getElementById('connection-status');
    
    fetch(`${API_BASE}/health`)
        .then(response => response.json())
        .then(data => {
            statusElement.textContent = 'ONLINE';
            statusElement.style.color = 'var(--neon-green)';
        })
        .catch(error => {
            statusElement.textContent = 'OFFLINE';
            statusElement.style.color = 'var(--magenta)';
        });
}

function checkAuthStatus() {
    if (authToken) {
        updateAuthStatus();
    }
}

function updateAuthStatus() {
    const authStatusElement = document.getElementById('auth-status');
    if (authToken && currentUser) {
        authStatusElement.textContent = `AUTHENTICATED AS ${currentUser.username.toUpperCase()}`;
        authStatusElement.style.color = 'var(--neon-green)';
        updateDiscoveryProgress();
    } else {
        authStatusElement.textContent = 'AUTHENTICATION REQUIRED';
        authStatusElement.style.color = 'var(--magenta)';
    }
}

function updateDiscoveryProgress() {
    const maintenanceCode = localStorage.getItem('maintenanceCode');
    const accessCode = localStorage.getItem('accessCode');
    
    // Step 1: Admin Panel
    if (maintenanceCode) {
        document.getElementById('step-1').classList.add('completed');
        document.getElementById('status-1').textContent = '✅';
        document.getElementById('status-2').textContent = '⏳';
    }
    
    // Step 2: Diagnostics
    if (accessCode) {
        document.getElementById('step-2').classList.add('completed');
        document.getElementById('status-2').textContent = '✅';
        document.getElementById('status-3').textContent = '⏳';
    }
    
    // Step 3: Secret Key (will be updated when accessed)
}

// Logout function
function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    updateAuthStatus();
    addOutput('🔓 LOGGED OUT SUCCESSFULLY', 'info');
}

// Add some cyberpunk flair
setInterval(() => {
    const glitchElements = document.querySelectorAll('.glitch');
    glitchElements.forEach(element => {
        if (Math.random() < 0.1) {
            element.style.textShadow = `
                ${Math.random() * 4 - 2}px ${Math.random() * 4 - 2}px 0 var(--magenta),
                ${Math.random() * 4 - 2}px ${Math.random() * 4 - 2}px 0 var(--electric-blue)
            `;
            setTimeout(() => {
                element.style.textShadow = '';
            }, 100);
        }
    });
}, 2000);