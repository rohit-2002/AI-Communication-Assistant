// Simple logging utility

class Logger {
    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
    }

    info(message, data = null) {
        console.log(`ℹ️  [INFO] ${new Date().toISOString()} - ${message}`);
        if (data && this.isDevelopment) {
            console.log('   Data:', data);
        }
    }

    error(message, error = null) {
        console.error(`❌ [ERROR] ${new Date().toISOString()} - ${message}`);
        if (error) {
            console.error('   Error:', error.message);
            if (this.isDevelopment && error.stack) {
                console.error('   Stack:', error.stack);
            }
        }
    }

    warn(message, data = null) {
        console.warn(`⚠️  [WARN] ${new Date().toISOString()} - ${message}`);
        if (data && this.isDevelopment) {
            console.warn('   Data:', data);
        }
    }

    debug(message, data = null) {
        if (this.isDevelopment) {
            console.log(`🐛 [DEBUG] ${new Date().toISOString()} - ${message}`);
            if (data) {
                console.log('   Data:', data);
            }
        }
    }

    success(message, data = null) {
        console.log(`✅ [SUCCESS] ${new Date().toISOString()} - ${message}`);
        if (data && this.isDevelopment) {
            console.log('   Data:', data);
        }
    }
}

export default new Logger();