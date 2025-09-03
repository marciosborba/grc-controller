#!/usr/bin/env node

/**
 * Monitor de Performance em tempo real
 * Execute: node monitor-performance.js
 */

const { performance } = require('perf_hooks');

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTime = performance.now();
  }

  log(label, duration) {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label).push(duration);
    
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation: ${label} took ${duration.toFixed(2)}ms`);
    }
  }

  report() {
    console.log('\n📊 Performance Report:');
    console.log('='.repeat(50));
    
    this.metrics.forEach((times, label) => {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const max = Math.max(...times);
      const min = Math.min(...times);
      
      console.log(`${label}:`);
      console.log(`  Average: ${avg.toFixed(2)}ms`);
      console.log(`  Max: ${max.toFixed(2)}ms`);
      console.log(`  Min: ${min.toFixed(2)}ms`);
      console.log(`  Count: ${times.length}`);
      console.log('');
    });
    
    const totalTime = performance.now() - this.startTime;
    console.log(`Total monitoring time: ${totalTime.toFixed(2)}ms`);
  }
}

const monitor = new PerformanceMonitor();

console.log('🔍 Monitoring performance...');
console.log('Press Ctrl+C to stop and see report');

process.on('SIGINT', () => {
  monitor.report();
  process.exit(0);
});

setInterval(() => {
  const start = performance.now();
  setTimeout(() => {
    const end = performance.now();
    monitor.log('Simulated Operation', end - start);
  }, Math.random() * 100);
}, 1000);
