import { useState, useEffect } from "react";

/**
 * Polls the ETH balance of `account` every `intervalMs` milliseconds.
 * Returns balance as a string in ETH (e.g. "1.2345"), or null while loading.
 */
export function useWalletBalance(account, web3, intervalMs = 10000) {
    const [balance, setBalance] = useState(null);

    useEffect(() => {
        if (!account || !web3) return;

        let cancelled = false;

        const fetchBalance = async () => {
            try {
                const wei = await web3.eth.getBalance(account);
                if (!cancelled) {
                    const eth = Number(web3.utils.fromWei(wei, "ether"));
                    setBalance(eth.toFixed(4));
                }
            } catch (_) { }
        };

        fetchBalance();
        const id = setInterval(fetchBalance, intervalMs);
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [account, web3, intervalMs]);

    return balance;
}
