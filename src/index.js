const init = (serviceUrl = 'google.com') => {
  window.performanceAnalytics = {
    metrics: {
      fcp: null,
      ttfb: null,
      domLoad: null,
      windowLoad: null,
    }
  }

  const isPerformanceSupported = () => {
    return window.performance && window.performance.getEntriesByType && !!window.performance.timing
  }

  if (!isPerformanceSupported()) {
    return
  }

  const getPerformanceAnalytics = () => window.performanceAnalytics;

  const toSecond = value => value / 1000;

  const findFCPValue = () => {
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntriesByName('first-contentful-paint')) {
        console.log(toSecond(entry.startTime))
        window.performanceAnalytics.metrics["fcp"] = toSecond(entry.startTime);
      }
    }).observe({type: 'paint', buffered: true});

  }

  const onWindowLoad = () => {
    const timing = window?.performance?.timing
    const { metrics } = window.performanceAnalytics
    metrics.ttfb = toSecond(timing.responseStart - timing.requestStart)
    metrics.domLoad = toSecond(timing.domContentLoadedEventEnd - timing.navigationStart)
    metrics.windowLoad = toSecond(new Date().valueOf() - timing.navigationStart)
    metrics.navigation_started_at = new Date(timing.navigationStart).toString()
    findFCPValue();
    console.log(getPerformanceAnalytics().metrics)
    
  }
  
  window.onload = onWindowLoad;
  window.addEventListener("unload", function sendMetrics() {
    navigator.sendBeacon(`${serviceUrl}`, JSON.stringify(getPerformanceAnalytics().metrics));
  });
}
