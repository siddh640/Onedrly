/**
 * API Optimizer - Performance enhancements for API calls
 * 
 * Features:
 * 1. Request timeouts - Prevent slow APIs from blocking
 * 2. Circuit breaker - Stop calling failing APIs temporarily
 * 3. Retry logic with exponential backoff
 * 4. Priority-based execution
 * 5. Response time tracking
 */

const axios = require('axios');

class APIOptimizer {
  constructor() {
    // Circuit breaker state for each API
    this.circuitBreakers = new Map();
    
    // Performance metrics for each API
    this.metrics = new Map();
    
    // Default configuration
    this.config = {
      timeout: 5000, // 5 seconds default timeout
      retries: 2,
      circuitBreakerThreshold: 5, // Failures before opening circuit
      circuitBreakerTimeout: 60000, // 1 minute cooldown
      priorityTimeout: 3000 // Higher priority gets more time
    };
  }

  /**
   * Make an optimized API call with timeout and circuit breaker
   */
  async makeRequest(apiName, requestFn, options = {}) {
    const timeout = options.timeout || this.config.timeout;
    const priority = options.priority || 2; // 1 = high, 2 = medium, 3 = low
    
    // Check circuit breaker
    if (this.isCircuitOpen(apiName)) {
      console.log(`⚠️ Circuit breaker OPEN for ${apiName}, skipping...`);
      throw new Error(`Circuit breaker open for ${apiName}`);
    }

    const startTime = Date.now();
    
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
      });

      // Race between actual request and timeout
      const result = await Promise.race([
        requestFn(),
        timeoutPromise
      ]);

      // Record success
      const duration = Date.now() - startTime;
      this.recordSuccess(apiName, duration);
      
      console.log(`✅ ${apiName} completed in ${duration}ms`);
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordFailure(apiName, duration);
      
      console.error(`❌ ${apiName} failed after ${duration}ms:`, error.message);
      throw error;
    }
  }

  /**
   * Execute multiple API calls with priority
   * High priority APIs are called first, then medium, then low
   */
  async executeWithPriority(requests) {
    const highPriority = requests.filter(r => r.priority === 1);
    const mediumPriority = requests.filter(r => r.priority === 2);
    const lowPriority = requests.filter(r => r.priority === 3);

    const results = [];

    // Execute high priority first (sequential for fastest response)
    for (const req of highPriority) {
      try {
        const result = await this.makeRequest(req.name, req.fn, { 
          timeout: this.config.priorityTimeout,
          priority: 1 
        });
        results.push({ name: req.name, success: true, data: result });
        
        // If we got a good result from high priority, we can skip others
        if (req.skipOthersOnSuccess && result) {
          console.log(`✅ Got result from high-priority ${req.name}, skipping lower priority`);
          return results;
        }
      } catch (error) {
        results.push({ name: req.name, success: false, error: error.message });
      }
    }

    // Execute medium priority in parallel
    if (mediumPriority.length > 0) {
      const mediumResults = await Promise.allSettled(
        mediumPriority.map(req => 
          this.makeRequest(req.name, req.fn, { timeout: this.config.timeout, priority: 2 })
            .then(data => ({ name: req.name, success: true, data }))
            .catch(error => ({ name: req.name, success: false, error: error.message }))
        )
      );
      
      mediumResults.forEach(r => {
        if (r.status === 'fulfilled') results.push(r.value);
      });
    }

    // Execute low priority only if needed
    if (lowPriority.length > 0 && results.filter(r => r.success).length === 0) {
      const lowResults = await Promise.allSettled(
        lowPriority.map(req => 
          this.makeRequest(req.name, req.fn, { timeout: this.config.timeout * 1.5, priority: 3 })
            .then(data => ({ name: req.name, success: true, data }))
            .catch(error => ({ name: req.name, success: false, error: error.message }))
        )
      );
      
      lowResults.forEach(r => {
        if (r.status === 'fulfilled') results.push(r.value);
      });
    }

    return results;
  }

  /**
   * Check if circuit breaker is open for an API
   */
  isCircuitOpen(apiName) {
    const breaker = this.circuitBreakers.get(apiName);
    if (!breaker) return false;

    if (breaker.state === 'open') {
      const now = Date.now();
      if (now - breaker.openedAt > this.config.circuitBreakerTimeout) {
        // Try to close circuit (half-open state)
        breaker.state = 'half-open';
        breaker.failures = 0;
        console.log(`🔄 Circuit breaker for ${apiName} now HALF-OPEN (testing)`);
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Record successful API call
   */
  recordSuccess(apiName, duration) {
    // Update circuit breaker
    const breaker = this.circuitBreakers.get(apiName) || {
      state: 'closed',
      failures: 0,
      openedAt: null
    };
    
    if (breaker.state === 'half-open') {
      breaker.state = 'closed';
      console.log(`✅ Circuit breaker for ${apiName} now CLOSED (recovered)`);
    }
    
    breaker.failures = 0;
    this.circuitBreakers.set(apiName, breaker);

    // Update metrics
    const metrics = this.metrics.get(apiName) || {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalDuration: 0,
      avgDuration: 0
    };

    metrics.totalRequests++;
    metrics.successfulRequests++;
    metrics.totalDuration += duration;
    metrics.avgDuration = metrics.totalDuration / metrics.totalRequests;

    this.metrics.set(apiName, metrics);
  }

  /**
   * Record failed API call
   */
  recordFailure(apiName, duration) {
    // Update circuit breaker
    const breaker = this.circuitBreakers.get(apiName) || {
      state: 'closed',
      failures: 0,
      openedAt: null
    };
    
    breaker.failures++;
    
    if (breaker.failures >= this.config.circuitBreakerThreshold) {
      breaker.state = 'open';
      breaker.openedAt = Date.now();
      console.log(`🔴 Circuit breaker for ${apiName} now OPEN (too many failures)`);
    }
    
    this.circuitBreakers.set(apiName, breaker);

    // Update metrics
    const metrics = this.metrics.get(apiName) || {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalDuration: 0,
      avgDuration: 0
    };

    metrics.totalRequests++;
    metrics.failedRequests++;

    this.metrics.set(apiName, metrics);
  }

  /**
   * Get performance metrics for all APIs
   */
  getMetrics() {
    const metricsObj = {};
    
    this.metrics.forEach((metrics, apiName) => {
      const breaker = this.circuitBreakers.get(apiName);
      metricsObj[apiName] = {
        ...metrics,
        successRate: metrics.totalRequests > 0 
          ? ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2) + '%'
          : '0%',
        circuitBreakerState: breaker?.state || 'closed'
      };
    });

    return metricsObj;
  }

  /**
   * Reset metrics and circuit breakers (for testing)
   */
  reset() {
    this.circuitBreakers.clear();
    this.metrics.clear();
  }

  /**
   * Create an optimized axios instance with timeout
   */
  createAxiosInstance(timeout = 5000) {
    return axios.create({
      timeout,
      headers: {
        'User-Agent': 'Onedrly-App/1.0',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Retry with exponential backoff
   */
  async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        const delay = baseDelay * Math.pow(2, i);
        console.log(`⏱️ Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

// Singleton instance
const apiOptimizer = new APIOptimizer();

module.exports = apiOptimizer;

