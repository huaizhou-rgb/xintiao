// 应用状态
const state = {
    hourlyWage: 0,
    dailyGoal: 0,
    startTime: null,
    endTime: null,
    paused: false,
    pauseStartTime: null,
    totalPauseTime: 0, // 累计暂停时间（毫秒）
    lastUpdateTime: null,
    darkMode: false,
    milestones: [
        { amount: 50, message: "☕ 咖啡钱赚到了！", shown: false },
        { amount: 100, message: "🍔 午餐钱赚到了！", shown: false },
        { amount: 200, message: "🚗 通勤费赚到了！", shown: false },
        { amount: 500, message: "🎉 小目标达成！", shown: false },
    ]
};

// DOM 元素
const elements = {
    moneyDisplay: document.getElementById('moneyDisplay'),
    hourlyRate: document.getElementById('hourlyRate'),
    workTime: document.getElementById('workTime'),
    timeRemaining: document.getElementById('timeRemaining'),
    goalProgress: document.getElementById('goalProgress'),
    goalProgressBar: document.getElementById('goalProgressBar'),
    pauseBtn: document.getElementById('pauseBtn'),
    pauseText: document.getElementById('pauseText'),
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.getElementById('themeIcon'),
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettings: document.getElementById('closeSettings'),
    saveSettings: document.getElementById('saveSettings'),
    resetDay: document.getElementById('resetDay'),
    hourlyWage: document.getElementById('hourlyWage'),
    dailyGoal: document.getElementById('dailyGoal'),
    startTime: document.getElementById('startTime'),
    endTime: document.getElementById('endTime'),
    fakeEditor: document.getElementById('fakeEditor'),
    mainApp: document.getElementById('mainApp'),
    toastContainer: document.getElementById('toastContainer'),
};

// 初始化
function init() {
    loadSettings();
    setupEventListeners();
    updateFavicon();
    startAnimation();
    
    // 检查是否需要开始新的一天
    checkNewDay();
}

// 加载设置
function loadSettings() {
    const saved = localStorage.getItem('earningsTracker');
    if (saved) {
        const data = JSON.parse(saved);
        state.hourlyWage = data.hourlyWage || 0;
        state.dailyGoal = data.dailyGoal || 0;
        state.startTime = data.startTime || null;
        state.endTime = data.endTime || null;
        state.darkMode = data.darkMode || false;
        state.totalPauseTime = data.totalPauseTime || 0;
        state.paused = data.paused || false;
        state.pauseStartTime = data.pauseStartTime || null;
        state.lastUpdateTime = data.lastUpdateTime || null;
        state.milestones = data.milestones || state.milestones;
        
        // 恢复暂停状态
        if (state.paused && state.pauseStartTime) {
            const pauseDuration = Date.now() - new Date(state.pauseStartTime).getTime();
            state.totalPauseTime += pauseDuration;
            state.pauseStartTime = Date.now();
        }
    }
    
    // 应用暗色模式
    if (state.darkMode) {
        document.documentElement.classList.add('dark');
        elements.themeIcon.textContent = '☀️';
    }
    
    // 更新UI
    updateSettingsUI();
    updatePauseButton();
}

// 保存设置
function saveSettings() {
    const data = {
        hourlyWage: state.hourlyWage,
        dailyGoal: state.dailyGoal,
        startTime: state.startTime,
        endTime: state.endTime,
        darkMode: state.darkMode,
        totalPauseTime: state.totalPauseTime,
        paused: state.paused,
        pauseStartTime: state.pauseStartTime,
        lastUpdateTime: state.lastUpdateTime,
        milestones: state.milestones,
        lastSaveDate: new Date().toDateString()
    };
    localStorage.setItem('earningsTracker', JSON.stringify(data));
}

// 检查新的一天
function checkNewDay() {
    const saved = localStorage.getItem('earningsTracker');
    if (saved) {
        const data = JSON.parse(saved);
        const lastSaveDate = data.lastSaveDate;
        const today = new Date().toDateString();
        
        if (lastSaveDate !== today) {
            // 新的一天，重置数据
            state.totalPauseTime = 0;
            state.paused = false;
            state.pauseStartTime = null;
            state.lastUpdateTime = null;
            state.milestones = [
                { amount: 50, message: "☕ 咖啡钱赚到了！", shown: false },
                { amount: 100, message: "🍔 午餐钱赚到了！", shown: false },
                { amount: 200, message: "🚗 通勤费赚到了！", shown: false },
                { amount: 500, message: "🎉 小目标达成！", shown: false },
            ];
            saveSettings();
        }
    }
}

