export function createLoanTimer(onTimeExpired, onTrackRemoved, onLoanUpdate) {
    let loanActive = false;
    let loanAmount = 0;
    let timeRemaining = 0;
    let timerInterval = null;
    let trackPenaltyInterval = null;
    const TOTAL_LOAN_TIME = 5  * 60; // 5 minut

    function startTimer(amount) {
        stopTimer();
        
        loanActive = true;
        loanAmount = amount;
        timeRemaining = TOTAL_LOAN_TIME;
        
        
        timerInterval = setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
            } else {
                // Čas vypršel
                clearInterval(timerInterval);
                timerInterval = null;
                
                
                if (onTimeExpired) {
                    const remainingAfterSeizure = onTimeExpired(loanAmount);
                    
                    if (remainingAfterSeizure > 0) {
                        loanAmount = remainingAfterSeizure;
                        startTrackPenaltyInterval();
                    } else {
                        stopTimer();
                    }
                } else {
                    stopTimer();
                }
            }
        }, 1000);
    }
    
    function startTrackPenaltyInterval() {
        if (trackPenaltyInterval) {
            clearTimeout(trackPenaltyInterval);
        }
        
        const scheduleNextPenalty = () => {
            const nextPenaltyTime = 2000 + Math.random() * 3000; // 2-5s
            
            trackPenaltyInterval = setTimeout(() => {
                if (loanActive && onTrackRemoved) {
                    const penaltyApplied = onTrackRemoved();  // true = kolej odebrána
                    
                    if (penaltyApplied) {
                        loanAmount = Math.max(0, loanAmount - 10);

                        if (window.bankManager && window.bankManager.setLoanAmount) {
                            window.bankManager.setLoanAmount(loanAmount);
                        }
                        onLoanUpdate();
                        
                        if (loanAmount <= 0) {
                            stopTimer();
                            return;
                        }
                    }
                    
                    scheduleNextPenalty();
                }
            }, nextPenaltyTime);
        };
        
        scheduleNextPenalty();
    }
    
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        if (trackPenaltyInterval) {
            clearTimeout(trackPenaltyInterval);
            trackPenaltyInterval = null;
        }
        loanActive = false;
        loanAmount = 0;
        timeRemaining = 0;
    }
    
    function getTimeRemaining() {
        return timeRemaining;
    }
    
    function getFormattedTime() {
        if (!loanActive) return "0:00";
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    function isActive() {
        return loanActive;
    }
    
    function getLoanAmount() {
        return loanAmount;
    }
    
    function reset() {
        stopTimer();
    }
    
    return {
        startTimer,
        stopTimer,
        getTimeRemaining,
        getFormattedTime,
        isActive,
        getLoanAmount,
        reset
    };
}