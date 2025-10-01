const config = {
    API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    PLANT_OF_DAY_ID: (() => {
        // Get current date in YYYYMMDD format
        const today = new Date();
        const dateString = today.getFullYear().toString() + 
                          (today.getMonth() + 1).toString().padStart(2, '0') + 
                          today.getDate().toString().padStart(2, '0');
        
        // Convert date string to a number and use it as a seed
        let seed = parseInt(dateString);
        
        // Use a larger multiplier to get better distribution
        seed = seed * 1234567;
        
        // Use modulo to get a number between 0 and 3000, then add 1
        const randomNum = (seed % 2999) + 1;
        
        return randomNum;
    })(),
    
    // Google API credentials
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    GOOGLE_DISCOVERY_DOC: process.env.GOOGLE_DISCOVERY_DOC,
    GOOGLE_SCOPES: process.env.GOOGLE_SCOPES,
};
export default config;