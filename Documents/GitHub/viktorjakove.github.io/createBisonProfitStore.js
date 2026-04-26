export function createBisonProfitStore() {
    let storedProfit = 0;
    
    function addProfit(amount) {
        if (amount > 0) {
            storedProfit += amount;
        }
    }
    
    function withdrawProfit(addMoneyCallback) {
        if (storedProfit > 0) {
            addMoneyCallback(storedProfit);
            const withdrawn = storedProfit;
            storedProfit = 0;
            return withdrawn;
        }
        return 0;
    }
    
    function getStoredProfit() {
        return storedProfit;
    }
    
    return {
        addProfit,
        withdrawProfit,
        getStoredProfit
    };
}