// 更新设置UI
function updateSettingsUI() {
    elements.hourlyWage.value = state.hourlyWage;
    elements.dailyGoal.value = state.dailyGoal;
    if (state.startTime) {
        elements.startTime.value = state.startTime;
    }
    if (state.endTime) {
        elements.endTime.value = state.endTime;
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 暂停按钮
    elements.pauseBtn.addEventListener('click', togglePause);
    
    // 主题切换
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // 设置按钮
    elements.settingsBtn.addEventListener('click', () => {
        elements.settingsModal.classList.remove('hidden');
    });
    
    elements.closeSettings.addEventListener('click', () => {
        elements.settingsModal.classList.add('hidden');
    });
    
    // 保存设置
    elements.saveSettings.addEventListener('click', () => {
        state.hourlyWage = parseFloat(elements.hourlyWage.value) || 0;
        state.dailyGoal = parseFloat(elements.dailyGoal.value) || 0;
        state.startTime = elements.startTime.value;
        state.endTime = elements.endTime.value;
        saveSettings();
        elements.settingsModal.classList.add('hidden');
        showToast('设置已保存', 'success');
    });
    
    // 重置今日数据
    elements.resetDay.addEventListener('click', () => {
        if (confirm('确定要重置今日数据吗？')) {
            state.totalPauseTime = 0;
            state.paused = false;
            state.pauseStartTime = null;
            state.lastUpdateTime = null;
            state.milestones = [
                { amount: 50, message: "☕ 咖啡钱赚到了！", shown: false },
                { amount: 100, message: "🍔 午餐钱赚到了！", shown: false },
                { amount: 200, message: "🚗 通勤费赚到了！", shown: false },
                { amount: 500, message: "🎉 小目标达成！", shown: false },
            ];
            saveSettings();
            elements.settingsModal.classList.add('hidden');
            showToast('今日数据已重置', 'success');
        }
    });
    
    // 老板键：Space 或 Esc
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Escape') {
            e.preventDefault();
            toggleBossKey();
        }
    });
    
    // 点击模态框外部关闭
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
            elements.settingsModal.classList.add('hidden');
        }
    });
}

// 切换暂停状态
function togglePause() {
    state.paused = !state.paused;
    
    if (state.paused) {
        state.pauseStartTime = Date.now();
        elements.pauseText.textContent = '▶ 继续';
        showToast('已暂停', 'info');
    } else {
        if (state.pauseStartTime) {
            const pauseDuration = Date.now() - state.pauseStartTime;
            state.totalPauseTime += pauseDuration;
            state.pauseStartTime = null;
        }
        elements.pauseText.textContent = '⏸ 暂停';
        showToast('已继续', 'info');
    }
    
    updatePauseButton();
    saveSettings();
}

// 更新暂停按钮
function updatePauseButton() {
    if (state.paused) {
        elements.pauseText.textContent = '▶ 继续';
        elements.pauseBtn.classList.add('bg-yellow-100', 'dark:bg-yellow-900');
    } else {
        elements.pauseText.textContent = '⏸ 暂停';
        elements.pauseBtn.classList.remove('bg-yellow-100', 'dark:bg-yellow-900');
    }
}

// 切换主题
function toggleTheme() {
    state.darkMode = !state.darkMode;
    
    if (state.darkMode) {
        document.documentElement.classList.add('dark');
        elements.themeIcon.textContent = '☀️';
    } else {
        document.documentElement.classList.remove('dark');
        elements.themeIcon.textContent = '🌙';
    }
    
    saveSettings();
}

// 切换老板键（隐身模式）
function toggleBossKey() {
    if (elements.fakeEditor.classList.contains('hidden')) {
        elements.fakeEditor.classList.remove('hidden');
        elements.mainApp.classList.add('hidden');
    } else {
        elements.fakeEditor.classList.add('hidden');
        elements.mainApp.classList.remove('hidden');
    }
}

