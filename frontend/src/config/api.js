// API Configuration
// Change this to your computer's IP address when using on multiple devices
// To find your IP: Run 'ipconfig' in terminal and look for IPv4 Address

const USE_NETWORK = true; // Set to false for localhost only

// For production (Render), use environment variable
// For development, use network or localhost based on USE_NETWORK
export const API_BASE_URL = import.meta.env.VITE_API_URL ||
    (USE_NETWORK
        ? 'http://192.168.100.236:5000'  // Network access (multiple devices)
        : 'http://localhost:5000');       // Local access only

export default API_BASE_URL;