// 计算收入
function calculateEarnings() {
    if (!state.startTime || !state.hourlyWage || state.hourlyWage <= 0) {
        return 0;
    }
    
    const now = new Date();
    const today = now.toDateString();
    const startDateTime = new Date(`${today} ${state.startTime}`);
    
    // 如果开始时间在未来，说明是跨天的情况
    if (startDateTime > now) {
        startDateTime.setDate(startDateTime.getDate() - 1);
    }
    
    // 计算实际工作时间（减去暂停时间）
    let workTimeMs = now - startDateTime;
    
    // 减去累计暂停时间
    let currentPauseTime = 0;
    if (state.paused && state.pauseStartTime) {
        currentPauseTime = Date.now() - state.pauseStartTime;
    }
    workTimeMs -= (state.totalPauseTime + currentPauseTime);
    
    // 确保不为负数
    workTimeMs = Math.max(0, workTimeMs);
    
    // 转换为小时并计算收入
    const workHours = workTimeMs / (1000 * 60 * 60);
    const earnings = workHours * state.hourlyWage;
    
    return Math.max(0, earnings);
}

// 格式化时间
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 格式化货币
function formatCurrency(amount) {
    return `¥${amount.toFixed(2)}`;
}

// 更新显示
let currentDisplayValue = 0;
function updateDisplay() {
    const earnings = calculateEarnings();
    
    // 平滑滚动到目标值
    const diff = earnings - currentDisplayValue;
    if (Math.abs(diff) > 0.01) {
        currentDisplayValue += diff * 0.1; // 平滑过渡
    } else {
        currentDisplayValue = earnings;
    }
    
    elements.moneyDisplay.textContent = formatCurrency(currentDisplayValue);
    elements.hourlyRate.textContent = `时薪: ${formatCurrency(state.hourlyWage)}/小时`;
    
    // 更新工作时长
    if (state.startTime) {
        const now = new Date();
        const today = now.toDateString();
        const startDateTime = new Date(`${today} ${state.startTime}`);
        if (startDateTime > now) {
            startDateTime.setDate(startDateTime.getDate() - 1);
        }
        
        let workTimeMs = now - startDateTime;
        let currentPauseTime = 0;
        if (state.paused && state.pauseStartTime) {
            currentPauseTime = Date.now() - state.pauseStartTime;
        }
        workTimeMs -= (state.totalPauseTime + currentPauseTime);
        workTimeMs = Math.max(0, workTimeMs);
        
        const workSeconds = workTimeMs / 1000;
        elements.workTime.textContent = formatTime(workSeconds);
    } else {
        elements.workTime.textContent = '0:00:00';
    }
    
    // 更新距离下班时间
    if (state.endTime) {
        const now = new Date();
        const today = now.toDateString();
        const endDateTime = new Date(`${today} ${state.endTime}`);
        
        // 如果下班时间在今天之前，说明是明天
        if (endDateTime < now) {
            endDateTime.setDate(endDateTime.getDate() + 1);
        }
        
        const remainingMs = endDateTime - now;
        if (remainingMs > 0) {
            const remainingSeconds = remainingMs / 1000;
            elements.timeRemaining.textContent = formatTime(remainingSeconds);
        } else {
            elements.timeRemaining.textContent = '已下班';
        }
    } else {
        elements.timeRemaining.textContent = '--:--:--';
    }
    
    // 更新目标进度
    if (state.dailyGoal > 0) {
        const progress = Math.min(100, (earnings / state.dailyGoal) * 100);
        elements.goalProgress.textContent = `${progress.toFixed(1)}%`;
        elements.goalProgressBar.style.width = `${progress}%`;
    } else {
        elements.goalProgress.textContent = '0%';
        elements.goalProgressBar.style.width = '0%';
    }
    
    // 检查里程碑
    checkMilestones(earnings);
    
    // 更新favicon
    updateFavicon();
    
    // 更新标题
    document.title = `${formatCurrency(earnings)} - 收入追踪器`;
}

// 检查里程碑
function checkMilestones(earnings) {
    state.milestones.forEach(milestone => {
        if (earnings >= milestone.amount && !milestone.shown) {
            milestone.shown = true;
            showToast(milestone.message, 'success');
            saveSettings();
        }
    });
}

// 更新favicon
function updateFavicon() {
    const earnings = calculateEarnings();
    const amount = earnings.toFixed(0);
    
    // 创建SVG favicon
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#3b82f6"/>
            <text x="50" y="60" font-size="40" font-weight="bold" text-anchor="middle" fill="white">¥${amount}</text>
        </svg>
    `;
    
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
        favicon.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
    }
}

// 显示提示
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };
    
    toast.className = `${colors[type] || colors.info} text-white px-4 py-2 rounded-lg shadow-lg animate-slide-up`;
    toast.textContent = message;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// 启动动画循环
function startAnimation() {
    function animate() {
        updateDisplay();
        requestAnimationFrame(animate);
    }
    animate();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

